import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CollectionKeyPair {
    'key': string,
    'collection': string,
    'docInput': DocInput,
}
export interface Doc {
    'updated_at': bigint,
    'owner': Principal,
    'data': Uint8Array | number[],
    'description': [] | [string],
    'created_at': bigint,
    'version': [] | [bigint],
}
export interface DocInput {
    'data': Uint8Array | number[],
    'description': [] | [string],
    'version': [] | [bigint],
}
export interface GetDocResponse {
    'updated_at': bigint,
    'owner': Principal,
    'data': Uint8Array | number[],
    'description': [] | [string],
    'created_at': bigint,
    'version': [] | [bigint],
}
export type GetDocResult = { 'ok': GetDocResponse } |
{ 'err': string };
export type GetManyDocsInput = Array<[string, string]>;
export type GetManyDocsResponse = Array<[string, [] | [Doc]]>;
export type GetManyDocsResult = { 'ok': GetManyDocsResponse } |
{ 'err': string };
export interface ListDocsFilter {
    'order': Order,
    'owner': [] | [Principal],
    'matcher': Matcher,
    'paginate': Paginate,
}
export interface ListDocsResponse {
    'matches_pages': [] | [bigint],
    'matches_length': bigint,
    'items_page': [] | [bigint],
    'items': Array<[string, Doc]>,
    'items_length': bigint,
}
export type ListDocsResult = { 'ok': ListDocsResponse } |
{ 'err': string };
export type Matcher = [] | [
    { 'key': [] | [string], 'description': [] | [string] }
];
export type Order = [] | [{ 'field': OrderField, 'desc': boolean }];
export type OrderField = { 'UpdatedAt': null } |
{ 'Keys': null } |
{ 'CreatedAt': null };
export type Paginate = [] | [
    { 'start_after': [] | [string], 'limit': [] | [bigint] }
];
export interface Pledge {
    'feature_id': string,
    'expected_amount': bigint,
    'user': Principal,
    'idea_id': string,
    'amount': bigint,
    'doc_key': string,
}
export type SetManyDocsInput = Array<[string, string, DocInput]>;
export interface User {
    'amount_pledged': bigint,
    'user': string,
    'amount_paid': bigint,
}
export interface _SERVICE {
    'createNotification': ActorMethod<[], string>,
    'createPersonalNotification': ActorMethod<
        [string, string, string, string, string],
        string
    >,
    'deleteDoc': ActorMethod<[string, string], string>,
    'deleteElement': ActorMethod<[string, string], string>,
    'deleteManyDocs': ActorMethod<
        [Array<[string, string, { 'version': [] | [bigint] }]>],
        string
    >,
    'editPledgeTry': ActorMethod<[User, Pledge], Array<User>>,
    'followerCounter': ActorMethod<[string, boolean, string], string>,
    'fromCandidDescription': ActorMethod<
        [string],
        { 'ok': Array<User> } |
        { 'err': string }
    >,
    'getDoc': ActorMethod<[string, string], GetDocResult>,
    'getManyDocs': ActorMethod<[GetManyDocsInput], GetManyDocsResult>,
    'ideaCounter': ActorMethod<[string], string>,
    'ideaRevenueCounter': ActorMethod<[string, bigint], string>,
    'listDocs': ActorMethod<[string, ListDocsFilter], ListDocsResult>,
    'pledgeApprovedVerify': ActorMethod<
        [string, string, bigint, bigint],
        string
    >,
    'pledgeCreate': ActorMethod<
        [string, string, string, bigint, Uint8Array | number[]],
        string
    >,
    'pledgeEdit': ActorMethod<
        [string, string, string, bigint, Uint8Array | number[]],
        string
    >,
    'setDoc': ActorMethod<[string, string, DocInput], string>,
    'setManyDocs': ActorMethod<[SetManyDocsInput], string>,
    'solutionApproveEdit': ActorMethod<[string, string, bigint, bigint], string>,
    'solutionReject': ActorMethod<[string, string], string>,
    'solutionSubmit': ActorMethod<[string, string], string>,
    'solutionsCompletedCounter': ActorMethod<[], string>,
    'transfersBuildersCounter': ActorMethod<[bigint], string>,
    'updateDocument': ActorMethod<[string, string, DocInput], string>,
    'updateManyDocs': ActorMethod<[Array<CollectionKeyPair>], string>,
    'updateSolutionStatus': ActorMethod<[string, string], string>,
    'userPrincipal': ActorMethod<[], string>,
    'userRevenueCounter': ActorMethod<[string, bigint], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];