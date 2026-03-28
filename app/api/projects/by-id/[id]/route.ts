import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Image from '@/lib/models/Image';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    const project = await Project.findById(id).lean();
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (err: any) {
    console.error('Get project error:', err);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();

    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
    if (!token) token = request.cookies.get('authToken')?.value || null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();

    const allowedUpdates: any = {};
    const fields = [
      'title',
      'slug',
      'shortSummary',
      'description',
      'projectType',
      'coverImage',
      'images',
      'problemsSolved',
      'features',
      'deliverables',
      'hashtags',
      'isFeatured',
      'isPublished',
      'budgetScope',
      'timeline',
    ];

    for (const f of fields) {
      if (body[f] !== undefined) allowedUpdates[f] = body[f];
    }

    const updated = await Project.findByIdAndUpdate(id, allowedUpdates, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err: any) {
    console.error('Update project error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update project' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();

    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
    if (!token) token = request.cookies.get('authToken')?.value || null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    // delete project
    const proj = await Project.findByIdAndDelete(id).lean();
    if (!proj) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // optionally cleanup images referenced by project (leave as-is for now)

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('Delete project error:', err);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
