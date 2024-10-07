export const idlFactory = ({ IDL }) => {
  const Product = IDL.Record({
    'owner' : IDL.Opt(IDL.Principal),
    'link' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'score' : IDL.Opt(IDL.Nat8),
    'company' : IDL.Opt(IDL.Text),
    'image' : IDL.Opt(IDL.Text),
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'build_version' : IDL.Func([], [IDL.Text], ['query']),
    'create_new_product' : IDL.Func([Product, IDL.Text], [Result], []),
    'eliminate_solution' : IDL.Func([IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };