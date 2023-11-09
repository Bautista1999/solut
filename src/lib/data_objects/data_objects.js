let newDeadline = { newDate: { day: 0, month: 0, year: 0 }, title: "" };
let newDate = { day: 0, month: 0, year: 0 };
let detailedDate = { day: 0, month: 0, year: 0, minutes: 0, hours: 0, };
export function createDeadline() {
    return newDeadline;
}
export function createDate() {
    return newDate;
}
export function createDetailedDate() {
    return detailedDate;
}
let currentDate = new Date();
export function CurrentDate() {
    let today = createDetailedDate();
    today.day = currentDate.getDate()
    today.month = currentDate.getMonth() + 1;
    today.year = currentDate.getFullYear();
    today.hours = currentDate.getHours();
    today.minutes = currentDate.getMinutes();
    return today;
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
let finalUpdate = {
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
    link: "",
    walletAddress: "",
};
export function createFinalUpdate() {
    return finalUpdate;
}
let fnlUpdate = createFinalUpdate();
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
    transactionHistory: [],


    finalUpdate: fnlUpdate,



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
let pledgeElement = {
    key: "",
    amount: 0,
};
export function createPledgedElement() {
    return pledgeElement;
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
    /**
     * @type {pledgeElement []} pledgedElements
     */
    pledgedElements: [],
}
export function createUser() {
    return user;
}

let topic = {
    title: "",
    subtitle: "",
    description: "",
    image: "",
    followers: [],
    amountFollowers: 0,
    moneyPledged: 0,
    moneyFunded: 0,
    transactionHistory: [],
    comments: [],
    opSystems: [],
    categories: [],
    solutions: [],
    ideas: [],
};
export function createTopic() {
    return topic;
}
let myDoc = {
    created_at: 0,
    data: createTopic(),
    description: "",
    key: "",
    owner: "",
    updated_at: 0,

}
export function createJunoTopic() {
    return myDoc;
}
let myDoc2 = {
    created_at: 0,
    data: createSolution(),
    description: "",
    key: "",
    owner: "",
    updated_at: 0,

}
export function createJunoSolution() {
    return myDoc2;
}

let transfer = {
    idea: "",
    amountICP: 3.4,
    sentTo: "",
    date: newDate,
}
export function createTransfer() {
    return transfer;
}

let approvalResult = {
    Error: "",
    creatorTransfer: "",
    developerTransfer: ""
};
export function createTransferResult() {
    return approvalResult;
}
