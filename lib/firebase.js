import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDylAS54U4l9fHaBUlQxk_ZNiufBnaqW4Q",
  authDomain: "docread-1c0b8.firebaseapp.com",
  projectId: "docread-1c0b8",
  storageBucket: "docread-1c0b8.appspot.com",
  messagingSenderId: "274091548440",
  appId: "1:274091548440:web:fd959ee1daf9f37f0a486d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth, RecaptchaVerifier };
