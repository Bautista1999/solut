import { nanoid } from "nanoid";

export let key = "";
export let images = [
    "https://cloudfront-us-east-2.images.arcpublishing.com/reuters/4CG5FU4IIJMHZCDXESLO7GEYDM.jpg",
    "https://media.ambito.com/p/9c57bcc58b3be5c19ea3a38d32f54fca/adjuntos/239/imagenes/038/684/0038684219/1200x675/smart/ethereum-banco-centraljpg.jpg",
    "https://s2-valor.glbimg.com/oXwS6x_i8WgCUl-XfqaLBdWpyRk=/0x0:3973x2649/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_63b422c2caee4269b8b34177e8876b93/internal_photos/bs/2023/V/1/0BYTKITrifXhSGhdSv5w/btc-e-eth-unsplash.jpg",
];
export let title = "An example of an amazing idea! Heres an Example";
export let subtitle =
    "Empowering Innovation: Solutio's Decentralized Platform for Crowdsourcing and Collaborative Development. Located in Llyion, France. This app should try to go bananas on the features, should make ev";
export let description =
    "This idea is a decentralized platform designed to transform how ideas are shared, developed, and funded. Users can submit ideas, crowdsource feature requests to address these ideas, and crowdfund resources to bring the best features to life. This platform leverages blockchain technology to ensure transparency and fairness, allowing contributors to earn bounties and users to pay only upon delivery. Solutio's innovative use of a reputation system enhances safety and trust without requiring KYC, supporting anonymous accounts for those prioritizing privacy.";
export let user = "Johannes Jung";
export let userPicture =
    "https://i.pinimg.com/474x/05/c3/59/05c359cd010df3e7f1ea3cb6f6f54fad.jpg";
    export let expected = 100000;
    export let total = 120000;
    export let totalFollowers = 14560;
    export let amountPledgers = 100;
export let createdAt = "17 August, 2023";
export let pledgersImages = [
    "https://cdn.weasyl.com/static/media/88/89/98/8889989c353bd7d79a5a56daf9b118ed72a9b3f7f5c852f7c9daef6bbf105225.png",
    "https://avatarfiles.alphacoders.com/103/103875.png",
    "https://i.pinimg.com/236x/63/dd/c2/63ddc24b5f730d8fe4134708fbcc93df.jpg",
    "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
    "https://i.pinimg.com/474x/05/c3/59/05c359cd010df3e7f1ea3cb6f6f54fad.jpg",
    "https://preview.redd.it/trying-to-come-up-with-a-new-avatar-for-my-various-social-v0-wby69l6e1lsb1.jpg?width=519&format=pjpg&auto=webp&s=61341c3ce447f8356da3146c1903395fc43d28dc"
];
export let featureExample = {
    title: title,
    subtitle: subtitle,
    description: description,
    expected: expected,
    total: total,
    image: images[0],
    key: nanoid(),
    user: user,
    userPicture: userPicture,
    createdAt: createdAt,
    pledgersImages: pledgersImages,
    amountFollowers: 14,
};
export let featureExample2 = {
    title: title,
    subtitle: subtitle,
    description: description,
    expected: 500,
    total: 800,
    image: images[1],
    key: nanoid(),
    user: user,
    userPicture: pledgersImages[3],
    createdAt: createdAt,
    pledgersImages: pledgersImages.slice(0, 4),
    amountFollowers: 0.5,
};
export let featureExample3 = {
    title: title,
    subtitle: subtitle,
    description: description,
    expected: 1700,
    total: 1750,
    image: images[2],
    key: nanoid(),
    user: user,
    userPicture: pledgersImages[2],
    createdAt: createdAt,
    pledgersImages: pledgersImages.slice(1, 4),
    amountFollowers: 7,
};
export let featuresExamples = [
    featureExample,
    featureExample2,
    featureExample3,
    featureExample,
    featureExample,
    featureExample2,
    // featureExample,
    // featureExample,
    // featureExample3,
];
export let transaction = {
    image: images[0], // Replace with your image path
    transactionType: "Pledge",
    description: "erik_thebest",
    date: "17 July 2024",
    currency: "ICP",
    amount: "5.11",
};
export let transaction2 = {
    image: images[1], // Replace with your image path
    transactionType: "Pledge",
    description: "eljuan_sito",
    date: "17 July 2024",
    currency: "ICP",
    amount: "4.03",
};
export let transaction3 = {
    image: images[2], // Replace with your image path
    transactionType: "Pledge",
    description: "snassy.icp",
    date: "17 July 2024",
    currency: "ICP",
    amount: "3.45",
};
export let transaction4 = {
    image: images[0], // Replace with your image path
    transactionType: "Pledge",
    description: "sakimoto--icp",
    date: "17 July 2024",
    currency: "ICP",
    amount: "11.45",
};
export let transactions = [
    transaction,
    transaction2,
    transaction3,
    transaction4,
];