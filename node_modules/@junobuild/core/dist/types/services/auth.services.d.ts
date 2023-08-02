import type { Identity } from '@dfinity/agent';
import type { Provider, SignInOptions } from '../types/auth.types';
export declare const initAuth: (provider?: Provider) => Promise<void>;
export declare const signIn: (options?: SignInOptions) => Promise<void>;
export declare const signOut: () => Promise<void>;
export declare const getIdentity: () => Identity | undefined;
/**
 * Return what can be the identity of a sign-in user or an anonymous identity.
 * Useful to load an identity in web workers.
 */
export declare const unsafeIdentity: () => Promise<Identity>;
