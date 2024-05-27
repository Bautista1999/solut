import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type idea = {
    title: string;
    subtitle: string;
    description: string;
    images: Array<string>;
    videos: Array<string>;
    categories: Array<string>;
};
export type feature = idea;
export type solution = {
    title: string;
    subtitle: string;
    description: string;
    images: Array<string>;
    videos: Array<string>;
    categories: Array<string>;
    features: Array<string>;
    milestones: Array<milestone>;
}
export type milestone = {
    id: number;
    title: string,
    date: number,
    description: string,
}
type link = {
    name: string,
    link: string,
}

export type user = {
    username: string,
    profilePicture: string,
    images: Array<string>,
    videos: Array<string>,
    sex: string,
    country: string,
    description: string,
    categories: Array<string>,
    xAccount: string,
    instaAccount: string,
    GitHubAccount: string,
    linkedInAccount: string,
    linkPage: string,
    otherlinks: Array<link>,
};

export type TotalPledge = {
    pledges: number;
    expected: number;
};
export type UserProfilePic = {
    key: string,
    image: string,
}




//Juno
export type setDoc<SomeType> = {
    collection: string,
    doc: {
        key: string,
        data: SomeType
    }
}

//Escrow
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