// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDNbiqFmkN5c4vhaEQvTwyijZAUTGW06DU",
  authDomain: "bodegakuky-fff7f.firebaseapp.com",
  projectId: "bodegakuky-fff7f",
  storageBucket: "bodegakuky-fff7f.firebasestorage.app",
  messagingSenderId: "126457203747",
  appId: "1:126457203747:web:69bb17dc0dad0ee72cb596",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage(app);

export { auth, app, db, storage };
