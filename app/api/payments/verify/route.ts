import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_API = 'https://api.paystack.co';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Verify with Paystack
    const response = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();

    if (data.data.status === 'success') {
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { transactionRef: reference },
        {
          status: 'success',
          paystackReference: reference,
        },
        { new: true }
      );

      return NextResponse.json(
        {
          success: true,
          data: payment,
          message: 'Payment verified successfully',
        },
        { status: 200 }
      );
    } else {
      // Update as failed
      await Payment.findOneAndUpdate(
        { transactionRef: reference },
        { status: 'failed' },
        { new: true }
      );

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 400 }
    );
  }
}
