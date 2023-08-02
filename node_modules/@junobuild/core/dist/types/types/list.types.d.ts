import type { Principal } from '@dfinity/principal';
export interface ListResults<T> {
    items: T[];
    items_length: bigint;
    items_page?: bigint;
    matches_length: bigint;
    matches_pages?: bigint;
}
export interface ListPaginate {
    startAfter?: string;
    limit?: number;
}
export type ListOrderField = 'keys' | 'updated_at' | 'created_at';
export interface ListOrder {
    desc: boolean;
    field: ListOrderField;
}
export type ListOwner = string | Principal;
export interface ListMatcher {
    key?: string;
    description?: string;
}
export interface ListParams {
    matcher?: ListMatcher;
    paginate?: ListPaginate;
    order?: ListOrder;
    owner?: ListOwner;
}
