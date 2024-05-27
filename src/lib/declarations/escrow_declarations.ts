import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Approval {
    'approval_transaction_number': bigint,
    'sender': Principal,
    'target': Principal,
    'amount': bigint,
}
export interface Reputation {
    'amount_promised': bigint,
    'amount_paid': bigint,
    'number': bigint,
}
export interface Transaction {
    'status': string,
    'created_at': bigint,
    'sender': Principal,
    'target': Principal,
    'trans_type': string,
    'message': string,
    'project_id': string,
    'transaction_number': [] | [bigint],
    'amount': bigint,
}
export interface _SERVICE {
    'aaa_setReputation': ActorMethod<[bigint, bigint], string>,
    'aaaa_getFakeReputation': ActorMethod<[], Array<Reputation>>,
    'claimFakeTokens2': ActorMethod<[string], string>,
    'editApproval': ActorMethod<[string, Principal, Array<Approval>], string>,
    'editReputation': ActorMethod<
        [Principal, bigint, bigint, bigint, bigint],
        string
    >,
    'getAllFakeApprovals': ActorMethod<[string], Array<Approval>>,
    'getAllSenderTransactions': ActorMethod<
        [],
        Array<[Principal, Array<string>]>
    >,
    'getAllTargetTransactions': ActorMethod<
        [],
        Array<[Principal, Array<string>]>
    >,
    'getAllowance': ActorMethod<[string, string], bigint>,
    'getApprovals': ActorMethod<[string], Array<Approval>>,
    'getFakeTransactionSender': ActorMethod<[], Array<Transaction>>,
    'getFakeTransactionSender_NotAnonymous': ActorMethod<[], Array<Transaction>>,
    'getFakeTransactionTarget': ActorMethod<[], Array<Transaction>>,
    'getProjectApprovals_lowerThan': ActorMethod<
        [string, bigint],
        Array<Approval>
    >,
    'getProjectApprovals_majorThan': ActorMethod<
        [string, bigint],
        Array<Approval>
    >,
    'getProjectRevenue': ActorMethod<[string], bigint>,
    'getProjectsApprovals_bySender': ActorMethod<
        [string, Principal],
        Array<Approval>
    >,
    'getProjectsApprovals_byTarget': ActorMethod<
        [string, Principal],
        Array<Approval>
    >,
    'getTransactionsByProject': ActorMethod<[string], Array<Transaction>>,
    'getTransactionsBySender': ActorMethod<[Principal], Array<Transaction>>,
    'getTransactionsByTarget': ActorMethod<[Principal], Array<Transaction>>,
    'getUserReputation': ActorMethod<[Principal], Reputation>,
    'getUserRevenue': ActorMethod<[Principal], bigint>,
    'getUserSpending': ActorMethod<[Principal], bigint>,
    'ideaRevenueCounter': ActorMethod<[string, bigint], string>,
    'removeApprovals_bySender': ActorMethod<[string, Principal], undefined>,
    'solutionCompletion': ActorMethod<[string, string], string>,
    'solutionsCompletedCounter': ActorMethod<[], string>,
    'storeApprovals': ActorMethod<[string, Array<Approval>], string>,
    'storeFakeApproval': ActorMethod<[string], string>,
    'storeFakeApproval_notAnonymous': ActorMethod<[string], string>,
    'storeFakeTransaction_NotAnonymous': ActorMethod<[string], string>,
    'storeFakeTransactions': ActorMethod<[string], string>,
    'updateReputation': ActorMethod<[Principal, bigint, bigint], string>,
    'updateSolutionStatus': ActorMethod<[string, string], string>,
    'verifyAndStoreTransaction': ActorMethod<[bigint], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];