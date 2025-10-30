import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, getDoc, setDoc } from 'firebase/firestore';
import { TestCase } from '@/lib/types';

export interface FirebaseSaveResult {
  success: boolean;
  message: string;
  testCasesCount?: number;
}

export interface FirebaseLoadResult {
  success: boolean;
  message: string;
  testCases?: TestCase[];
}

// Save test cases to Firebase for the current user
export async function saveTestCasesToFirebase(testCases: TestCase[], userId: string): Promise<FirebaseSaveResult> {
  try {
    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }

    // Check if user document exists, if not create it
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        id: userId,
        createdAt: new Date(),
        lastActive: new Date(),
      });
    }

    // Delete existing test cases for this user first (for simplicity)
    // In a real app, you might want to update individual test cases
    const existingTestCasesQuery = query(collection(db, `users/${userId}/testCases`));
    const existingTestCases = await getDocs(existingTestCasesQuery);
    
    // Delete all existing test cases
    const deletePromises = existingTestCases.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Add the new test cases
    const addPromises = testCases.map(testCase => 
      addDoc(collection(db, `users/${userId}/testCases`), {
        ...testCase,
        createdAt: testCase.createdAt ? new Date(testCase.createdAt) : new Date(),
        updatedAt: new Date(),
      })
    );
    
    await Promise.all(addPromises);

    return { 
      success: true, 
      message: `Successfully saved ${testCases.length} test cases to cloud storage`,
      testCasesCount: testCases.length
    };
  } catch (error) {
    console.error('Error saving test cases to Firebase:', error);
    return { 
      success: false, 
      message: 'Failed to save test cases to cloud storage' 
    };
  }
}

// Load test cases from Firebase for the current user
export async function loadTestCasesFromFirebase(userId: string): Promise<FirebaseLoadResult> {
  try {
    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }

    // Get test cases for the user
    const q = query(collection(db, `users/${userId}/testCases`));
    const querySnapshot = await getDocs(q);
    
    const testCases: TestCase[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      testCases.push({
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as TestCase);
    });

    return { 
      success: true, 
      message: `Successfully loaded ${testCases.length} test cases from cloud storage`,
      testCases: testCases
    };
  } catch (error) {
    console.error('Error loading test cases from Firebase:', error);
    return { 
      success: false, 
      message: 'Failed to load test cases from cloud storage' 
    };
  }
}