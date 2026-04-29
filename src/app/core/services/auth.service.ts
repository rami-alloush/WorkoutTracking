import { Injectable, signal, computed } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithCredential,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { getFirebaseAuth } from '../firebase.init';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getFirebaseAuth();
  private currentUser = signal<User | null>(null);
  private authReady = signal(false);
  private googleInitialized = false;

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

  private async initializeGoogleAuth(): Promise<void> {
    if (this.googleInitialized) return;
    const platform = Capacitor.getPlatform();
    await SocialLogin.initialize({
      google: {
        webClientId: environment.googleAuth.webClientId,
        ...(platform === 'ios' && {
          iOSClientId: environment.googleAuth.iOSClientId,
          iOSServerClientId: environment.googleAuth.webClientId,
        }),
      },
    });
    this.googleInitialized = true;
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  canUseGoogleAuthPopup(): boolean {
    return !Capacitor.isNativePlatform();
  }

  async loginWithGoogle(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.initializeGoogleAuth();
      const result = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        },
      });
      const googleResult = result.result;
      if (googleResult.responseType !== 'online' || !googleResult.idToken) {
        throw new Error('Google sign-in failed: no ID token received.');
      }
      const credential = GoogleAuthProvider.credential(googleResult.idToken);
      await signInWithCredential(this.auth, credential);
    } else {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
    }
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    if (Capacitor.isNativePlatform() && this.googleInitialized) {
      await SocialLogin.logout({ provider: 'google' }).catch(() => {});
    }
    await signOut(this.auth);
  }
}
