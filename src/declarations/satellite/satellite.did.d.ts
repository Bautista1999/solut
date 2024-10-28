import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Idea {
  'categories' : Array<string>,
  'title' : string,
  'description' : string,
  'videos' : Array<string>,
  'subtitle' : string,
  'images' : Array<string>,
}
export interface Milestone {
  'id' : bigint,
  'title' : string,
  'date' : bigint,
  'description' : string,
}
export interface Product {
  'owner' : [] | [Principal],
  'link' : string,
  'name' : string,
  'description' : string,
  'score' : [] | [number],
  'company' : [] | [string],
  'image' : [] | [string],
}
export type Result = { 'Ok' : null } |
  { 'Err' : string };
export interface SetIdea { 'key' : string, 'idea' : Idea }
export interface Solution {
  'categories' : Array<string>,
  'title' : string,
  'features' : Array<string>,
  'description' : string,
  'videos' : Array<string>,
  'subtitle' : string,
  'milestones' : Array<Milestone>,
  'images' : Array<string>,
}
export interface _SERVICE {
  'build_version' : ActorMethod<[], string>,
  'create_ideas' : ActorMethod<[Array<SetIdea>, string], Result>,
  'create_new_product' : ActorMethod<[Product, string], Result>,
  'create_or_update_idea' : ActorMethod<[string, Idea, string], Result>,
  'create_or_update_solution' : ActorMethod<[string, Solution, string], Result>,
  'create_or_update_topic' : ActorMethod<[string, Idea], Result>,
  'delete_pledge' : ActorMethod<[string], Result>,
  'eliminate_idea' : ActorMethod<[string], Result>,
  'eliminate_solution' : ActorMethod<[string], Result>,
  'eliminate_topic' : ActorMethod<[string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];