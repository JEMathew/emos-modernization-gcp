import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app, getPublicFirebaseConfig } from '../server';
import {
  isMobileBrowser,
  resolveAuthDomain,
  getFriendlyAuthErrorMessage,
  signInWithGoogle,
  processRedirectResult,
  syncUserProfile,
  setAuthExecutorsForTesting,
  setProfileWriterForTesting,
} from '../src/lib/firebase';

describe('Android & Mobile Google Sign-In Enhancements', () => {
  describe('Server endpoints and reverse proxy configuration', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('serves public Firebase configuration via /__/firebase/init.json without leaking secrets', async () => {
      const res = await request(app).get('/__/firebase/init.json').set('Host', 'localhost:3000');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.headers['cache-control']).toBe('public, max-age=3600');

      const config = res.body;
      expect(config.projectId).toBe('codev-0326');
      expect(config.authDomain).toBe('codev-0326.firebaseapp.com');
      expect(config.apiKey).toBeDefined();
      expect(config.firestoreDatabaseId).toBeDefined();

      // Ensure no server-side secrets leaked
      expect(config.GEMINI_API_KEY).toBeUndefined();
      expect(config.serviceAccount).toBeUndefined();
      expect(config.privateKey).toBeUndefined();
    });

    it('/__/firebase/init.json returns emos-modernization.ai.studio on production domain and preserves codev-0326.firebaseapp.com on localhost', async () => {
      const prodRes = await request(app)
        .get('/__/firebase/init.json')
        .set('Host', 'emos-modernization.ai.studio');
      expect(prodRes.status).toBe(200);
      expect(prodRes.body.authDomain).toBe('emos-modernization.ai.studio');

      const localRes = await request(app)
        .get('/__/firebase/init.json')
        .set('Host', 'localhost:3000');
      expect(localRes.status).toBe(200);
      expect(localRes.body.authDomain).toBe('codev-0326.firebaseapp.com');
    });

    it('getPublicFirebaseConfig returns clean public object with appropriate authDomain for environment', () => {
      const cfgLocal = getPublicFirebaseConfig('localhost');
      expect(cfgLocal.projectId).toBe('codev-0326');
      expect(cfgLocal.authDomain).toBe('codev-0326.firebaseapp.com');
      expect((cfgLocal as any).GEMINI_API_KEY).toBeUndefined();

      const cfgProd = getPublicFirebaseConfig('emos-modernization.ai.studio');
      expect(cfgProd.authDomain).toBe('emos-modernization.ai.studio');
    });

    it('mounts /__/auth proxy route with deterministic mocked fetch preserving origin, path, query, method, and headers', async () => {
      const mockResponseText = '<html><head><title>Firebase Auth Helper</title></head><body>OK</body></html>';
      const mockBuffer = Buffer.from(mockResponseText, 'utf-8');

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = String(url);
        // Verify exact upstream origin, /__/auth path and query preservation
        expect(urlStr).toBe('https://codev-0326.firebaseapp.com/__/auth/handler?apiKey=test-api-key&appName=%5BDEFAULT%5D');
        // Verify request method preservation
        expect(init?.method).toBe('POST');
        // Verify host header override
        expect((init?.headers as Record<string, string>)?.['host']).toBe('codev-0326.firebaseapp.com');

        const headers = new Headers();
        headers.set('content-type', 'text/html; charset=utf-8');
        headers.set('location', 'https://codev-0326.firebaseapp.com/__/auth/callback');
        headers.set('content-encoding', 'gzip'); // Should be stripped by proxy
        headers.set('transfer-encoding', 'chunked'); // Should be stripped by proxy
        headers.set('connection', 'keep-alive'); // Should be stripped by proxy

        return new Response(mockBuffer, {
          status: 200,
          headers,
        });
      });

      const res = await request(app)
        .post('/__/auth/handler?apiKey=test-api-key&appName=%5BDEFAULT%5D')
        .send({ mode: 'select' });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      // Expected successful status and body
      expect(res.status).toBe(200);
      expect(res.text).toBe(mockResponseText);
      // Content-Type and Location preservation where supplied
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.headers['location']).toBe('https://codev-0326.firebaseapp.com/__/auth/callback');
      // Stripped headers
      expect(res.headers['transfer-encoding']).toBeUndefined();
      expect(res.headers['content-encoding']).toBeUndefined();
      // Recalculated exact Content-Length matching body byte length
      expect(res.headers['content-length']).toBe(String(mockBuffer.length));
      // Does not reach the SPA fallback
      expect(res.text).not.toContain('<div id="root">');
    });

    it('returns 502 when upstream reverse-proxy fetch fails', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Upstream connection timeout'));

      const res = await request(app).get('/__/auth/handler');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(502);
      expect(res.body.error).toContain('Failed to connect to Firebase authentication helper.');
    });
  });

  describe('Client domain and mobile detection helpers', () => {
    it('detects mobile browsers from user agent string', () => {
      const androidUA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
      const iPhoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
      const desktopChromeUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
      const desktopWindowsUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      expect(isMobileBrowser(androidUA)).toBe(true);
      expect(isMobileBrowser(iPhoneUA)).toBe(true);
      expect(isMobileBrowser(desktopChromeUA)).toBe(false);
      expect(isMobileBrowser(desktopWindowsUA)).toBe(false);
    });

    it('maps error codes to friendly explanations', () => {
      expect(getFriendlyAuthErrorMessage({ code: 'auth/popup-blocked' })).toContain('popup was blocked');
      expect(getFriendlyAuthErrorMessage({ code: 'auth/popup-closed-by-user' })).toContain('closed before completing');
      expect(getFriendlyAuthErrorMessage({ code: 'auth/network-request-failed' })).toContain('Network connection failure');
      expect(getFriendlyAuthErrorMessage({ message: 'missing initial state sessionStorage' })).toContain('Unable to verify session state across browser tabs');
      expect(getFriendlyAuthErrorMessage({ code: 'auth/unauthorized-domain' })).toContain('domain is not authorized');
      expect(getFriendlyAuthErrorMessage(null)).toBe('An unknown error occurred during sign-in.');
    });
  });

  describe('Authentication flow branching (Desktop vs Mobile) & Profile Synchronization', () => {
    afterEach(() => {
      setAuthExecutorsForTesting({
        popup: null,
        redirect: null,
        redirectResult: null,
        profileSync: null,
      });
      setProfileWriterForTesting(null);
      vi.restoreAllMocks();
    });

    it('triggers signInWithPopup on desktop and invokes profile synchronization exactly once', async () => {
      const mockUser = { uid: 'desktop-user-1', email: 'test@example.com', displayName: 'Desktop User', metadata: {} };
      const popupMock = vi.fn().mockResolvedValue({ user: mockUser });
      const redirectMock = vi.fn().mockResolvedValue(undefined);
      const profileSyncMock = vi.fn().mockResolvedValue(undefined);

      setAuthExecutorsForTesting({
        popup: popupMock,
        redirect: redirectMock,
        profileSync: profileSyncMock,
      });

      const user = await signInWithGoogle({ forcePopup: true });

      expect(popupMock).toHaveBeenCalledTimes(1);
      expect(redirectMock).not.toHaveBeenCalled();
      expect(profileSyncMock).toHaveBeenCalledTimes(1);
      expect(profileSyncMock).toHaveBeenCalledWith(mockUser);
      expect(user?.uid).toBe('desktop-user-1');
    });

    it('triggers signInWithRedirect on mobile devices without running profile sync prior to redirect', async () => {
      const popupMock = vi.fn().mockResolvedValue({ user: { uid: 'u1' } });
      const redirectMock = vi.fn().mockResolvedValue(undefined);
      const profileSyncMock = vi.fn().mockResolvedValue(undefined);

      setAuthExecutorsForTesting({
        popup: popupMock,
        redirect: redirectMock,
        profileSync: profileSyncMock,
      });

      const user = await signInWithGoogle({ forceRedirect: true });

      expect(redirectMock).toHaveBeenCalledTimes(1);
      expect(popupMock).not.toHaveBeenCalled();
      expect(profileSyncMock).not.toHaveBeenCalled();
      expect(user).toBeNull();
    });

    it('handles popup cancellation and throws error for user feedback without running profile sync', async () => {
      const popupMock = vi.fn().mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'The popup was closed by the user.',
      });
      const profileSyncMock = vi.fn().mockResolvedValue(undefined);

      setAuthExecutorsForTesting({
        popup: popupMock,
        profileSync: profileSyncMock,
      });

      await expect(signInWithGoogle({ forcePopup: true })).rejects.toMatchObject({
        code: 'auth/popup-closed-by-user',
      });
      expect(profileSyncMock).not.toHaveBeenCalled();
    });

    it('processes getRedirectResult gracefully, resolves user, and invokes profile synchronization exactly once', async () => {
      const mockRedirectUser = { uid: 'redirect-mobile-user-1', email: 'mobile@example.com', displayName: 'Mobile User', metadata: {} };
      const redirectResultMock = vi.fn().mockResolvedValue({ user: mockRedirectUser });
      const profileSyncMock = vi.fn().mockResolvedValue(undefined);

      setAuthExecutorsForTesting({
        redirectResult: redirectResultMock,
        profileSync: profileSyncMock,
      });

      const user = await processRedirectResult();
      expect(redirectResultMock).toHaveBeenCalledTimes(1);
      expect(profileSyncMock).toHaveBeenCalledTimes(1);
      expect(profileSyncMock).toHaveBeenCalledWith(mockRedirectUser);
      expect(user?.uid).toBe('redirect-mobile-user-1');
    });

    it('handles null result from getRedirectResult when no redirect took place without running profile sync', async () => {
      const redirectResultMock = vi.fn().mockResolvedValue(null);
      const profileSyncMock = vi.fn().mockResolvedValue(undefined);

      setAuthExecutorsForTesting({
        redirectResult: redirectResultMock,
        profileSync: profileSyncMock,
      });

      const user = await processRedirectResult();
      expect(redirectResultMock).toHaveBeenCalledTimes(1);
      expect(profileSyncMock).not.toHaveBeenCalled();
      expect(user).toBeNull();
    });

    it('prevents duplicate redirect processing and duplicate profile sync through promise memoization', async () => {
      const mockRedirectUser = { uid: 'redirect-mobile-user-memo', email: 'memo@example.com', displayName: 'Memo User', metadata: {} };
      const redirectResultMock = vi.fn().mockResolvedValue({ user: mockRedirectUser });
      const profileSyncMock = vi.fn().mockResolvedValue(undefined);

      setAuthExecutorsForTesting({
        redirectResult: redirectResultMock,
        profileSync: profileSyncMock,
      });

      const [res1, res2] = await Promise.all([
        processRedirectResult(),
        processRedirectResult(),
      ]);

      expect(redirectResultMock).toHaveBeenCalledTimes(1);
      expect(profileSyncMock).toHaveBeenCalledTimes(1);
      expect(res1?.uid).toBe('redirect-mobile-user-memo');
      expect(res2?.uid).toBe('redirect-mobile-user-memo');
    });

    it('retains original Firestore error behavior when profile synchronization fails', async () => {
      const mockUser = {
        uid: 'user-sync-fail',
        displayName: 'Fail User',
        email: 'fail@example.com',
        photoURL: null,
        metadata: { creationTime: '2026-09-01T00:00:00Z' },
      } as any;

      // Mock Firestore writer to simulate a failure and confirm syncUserProfile throws standardized handleFirestoreError
      const writerMock = vi.fn().mockRejectedValue(new Error('Missing or insufficient permissions.'));
      setProfileWriterForTesting(writerMock);

      // Expect syncUserProfile to rethrow the standardized FirestoreErrorInfo Error
      await expect(syncUserProfile(mockUser)).rejects.toThrow(/"operationType":"write"/);
      expect(writerMock).toHaveBeenCalledTimes(1);
    });

    it('uses emos-modernization.ai.studio only in production and preserves codev-0326.firebaseapp.com for localhost', () => {
      expect(resolveAuthDomain('localhost')).toBe('codev-0326.firebaseapp.com');
      expect(resolveAuthDomain('127.0.0.1')).toBe('codev-0326.firebaseapp.com');
      expect(resolveAuthDomain('emos-modernization.ai.studio')).toBe('emos-modernization.ai.studio');
      expect(resolveAuthDomain()).toBe('codev-0326.firebaseapp.com');
    });

    it('proves initialization and resolveAuthDomain do not throw when browser process is undefined', () => {
      const originalProcess = (globalThis as any).process;
      try {
        // Simulate a browser runtime environment where global process is not defined
        (globalThis as any).process = undefined;
        expect(typeof (globalThis as any).process).toBe('undefined');

        expect(resolveAuthDomain('localhost')).toBe('codev-0326.firebaseapp.com');
        expect(resolveAuthDomain('emos-modernization.ai.studio')).toBe('emos-modernization.ai.studio');
        expect(() => resolveAuthDomain('any-host.com')).not.toThrow();
      } finally {
        (globalThis as any).process = originalProcess;
      }
    });
  });
});
