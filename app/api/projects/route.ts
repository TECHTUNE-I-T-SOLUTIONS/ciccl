import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Image from '@/lib/models/Image';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const projectType = searchParams.get('type');
    const hashtag = searchParams.get('hashtag');
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '12');

    // detect admin via Authorization header or auth cookie so admins can list unpublished projects
    const authHeader = request.headers.get('authorization');
    let isAdmin = false;
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // fallback: try cookie named 'authToken'
      try {
        const cookie = request.cookies?.get?.('authToken')?.value;
        if (cookie) token = cookie;
      } catch (e) {
        // ignore cookie read errors
      }
    }

    if (token) {
      const user = verifyToken(token);
      if (user && user.role === 'admin') isAdmin = true;
    }

    // default query: only published for public users, but admins can see all
    let query: any = isAdmin ? {} : { isPublished: true };

    if (featured === 'true') query.isFeatured = true;
    // treat type=all as no projectType filter (useful for admin listing)
    if (projectType && projectType !== 'all') query.projectType = projectType;
    if (hashtag) query.hashtags = hashtag;

    // return plain objects to avoid Mongoose document serialization issues
    // exclude heavy image/document arrays for list performance and stability
    const projects = await Project.find(query)
      .select('-images -documents')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Project.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: projects,
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
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let uploadedImageIds: Array<any> = [];
  try {
    await connectDB();

    // Check auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';

    // helper to parse either JSON array or comma-separated values
    const parseArrayField = (val?: string | null) => {
      if (!val) return [];
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // fallthrough
      }
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    };

    let title = '';
    let slug = '';
    let shortSummary = '';
    let description = '';
    let projectType = '';
    let budgetMin = 0;
    let budgetMax = 0;
    let currency = 'NGN';
    let timelineStart: string | null = null;
    let timelineEnd: string | null = null;
    let features: string[] = [];
    let problemsSolved: string[] = [];
    let deliverables: string[] = [];
    let hashtags: string[] = [];
    let existingImages: string[] = [];
    let coverImage: string | null = null;

    let files: File[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = formData.get('title')?.toString() || '';
      slug = formData.get('slug')?.toString() || '';
      shortSummary = formData.get('shortSummary')?.toString() || '';
      description = formData.get('description')?.toString() || '';
      projectType = formData.get('projectType')?.toString() || '';
      budgetMin = Number(formData.get('budgetMin')?.toString() || 0);
      budgetMax = Number(formData.get('budgetMax')?.toString() || 0);
      currency = formData.get('currency')?.toString() || 'NGN';
      timelineStart = formData.get('timelineStart')?.toString() || null;
      timelineEnd = formData.get('timelineEnd')?.toString() || null;
      features = parseArrayField(formData.get('features')?.toString());
      problemsSolved = parseArrayField(formData.get('problemsSolved')?.toString());
      deliverables = parseArrayField(formData.get('deliverables')?.toString());
      hashtags = parseArrayField(formData.get('hashtags')?.toString());
      coverImage = formData.get('coverImage')?.toString() || null;

      const existing = formData.get('existingImages')?.toString();
      try {
        existingImages = existing ? JSON.parse(existing) : [];
      } catch (e) {
        existingImages = existing ? existing.split(',').map(s => s.trim()).filter(Boolean) : [];
      }

      const fileEntries = formData.getAll('files') as File[];
      files = Array.isArray(fileEntries) ? fileEntries : [];
    } else {
      const body = await request.json();
      title = body.title || '';
      slug = body.slug || '';
      shortSummary = body.shortSummary || '';
      description = body.description || '';
      projectType = body.projectType || '';
      budgetMin = Number(body?.budgetScope?.min || 0);
      budgetMax = Number(body?.budgetScope?.max || 0);
      currency = body?.budgetScope?.currency || 'NGN';
      timelineStart = body?.timeline?.startDate || null;
      timelineEnd = body?.timeline?.endDate || null;
      features = body.features || [];
      problemsSolved = body.problemsSolved || [];
      deliverables = body.deliverables || [];
      hashtags = body.hashtags || [];
      existingImages = body.existingImages || [];
      coverImage = body.coverImage || null;
      files = [];
    }

    // upload any new files to the Image collection
    const uploadedImages: any[] = [];
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const url = `data:${file.type};base64,${base64}`;
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const uniqueFilename = `${timestamp}-${randomSuffix}-${file.name}`;

      const image = new Image({
        fileName: uniqueFilename,
        filename: uniqueFilename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        uploadedAt: new Date(),
      });

      try {
        await image.save();
        uploadedImages.push(image);
        uploadedImageIds.push(image._id);
      } catch (saveError: any) {
        // If there's a duplicate key error, try with a different filename
        if (saveError.code === 11000) {
          const retryFilename = `${timestamp}-${randomSuffix}-${randomSuffix}-${file.name}`;
          image.fileName = retryFilename;
          image.filename = retryFilename;
          await image.save();
          uploadedImages.push(image);
          uploadedImageIds.push(image._id);
        } else {
          throw saveError;
        }
      }
    }

    const images = [...(existingImages || []), ...uploadedImages.map((i) => i.url)];

    const projectPayload: any = {
      title,
      slug,
      shortSummary,
      description,
      coverImage: coverImage || images[0] || null,
      images,
      problemsSolved,
      features,
      budgetScope: { min: budgetMin, max: budgetMax, currency },
      timeline: { startDate: timelineStart || null, endDate: timelineEnd || null },
      deliverables,
      hashtags,
      projectType,
      isFeatured: false,
      isPublished: true,
    };

    const project = await Project.create(projectPayload);

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create project error:', error);
    // cleanup uploaded images if project creation failed
    try {
      if (uploadedImageIds && uploadedImageIds.length > 0) {
        await Image.deleteMany({ _id: { $in: uploadedImageIds } });
      }
    } catch (cleanupErr) {
      console.error('Failed to cleanup uploaded images:', cleanupErr);
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 400 }
    );
  }
}
