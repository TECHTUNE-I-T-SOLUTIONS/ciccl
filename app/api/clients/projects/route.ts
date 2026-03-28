import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Client from '@/lib/models/Client';
import { verifyToken } from '@/lib/auth';

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

    const projects = await Client.find({ userId: user.userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: projects,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get client projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const project = await Client.create({
      ...body,
      userId: user.userId,
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        data: project,
        message: 'Project submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create client project error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit project' },
      { status: 400 }
    );
  }
}
