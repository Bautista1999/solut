import type { User } from '../types/auth.types';
import type { Unsubscribe } from '../types/subscription.types';
import { Store } from './store';
export declare class AuthStore extends Store<User | null> {
    private static instance;
    private authUser;
    private constructor();
    static getInstance(): AuthStore;
    set(authUser: User | null): void;
    get(): User | null;
    subscribe(callback: (data: User | null) => void): Unsubscribe;
    reset(): void;
}
