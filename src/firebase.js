// src/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAYlRT5UifWz0d00efRfuIYBQ6evQkwCL4",
  authDomain: "aftermath-frontend.firebaseapp.com",
  projectId: "aftermath-frontend",
  storageBucket: "aftermath-frontend.appspot.com",
  messagingSenderId: "505738953344",
  appId: "1:505738953344:web:58829746e6a7a65fd11c65"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
