let newDeadline = { newDate: { day: 0, month: 0, year: 0 }, title: "" };
let newDate = { day: 0, month: 0, year: 0 };
export function createDeadline() {
    return newDeadline;
}
export function createDate() {
    return newDate;
}
let update = {
    creator: "",
    key: "",
    status: "",
    subject: "",
    /**
     * @type {string[]} images
     */
    images: [],
    body: "",
    nxtTitle: "",
    /**
     * @type {newDate} nxtDate
     */
    nxtDate: {
        day: 0,
        month: 0,
        year: 0
    },
    /**
     * @type {newDate} date
     */
    date: {
        day: 0,
        month: 0,
        year: 0
    },
};
export function createUpdate() {
    return update;
}

let subidea = {
    key: "",
    owner: "7klfv-r...wkg-lae",
    created: "",

    updated: "",
    data: {
        title: "an idea for this shitty app",
        subtitle: "a subtitle",
        description: "decndwiovn3ion",
        requirements: [],
        imageURL:
            "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NHx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80",
        parent: "U0f3TaPBJI9uceIOkAulW",
        amountFollowers: 0,
        pledged: 0,
        funded: 0,
        followers: [],
        transactionHistory: [],
        comments: [],
    },
};
export function createSubidea() {
    return subidea;
}
let ideaRel = {
    key: "",
    title: ""
}
let solution = {
    topic: "",
    title: "",
    subtitle: "",
    description: "",
    /**
     * @type {String[]}
     */
    images: [],
    followers: [],
    amountFollowers: 0,
    moneyPledged: 0,
    moneyFunded: 0,
    comments: [],
    opSystems: [],
    categories: [],
    topics: [],
    /**
     * @type {ideaRel[]} ideasRelated
     */
    ideasRelated: [],
    /**
     * @type {newDeadline []} 
     */
    deadlines: [],
    updates: [],
    tokensAddress: "",
    transactionHistory: []


};
export function createSolution() {
    return solution;
}
let advancedDate = {
    day: 0,
    month: 0,
    year: 2023,
    hour: 0,
    minutes: 0,
    seconds: 0,
}
export function createAdvancedDate() {
    return advancedDate;
}
let notification = {
    link: "",
    seen: false,
    picture: "",
    createBy: "",
    subject: "",
    body: "",
    /**
     * @type {advancedDate} date
     */
    date: advancedDate,
    elementName: "",
}
export function createNotification() {
    return notification;
}

let user = {
    nickname: "",
    address: "",
    walletAddress: "",
    followedIdeas: [],
    followers: [],
    picture: "",
    backgroundPicture: "",
    areasOfInterest: [],
    comments: [],
    balance: 0,
    pledged: 0,
    funded: 0,
    transactionHistory: [],
    notificationsKey: "",
    amountNotifictions: 0,
}
export function createUser() {
    return user;
}