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

    const contentType = request.headers.get('content-type');
    let body: any;

    // Handle FormData (multipart/form-data) for file uploads
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {};
      
      // Extract all form fields
      for (const [key, value] of formData.entries()) {
        if (key === 'files') continue; // Handle files separately
        body[key] = value;
      }

      // Parse JSON fields
      const jsonFields = ['features', 'problemsSolved', 'deliverables', 'hashtags', 'existingImages'];
      for (const field of jsonFields) {
        if (body[field]) {
          try {
            body[field] = JSON.parse(body[field]);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
      }

      // Parse budget and timeline
      if (body.budgetMin || body.budgetMax || body.currency) {
        body.budgetScope = {
          min: body.budgetMin ? Number(body.budgetMin) : 0,
          max: body.budgetMax ? Number(body.budgetMax) : 0,
          currency: body.currency || 'NGN',
        };
        delete body.budgetMin;
        delete body.budgetMax;
        delete body.currency;
      }

      if (body.timelineStart || body.timelineEnd) {
        body.timeline = {
          startDate: body.timelineStart || '',
          endDate: body.timelineEnd || '',
        };
        delete body.timelineStart;
        delete body.timelineEnd;
      }

      // Parse boolean fields
      if (body.isPublished) body.isPublished = body.isPublished === 'true';
      if (body.isFeatured) body.isFeatured = body.isFeatured === 'true';

      // Handle file uploads
      const fileEntries = formData.getAll('files') as File[];
      const files = Array.isArray(fileEntries) ? fileEntries : [];
      const uploadedImages: any[] = [];

      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const url = `data:${file.type};base64,${base64}`;
        
        const image = new Image({
          fileName: file.name,
          url,
          size: file.size,
          mimeType: file.type,
        });
        await image.save();
        uploadedImages.push(image);
      }

      // Combine existing images with newly uploaded images
      const existingImages = body.existingImages || [];
      body.images = [...existingImages, ...uploadedImages.map((i) => i.url)];
      delete body.existingImages;
    } else {
      // Handle JSON body
      body = await request.json();
    }

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
