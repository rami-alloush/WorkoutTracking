import { Injectable, signal, computed } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getFirebaseAuth } from '../firebase.init';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getFirebaseAuth();
  private currentUser = signal<User | null>(null);
  private authReady = signal(false);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isReady = this.authReady.asReadonly();
  readonly uid = computed(() => this.currentUser()?.uid ?? null);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.authReady.set(true);
    });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  canUseGoogleAuthPopup(): boolean {
    return !Capacitor.isNativePlatform();
  }

  async loginWithGoogle(): Promise<void> {
    if (!this.canUseGoogleAuthPopup()) {
      throw new Error('Google sign-in is not configured for the native app yet.');
    }

    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
