import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { verifyToken } from '@/lib/auth';

// Get approved reviews
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '12');

    const reviews = await Review.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ status: 'approved' });

    return NextResponse.json(
      {
        success: true,
        data: reviews,
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
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// Submit review
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const review = await Review.create({
      ...body,
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: 'Review submitted for approval',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 400 }
    );
  }
}
