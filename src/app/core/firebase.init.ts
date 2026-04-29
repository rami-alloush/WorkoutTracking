import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(environment.firebase);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (Capacitor.isNativePlatform()) {
      // On native WKWebView / Android WebView the capacitor:// (or http://localhost) scheme
      // breaks the default browserLocalPersistence + popup redirect resolver wiring used
      // by getAuth(). initializeAuth with IndexedDB persistence avoids the silent error
      // that otherwise aborts app bootstrap and leaves a white screen.
      auth = initializeAuth(firebaseApp, {
        persistence: [
          indexedDBLocalPersistence,
          browserLocalPersistence,
          browserSessionPersistence,
        ],
      });
    } else {
      auth = getAuth(firebaseApp);
    }
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}
