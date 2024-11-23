// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZn5LWrjhxJUoICVN4nu5pvv55kvnkx5Y",
  authDomain: "whatsapp-2ce85.firebaseapp.com",
  databaseURL: "https://whatsapp-2ce85-default-rtdb.firebaseio.com",
  projectId: "whatsapp-2ce85",
  storageBucket: "whatsapp-2ce85.firebasestorage.app",
  messagingSenderId: "314104395051",
  appId: "1:314104395051:web:a8e4c53547bbd96275816e"
};

// Initialize Firebase
const firebase = app.initializeApp(firebaseConfig);
export default firebase;
