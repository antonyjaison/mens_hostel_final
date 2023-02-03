import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyANXPIL9Gh7QSlalprTDLbGKfPmYJaV0Ho",
  authDomain: "mens-hostel2.firebaseapp.com",
  projectId: "mens-hostel2",
  storageBucket: "mens-hostel2.appspot.com",
  messagingSenderId: "485559909104",
  appId: "1:485559909104:web:898da89ecc0a2ca5bc2035"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
