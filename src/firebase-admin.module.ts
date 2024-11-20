import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        const firebaseCredentials = process.env.FIREBASE_CREDENTIALS;
        if (!firebaseCredentials) {
          throw new Error(
            'FIREBASE_CREDENTIALS is not set in the environment variables',
          );
        }

        try {
          const serviceAccount: ServiceAccount =
            JSON.parse(firebaseCredentials);
          console.log('Firebase Credentials:', serviceAccount);

          if (!admin.apps.length) {
            return admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            });
          }
          return admin.app();
        } catch (error) {
          console.error('Invalid JSON:', firebaseCredentials);
          throw new Error('FIREBASE_CREDENTIALS is not valid JSON');
        }
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseAdminModule {}
