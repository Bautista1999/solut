export const idlFactory = ({ IDL }) => {
  const Idea = IDL.Record({
    'categories' : IDL.Vec(IDL.Text),
    'title' : IDL.Text,
    'description' : IDL.Text,
    'videos' : IDL.Vec(IDL.Text),
    'subtitle' : IDL.Text,
    'images' : IDL.Vec(IDL.Text),
  });
  const SetIdea = IDL.Record({ 'key' : IDL.Text, 'idea' : Idea });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const Product = IDL.Record({
    'owner' : IDL.Opt(IDL.Principal),
    'link' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'score' : IDL.Opt(IDL.Nat8),
    'company' : IDL.Opt(IDL.Text),
    'image' : IDL.Opt(IDL.Text),
  });
  const Milestone = IDL.Record({
    'id' : IDL.Nat64,
    'title' : IDL.Text,
    'date' : IDL.Nat64,
    'description' : IDL.Text,
  });
  const Solution = IDL.Record({
    'categories' : IDL.Vec(IDL.Text),
    'title' : IDL.Text,
    'features' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'videos' : IDL.Vec(IDL.Text),
    'subtitle' : IDL.Text,
    'milestones' : IDL.Vec(Milestone),
    'images' : IDL.Vec(IDL.Text),
  });
  return IDL.Service({
    'build_version' : IDL.Func([], [IDL.Text], ['query']),
    'create_ideas' : IDL.Func([IDL.Vec(SetIdea), IDL.Text], [Result], []),
    'create_new_product' : IDL.Func([Product, IDL.Text], [Result], []),
    'create_or_update_idea' : IDL.Func(
        [IDL.Text, Idea, IDL.Text],
        [Result],
        [],
      ),
    'create_or_update_solution' : IDL.Func(
        [IDL.Text, Solution, IDL.Text],
        [Result],
        [],
      ),
    'create_or_update_topic' : IDL.Func([IDL.Text, Idea], [Result], []),
    'delete_pledge' : IDL.Func([IDL.Text], [Result], []),
    'eliminate_idea' : IDL.Func([IDL.Text], [Result], []),
    'eliminate_solution' : IDL.Func([IDL.Text], [Result], []),
    'eliminate_topic' : IDL.Func([IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };