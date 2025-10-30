import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (!email || !password || !action) {
      return NextResponse.json({ error: 'Missing email, password, or action' }, { status: 400 });
    }

    let result;
    if (action === 'login') {
      result = await signInWithEmailAndPassword(auth, email, password);
    } else if (action === 'signup') {
      result = await createUserWithEmailAndPassword(auth, email, password);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const idToken = await result.user.getIdToken();

    return NextResponse.json({ 
      user: { 
        uid: result.user.uid, 
        email: result.user.email 
      },
      token: idToken 
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await signOut(auth);
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}