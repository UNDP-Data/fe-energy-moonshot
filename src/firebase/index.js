import { initializeApp } from 'firebase/app';
import { collection, addDoc, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBzPopNjJAfYiYOmPQAt0VfST1UgfzSWS8',
  authDomain: 'energy-moonshot-tracker.firebaseapp.com',
  projectId: 'energy-moonshot-tracker',
  storageBucket: 'energy-moonshot-tracker.appspot.com',
  messagingSenderId: '618611045979',
  appId: '1:618611045979:web:805e36dd1ce4099906317e',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get a list of cities from your database
export async function addProposedEdit(data) {
  try {
    await addDoc(collection(db, 'edits'), data);
  } catch (e) {
    console.warn(e);
  }
}

export async function createNewComment(data) {
  try {
    await addDoc(collection(db, 'comments'), data);
  } catch (e) {
    console.warn(e);
  }
}
