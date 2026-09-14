import { expoClient } from '@better-auth/expo/client';
import { emailOTPClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from '@/api/config';

/**
 * Better Auth client. The Expo plugin keeps the session cookie in SecureStore and
 * attaches it to auth requests; `getCookie()` hands it to our own API client.
 * The backend lives in another repo, so `user.additionalFields` are declared by hand.
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({ scheme: 'alsaedyoptics', storagePrefix: 'alsaedy', storage: SecureStore }),
    emailOTPClient(),
    inferAdditionalFields({
      user: {
        phone: { type: 'string', required: false },
        locale: { type: 'string', required: false },
      },
    }),
  ],
});

export type SessionUser = typeof authClient.$Infer.Session.user;
