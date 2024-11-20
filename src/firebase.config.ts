// src/firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyB-FADOYIBtUxpxjmSTEA6nz9GpzN9jiY8',
  authDomain: 'e-tracker-5aa39.firebaseapp.com',
  projectId: 'e-tracker-5aa39',
  storageBucket: 'e-tracker-5aa39.appspot.com',
  messagingSenderId: '702590991455',
  appId: '1:702590991455:web:ca77f1d2a96dfcbdb22fea',
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
