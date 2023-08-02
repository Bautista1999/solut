export declare abstract class Store<T> {
    private callbacks;
    protected populate(data: T | null): void;
    subscribe(callback: (data: T | null) => void): () => void;
}
