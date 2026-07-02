import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_API = 'https://api.paystack.co';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query: any = {};
    if (user.role === 'client') {
      query.clientId = user.userId;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: payments,
        pagination: {
          total,
          skip,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      serviceType,
      packageType,
      amount,
      projectDetails,
      clientName,
      clientEmail,
      clientPhone,
      paymentMethod,
    } = body;

    if (!amount || !clientEmail || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transactionRef = uuidv4();

    // Create payment record - only include clientId if provided
    const paymentData: any = {
      serviceType: serviceType || 'General Service',
      packageType: packageType || 'Standard',
      amount,
      currency: 'NGN',
      paymentMethod,
      transactionRef,
      status: 'pending',
      projectDetails: projectDetails || { name: 'Project', description: '' },
      clientEmail,
      clientName,
      clientPhone,
    };
    if (body.clientId) {
      paymentData.clientId = body.clientId;
    }
    const payment = await Payment.create(paymentData);

    if (paymentMethod === 'paystack') {
      // Initialize Paystack payment
      const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
        body: JSON.stringify({
          email: clientEmail,
          amount: amount * 100, // Paystack uses cents
          reference: transactionRef,
          metadata: {
            clientName,
            serviceType,
            packageType,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize Paystack payment');
      }

      const data = await response.json();
      payment.paystackReference = data.data.reference;
      await payment.save();

      return NextResponse.json(
        {
          success: true,
          data: payment,
          paymentUrl: data.data.authorization_url,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 400 }
    );
  }
}
