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

// Helper function to clean test case object for Firestore
function cleanTestCaseForFirestore(testCase: TestCase) {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(testCase)) {
    // Don't include undefined values in the Firestore document
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
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

    // Add the new test cases, filtering out undefined values
    const addPromises = testCases.map(testCase => 
      addDoc(collection(db, `users/${userId}/testCases`), {
        ...cleanTestCaseForFirestore(testCase),
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
      // Ensure all required fields are present and handle potential undefined values
      testCases.push({
        id: data.id || doc.id, // Use document ID if not present in data
        caseId: data.caseId || 'TC-' + Date.now().toString().slice(-6), // Generate default caseId if missing
        title: data.title || 'Untitled Test Case',
        description: data.description || '',
        testSteps: Array.isArray(data.testSteps) ? data.testSteps : [],
        expectedResults: data.expectedResults || '',
        priority: data.priority || 'Medium',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
        version: data.version || 1,
        // Only include requirementsTrace if it exists and is not empty
        ...(data.requirementsTrace !== undefined && data.requirementsTrace !== null && data.requirementsTrace !== '' && { requirementsTrace: data.requirementsTrace }),
        // Only include feedback if it exists
        ...(data.feedback && { feedback: data.feedback }),
      });
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