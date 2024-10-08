// @ts-ignore
export const idlFactory = ({ IDL }) => {
  const User = IDL.Record({
    'amount_pledged' : IDL.Nat,
    'user' : IDL.Text,
    'amount_paid' : IDL.Nat,
  });
  const Pledge = IDL.Record({
    'feature_id' : IDL.Text,
    'expected_amount' : IDL.Nat64,
    'user' : IDL.Text,
    'idea_id' : IDL.Text,
    'target' : IDL.Text,
    'amount' : IDL.Nat64,
    'doc_key' : IDL.Text,
  });
  const GetDocResponse = IDL.Record({
    'updated_at' : IDL.Nat64,
    'owner' : IDL.Principal,
    'data' : IDL.Vec(IDL.Nat8),
    'description' : IDL.Opt(IDL.Text),
    'created_at' : IDL.Nat64,
    'version' : IDL.Opt(IDL.Nat64),
  });
  const GetDocResult = IDL.Variant({ 'ok' : GetDocResponse, 'err' : IDL.Text });
  const GetManyDocsInput = IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text));
  const Doc = IDL.Record({
    'updated_at' : IDL.Nat64,
    'owner' : IDL.Principal,
    'data' : IDL.Vec(IDL.Nat8),
    'description' : IDL.Opt(IDL.Text),
    'created_at' : IDL.Nat64,
    'version' : IDL.Opt(IDL.Nat64),
  });
  const GetManyDocsResponse = IDL.Vec(IDL.Tuple(IDL.Text, IDL.Opt(Doc)));
  const GetManyDocsResult = IDL.Variant({
    'ok' : GetManyDocsResponse,
    'err' : IDL.Text,
  });
  const OrderField = IDL.Variant({
    'UpdatedAt' : IDL.Null,
    'Keys' : IDL.Null,
    'CreatedAt' : IDL.Null,
  });
  const Order = IDL.Opt(
    IDL.Record({ 'field' : OrderField, 'desc' : IDL.Bool })
  );
  const Matcher = IDL.Opt(
    IDL.Record({ 'key' : IDL.Opt(IDL.Text), 'description' : IDL.Opt(IDL.Text) })
  );
  const Paginate = IDL.Opt(
    IDL.Record({
      'start_after' : IDL.Opt(IDL.Text),
      'limit' : IDL.Opt(IDL.Nat64),
    })
  );
  const ListDocsFilter = IDL.Record({
    'order' : Order,
    'owner' : IDL.Opt(IDL.Principal),
    'matcher' : Matcher,
    'paginate' : Paginate,
  });
  const ListDocsResponse = IDL.Record({
    'matches_pages' : IDL.Opt(IDL.Nat64),
    'matches_length' : IDL.Nat64,
    'items_page' : IDL.Opt(IDL.Nat64),
    'items' : IDL.Vec(IDL.Tuple(IDL.Text, Doc)),
    'items_length' : IDL.Nat64,
  });
  const ListDocsResult = IDL.Variant({
    'ok' : ListDocsResponse,
    'err' : IDL.Text,
  });
  const DocInput = IDL.Record({
    'data' : IDL.Vec(IDL.Nat8),
    'description' : IDL.Opt(IDL.Text),
    'version' : IDL.Opt(IDL.Nat64),
  });
  const SetManyDocsInput = IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, DocInput));
  const CollectionKeyPair = IDL.Record({
    'key' : IDL.Text,
    'collection' : IDL.Text,
    'docInput' : DocInput,
  });
  return IDL.Service({
    'createNotification' : IDL.Func([IDL.Text], [IDL.Text], []),
    'createPersonalNotification' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'deleteDoc' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'deleteElement' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'deleteManyDocs' : IDL.Func(
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Text,
              IDL.Text,
              IDL.Record({ 'version' : IDL.Opt(IDL.Nat64) }),
            )
          ),
        ],
        [IDL.Text],
        [],
      ),
    'editPledgeTry' : IDL.Func([User, Pledge], [IDL.Vec(User)], []),
    'followerCounter' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Text],
        [IDL.Text],
        [],
      ),
    'fromCandidDescription' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'ok' : IDL.Vec(User), 'err' : IDL.Text })],
        [],
      ),
    'getDoc' : IDL.Func([IDL.Text, IDL.Text], [GetDocResult], []),
    'getManyDocs' : IDL.Func([GetManyDocsInput], [GetManyDocsResult], []),
    'ideaCounter' : IDL.Func([IDL.Text], [IDL.Text], []),
    'ideaRevenueCounter' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Text], []),
    'listDocs' : IDL.Func([IDL.Text, ListDocsFilter], [ListDocsResult], []),
    'pledgeApprovedVerify' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat64, IDL.Nat64],
        [IDL.Text],
        [],
      ),
    'pledgeCreate' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Nat64, IDL.Vec(IDL.Nat8)],
        [IDL.Text],
        [],
      ),
    'pledgeEdit' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Nat64, IDL.Vec(IDL.Nat8)],
        [IDL.Text],
        [],
      ),
    'setDoc' : IDL.Func([IDL.Text, IDL.Text, DocInput], [IDL.Text], []),
    'setManyDocs' : IDL.Func([SetManyDocsInput], [IDL.Text], []),
    'solutionApproveEdit' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat64, IDL.Nat64],
        [IDL.Text],
        [],
      ),
    'solutionReject' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'solutionSubmit' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'solutionsCompletedCounter' : IDL.Func([], [IDL.Text], []),
    'transfersBuildersCounter' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'updateDocument' : IDL.Func([IDL.Text, IDL.Text, DocInput], [IDL.Text], []),
    'updateManyDocs' : IDL.Func([IDL.Vec(CollectionKeyPair)], [IDL.Text], []),
    'updateSolutionStatus' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
    'userPrincipal' : IDL.Func([], [IDL.Text], []),
    'userRevenueCounter' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Text], []),
  });
};
// @ts-ignore
export const init = ({ IDL }) => { return []; };