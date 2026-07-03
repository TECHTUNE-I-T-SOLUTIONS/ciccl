import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/auth.server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('securityQuestion');
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      securityQuestion: user.securityQuestion,
    });
  } catch (error: any) {
    console.error('Recovery verify error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, securityAnswer, newPassword, confirmPassword } = body;

    if (!email || !securityAnswer || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify security answer
    if (user.securityAnswer !== securityAnswer.toLowerCase().trim()) {
      return NextResponse.json(
        { error: 'Security answer is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id.toString(), user.email, user.role);
    
    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successful',
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Recovery error:', error);
    return NextResponse.json(
      { error: error.message || 'Recovery failed' },
      { status: 400 }
    );
  }
}