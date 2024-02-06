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
    const docRef = await addDoc(collection(db, 'edits'), data);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}
