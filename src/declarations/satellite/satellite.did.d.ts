import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

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
export interface _SERVICE {
  'build_version' : ActorMethod<[], string>,
  'create_new_product' : ActorMethod<[Product, string], Result>,
  'eliminate_solution' : ActorMethod<[string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];