import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Analytics from '@/lib/models/Analytics';
import Review from '@/lib/models/Review';
import Payment from '@/lib/models/Payment';
import Client from '@/lib/models/Client';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { ipAddress, route, referrer, deviceType } = body;

    if (!ipAddress || !route) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if this IP already visited this route today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingVisit = await Analytics.findOne({
      ipAddress,
      route,
      timestamp: { $gte: today },
    });

    const isUnique = !existingVisit;

    // Create analytics record
    await Analytics.create({
      ipAddress,
      route,
      referrer,
      deviceType: deviceType || 'desktop',
      isUnique,
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Analytics recorded',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Analytics error:', error);
    // Don't fail the request if analytics fails
    return NextResponse.json(
      { success: true, message: 'Analytics recorded' },
      { status: 201 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check auth
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
    if (!token) token = request.cookies.get('authToken')?.value || null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get visitor data
    const totalVisits = await Analytics.countDocuments({
      timestamp: { $gte: thirtyDaysAgo },
    });

    const uniqueVisitors = await Analytics.distinct('ipAddress', {
      timestamp: { $gte: thirtyDaysAgo },
      isUnique: true,
    });

    // Get pending reviews
    const pendingReviews = await Review.countDocuments({ status: 'pending' });

    // Get pending client project requests (client submissions waiting admin pick)
    const pendingClients = await Client.countDocuments({ status: 'pending' });

    // Get pending project edits/drafts in real project model
    const pendingProjects = await (await import('@/lib/models/Project')).default.countDocuments({ isPublished: false });

    // Get revenue for selected period
    const successfulPayments = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // const totalRevenue = successfulPayments[0]?.total || 0;

    // Device breakdown and page views
    const deviceTypes = await Analytics.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $project: { _id: 0, device: '$_id', count: 1 } },
    ]);

    const pageViews = await Analytics.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$route', views: { $sum: 1 } } },
      { $project: { _id: 0, page: '$_id', views: 1 } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);

    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    // Monthly breakdown
    const monthlyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayVisits = await Analytics.countDocuments({
        timestamp: { $gte: date, $lt: nextDate },
      });

      const dayRevenue = await Payment.aggregate([
        {
          $match: {
            status: 'success',
            createdAt: { $gte: date, $lt: nextDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      monthlyData.push({
        date: date.toISOString().split('T')[0],
        visits: dayVisits,
        revenue: dayRevenue[0]?.total || 0,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          totalVisits,
          uniqueVisitors: uniqueVisitors.length,
          pendingReviews,
          pendingClientSubmissions: pendingClients,
          pendingProjects,
          totalRevenue,
          deviceTypes,
          pageViews,
          monthlyData,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
