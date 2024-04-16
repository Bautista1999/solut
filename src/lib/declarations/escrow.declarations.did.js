// @ts-ignore
export const idlFactory = ({ IDL }) => {
    const Reputation = IDL.Record({
      'amount_promised' : IDL.Nat,
      'amount_paid' : IDL.Nat,
      'number' : IDL.Nat,
    });
    const Approval = IDL.Record({
      'approval_transaction_number' : IDL.Nat,
      'sender' : IDL.Principal,
      'target' : IDL.Principal,
      'amount' : IDL.Nat,
    });
    const Transaction = IDL.Record({
      'status' : IDL.Text,
      'created_at' : IDL.Nat64,
      'sender' : IDL.Principal,
      'target' : IDL.Principal,
      'message' : IDL.Text,
      'project_id' : IDL.Text,
      'transaction_number' : IDL.Opt(IDL.Nat),
      'amount' : IDL.Nat,
    });
    return IDL.Service({
      'aaa_setReputation' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Text], []),
      'aaaa_getFakeReputation' : IDL.Func([], [IDL.Vec(Reputation)], []),
      'claimFakeTokens2' : IDL.Func([IDL.Text], [IDL.Text], []),
      'editApproval' : IDL.Func(
          [IDL.Text, IDL.Principal, IDL.Vec(Approval)],
          [IDL.Text],
          [],
        ),
      'editReputation' : IDL.Func(
          [IDL.Principal, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat],
          [IDL.Text],
          [],
        ),
      'getAllFakeApprovals' : IDL.Func([IDL.Text], [IDL.Vec(Approval)], []),
      'getAllSenderTransactions' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Text)))],
          [],
        ),
      'getAllTargetTransactions' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Text)))],
          [],
        ),
      'getAllowance' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
      'getApprovals' : IDL.Func([IDL.Text], [IDL.Vec(Approval)], []),
      'getFakeTransactionSender' : IDL.Func([], [IDL.Vec(Transaction)], []),
      'getFakeTransactionSender_NotAnonymous' : IDL.Func(
          [],
          [IDL.Vec(Transaction)],
          [],
        ),
      'getFakeTransactionTarget' : IDL.Func([], [IDL.Vec(Transaction)], []),
      'getProjectApprovals_lowerThan' : IDL.Func(
          [IDL.Text, IDL.Nat],
          [IDL.Vec(Approval)],
          [],
        ),
      'getProjectApprovals_majorThan' : IDL.Func(
          [IDL.Text, IDL.Nat],
          [IDL.Vec(Approval)],
          [],
        ),
      'getProjectRevenue' : IDL.Func([IDL.Text], [IDL.Nat], []),
      'getProjectsApprovals_bySender' : IDL.Func(
          [IDL.Text, IDL.Principal],
          [IDL.Vec(Approval)],
          [],
        ),
      'getProjectsApprovals_byTarget' : IDL.Func(
          [IDL.Text, IDL.Principal],
          [IDL.Vec(Approval)],
          [],
        ),
      'getTransactionsByProject' : IDL.Func(
          [IDL.Text],
          [IDL.Vec(Transaction)],
          [],
        ),
      'getTransactionsBySender' : IDL.Func(
          [IDL.Principal],
          [IDL.Vec(Transaction)],
          [],
        ),
      'getTransactionsByTarget' : IDL.Func(
          [IDL.Principal],
          [IDL.Vec(Transaction)],
          [],
        ),
      'getUserReputation' : IDL.Func([IDL.Principal], [Reputation], []),
      'getUserRevenue' : IDL.Func([IDL.Principal], [IDL.Nat], []),
      'getUserSpending' : IDL.Func([IDL.Principal], [IDL.Nat], []),
      'ideaRevenueCounter' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Text], []),
      'removeApprovals_bySender' : IDL.Func(
          [IDL.Text, IDL.Principal],
          [],
          ['oneway'],
        ),
      'solutionCompletion' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
      'solutionsCompletedCounter' : IDL.Func([], [IDL.Text], []),
      'storeApprovals' : IDL.Func([IDL.Text, IDL.Vec(Approval)], [IDL.Text], []),
      'storeFakeApproval' : IDL.Func([IDL.Text], [IDL.Text], []),
      'storeFakeApproval_notAnonymous' : IDL.Func([IDL.Text], [IDL.Text], []),
      'storeFakeTransaction_NotAnonymous' : IDL.Func([IDL.Text], [IDL.Text], []),
      'storeFakeTransactions' : IDL.Func([IDL.Text], [IDL.Text], []),
      'updateReputation' : IDL.Func(
          [IDL.Principal, IDL.Nat, IDL.Nat],
          [IDL.Text],
          [],
        ),
      'updateSolutionStatus' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
      'verifyAndStoreTransaction' : IDL.Func([IDL.Nat64], [IDL.Text], []),
    });
  };
  // @ts-ignore
  export const init = ({ IDL }) => { return []; };