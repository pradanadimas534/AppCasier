import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyCl59beIK18vV3ZCFbJBMenYdQcIehI7uo',
  appId: '1:19959687372:web:f755a88f5140cb74323a69',
  messagingSenderId: '19959687372',
  projectId: 'ertyu-yhd0298',
  authDomain: 'ertyu-yhd0298.firebaseapp.com',
  storageBucket: 'ertyu-yhd0298.firebasestorage.app',
};

export const GOOGLE_SERVER_CLIENT_ID =
  '19959687372-ssoq87ktac1ngl3kc5bbgl2iei2douta.apps.googleusercontent.com';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
