import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tech.quenta.workout',
  appName: 'Workout Tracker',
  webDir: 'dist/workout-tracker/browser',
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        apple: false,
        facebook: false,
        twitter: false,
      }
    }
  }
};

export default config;
