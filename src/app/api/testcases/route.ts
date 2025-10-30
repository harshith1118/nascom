import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the user token from headers (for authentication)
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user ID (simplified - you'd use Firebase Admin SDK in production)
    // For now, we'll skip detailed token verification to keep it simple
    
    const { testCases, userId } = await request.json();

    if (!testCases || !userId) {
      return NextResponse.json({ error: 'Missing testCases or userId' }, { status: 400 });
    }

    // Check if user document exists, if not create it
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      // Create user document if it doesn't exist
      await addDoc(collection(db, 'users'), {
        id: userId,
        createdAt: new Date(),
        lastActive: new Date(),
      });
    }

    // Add test cases to the user's collection
    for (const testCase of testCases) {
      await addDoc(collection(db, `users/${userId}/testCases`), {
        ...testCase,
        createdAt: testCase.createdAt || new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ 
      message: 'Test cases saved successfully',
      count: testCases.length 
    });
  } catch (error) {
    console.error('Error saving test cases:', error);
    return NextResponse.json({ error: 'Failed to save test cases' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the user token from headers
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get test cases for the user
    const q = query(collection(db, `users/${userId}/testCases`));
    const querySnapshot = await getDocs(q);
    
    const testCases = [];
    querySnapshot.forEach((doc) => {
      testCases.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ testCases });
  } catch (error) {
    console.error('Error fetching test cases:', error);
    return NextResponse.json({ error: 'Failed to fetch test cases' }, { status: 500 });
  }
}