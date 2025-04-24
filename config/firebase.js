// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpBWrW0I_XRgm92maxDTrTKnE-vfT9lnc",
  authDomain: "automated-air-purifier-project.firebaseapp.com",
  projectId: "automated-air-purifier-project",
  storageBucket: "automated-air-purifier-project.firebasestorage.app",
  messagingSenderId: "767161415365",
  appId: "1:767161415365:web:2a8ed4926ee80e5f85a2ac",
  measurementId: "G-KY2FT1BGRY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {firebaseConfig, app, db}