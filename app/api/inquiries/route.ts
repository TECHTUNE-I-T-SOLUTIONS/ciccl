import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Inquiry from '@/lib/models/Inquiry';
import qs from 'qs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, phone, projectType, budgetRange, message } = body;

    // Validate input
    if (!name || !email || !phone || !projectType || !budgetRange || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create inquiry
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      projectType,
      budgetRange,
      message,
      whatsappSent: false,
    });

    // Prepare WhatsApp message
    const whatsappMessage = `
Hello Alex,

I am interested in your services.

Name: ${name}
Email: ${email}
Phone: ${phone}
Project Type: ${projectType}
Budget Range: ${budgetRange}

Message:
${message}

Please get back to me soon.
    `.trim();

    const encodedMessage = qs.stringify({ text: whatsappMessage });
    const whatsappUrl = `https://wa.me/2347034356398?${encodedMessage}`;

    return NextResponse.json(
      {
        success: true,
        data: inquiry,
        whatsappUrl,
        message: 'Inquiry submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create inquiry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit inquiry' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    const inquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inquiry.countDocuments();

    return NextResponse.json(
      {
        success: true,
        data: inquiries,
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
    console.error('Get inquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
