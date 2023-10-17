let update = {
    creator: "",
    status: "",
    subject: "",
    /**
     * @type {string[]} images
     */
    images: [],
    body: "",
    nxtTitle: "",
    nxtDate: "",
    date: "",
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
    ideasRelated: [],
    deadlines: [],
    updates: [],
    tokensAddress: "",


};
export function createSolution() {
    return solution;
}