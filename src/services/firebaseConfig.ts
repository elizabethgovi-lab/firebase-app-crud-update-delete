import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyAb3F3p0GcVE8sGcIk3S479yzo68LcsbjI",
  authDomain: "crud-react-native-1ab56.firebaseapp.com",
  databaseURL: "https://crud-react-native-1ab56-default-rtdb.firebaseio.com",
  projectId: "crud-react-native-1ab56",
  storageBucket: "crud-react-native-1ab56.firebasestorage.app",
  messagingSenderId: "850332853187",
  appId: "1:850332853187:web:a6302720d32327214fd376"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);
