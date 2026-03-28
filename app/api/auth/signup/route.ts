import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/auth.server';
import { signupSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = signupSchema.parse(body);

    // Check if user exists
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.password);

    // Create user
    const user = await User.create({
      email: validated.email,
      password: hashedPassword,
      name: validated.name,
      securityQuestion: validated.securityQuestion,
      securityAnswer: validated.securityAnswer.toLowerCase().trim(),
      role: body.role || 'client',
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);
    
    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 400 }
    );
  }
}
