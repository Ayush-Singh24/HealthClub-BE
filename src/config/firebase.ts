import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  appId: process.env.appId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  projectId: process.env.projectId,
};

export const fapp: FirebaseApp = initializeApp(firebaseConfig);
export const fstorage: FirebaseStorage = getStorage();
