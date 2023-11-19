import { getDoc, listDocs, setDoc } from "@junobuild/core";

let kickoffDeadline = {
    newDate: { day: 0, month: 0, year: 0 },
    title: "Project kick-off",
};
let launchDeadline = {
    newDate: { day: 0, month: 0, year: 0 },
    title: "Solution launch",
};
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
    deadlines: [
        kickoffDeadline,
        launchDeadline
    ],
};


/**
BRIEF DESCRIPTION: This function validates a solution that is trying to be uploaded to Solutio's database.
It receives a solution and checks that all expected fields are filled, and check that the dates of the 
deadlines are not in the past and are coherent between each other (for example, the launch of a project
cant happen after the project's finalization).

PRE-CONDITIONS: Receives a solution. User needs to be signed in.


POST-CONDITIONS: Returns the result of the validator.

result = {
        topicKey: "empty",
        title: "empty",
        subtitle: "empty",
        description: "empty",
        deadlines: {
            projectKO: "empty",
            solutionLaunch: "empty",
        },
        relatedCategories: "empty",
        image: "empty",
    };

OUTSIDE FUNCTIONS: --None--
 * @param {solution} solution
 */
export async function validateSolution(solution) {
    let result = {
        topicKey: "empty",
        title: "empty",
        subtitle: "empty",
        description: "empty",
        deadlines: {
            projectKO: "empty",
            solutionLaunch: "empty",
        },
        relatedCategories: "empty",
        image: "empty",
    };
    console.log("solution", solution);
    if (solution.topic != null && (solution.topic != " ") && (solution.topic != "")) {
        result.topicKey = "ok";
        let topicExists = await checkTopicKey(solution.topic, "ideas");
        if (!topicExists) {
            result.topicKey = "doesnt exist";
        }

    };
    if (solution.title != "") {
        result.title = "ok";
    };
    if (solution.subtitle != "") {
        result.subtitle = "ok";
    };
    if (solution.description != "") {
        result.description = "ok";
    };
    if (solution.deadlines[solution.deadlines.length - 2].newDate.day != null && solution.deadlines[solution.deadlines.length - 2].newDate.month != null && solution.deadlines[solution.deadlines.length - 2].newDate.year != null) {
        result.deadlines.projectKO = "ok";
        let date = solution.deadlines[solution.deadlines.length - 2].newDate;
        let isInFuture = DateInTheFutureValidator(date.day, date.month, date.year)
        if (!isInFuture) {
            result.deadlines.projectKO = "not in the future";
        }
    };
    if (solution.deadlines[solution.deadlines.length - 1].newDate.day != null && solution.deadlines[solution.deadlines.length - 1].newDate.month != null && solution.deadlines[solution.deadlines.length - 1].newDate.year != null) {
        result.deadlines.solutionLaunch = "ok";
        let date = solution.deadlines[solution.deadlines.length - 1].newDate;
        let isInFuture = DateInTheFutureValidator(date.day, date.month, date.year)
        if (!isInFuture) {
            result.deadlines.solutionLaunch = "not in the future";
        }
    };
    if (result.deadlines.solutionLaunch == "ok" && result.deadlines.projectKO == "ok") {
        let inOrder = checkCronologicalOrder(solution.deadlines[solution.deadlines.length - 2], solution.deadlines[solution.deadlines.length - 1])
        if (!inOrder) {
            result.deadlines.solutionLaunch = "not in order";
            result.deadlines.projectKO = "not in order";
        }

    };
    if (solution.categories.length != 0) {
        result.relatedCategories = "ok";
    };
    if (solution.images.length > 0) {
        result.image = "ok";
    } else {
        return result;
    }
    if (solution.images[0] != "" && solution.images[0] != " ") {
        result.image = "ok";
    };
    return result;



}
let validator = {
    topicKey: "empty",
    title: "empty",
    subtitle: "empty",
    description: "empty",
    deadlines: {
        projectKO: "empty",
        solutionLaunch: "empty",
    },
    relatedCategories: "empty",
    image: "empty",
};
/**
BRIEF DESCRIPTION: This function checks if the validator returned some error or not. It basically checks if 
the result from the validateSolution() return an error it any of its fields.

PRE-CONDITIONS: Receives the validator result. User needs to be signed in.

POST-CONDITIONS: Returns true if everything its ok, false otherwise.

OUTSIDE FUNCTIONS: --None--
 * @param {validator} validator
 */
export function checkValidatorSolution(validator) {
    if (validator.topicKey != "ok" || validator.title != "ok" ||
        validator.subtitle != "ok" || validator.description != "ok" ||
        validator.deadlines.projectKO != "ok" || validator.deadlines.solutionLaunch != "ok" ||
        validator.relatedCategories != "ok" || validator.image != "ok"
    ) {
        return false;
    }
    return true;
}
/**
 * @param {string} TopicKey
 * @param {string} collectionName
 */
async function checkTopicKey(TopicKey, collectionName) {
    const MyList = await listDocs({
        collection: collectionName,
    });
    let items = MyList?.items;
    for (let i = 0; i < items.length; i++) {
        // @ts-ignore
        if (items[i]?.key == TopicKey) {
            return true;
        }
    }
    return false;
}
/**
 * @param {number} day
 * @param {number} month
 * @param {number} year
 */
export function DateInTheFutureValidator(day, month, year) {
    // return false if its in the past. true otherwise
    let presentDate = new Date();
    console.log("Present date: ", presentDate);
    let currentDay = presentDate.getDate();
    let currentMonth = presentDate.getMonth() + 1;

    let currentYear = presentDate.getFullYear();
    let yearString = year.toString();
    if (yearString.length == 2) {
        yearString = "20" + yearString;
        year = parseInt(yearString);
    } else if (yearString.length != 4) {
        return false;
    }
    if (currentYear <= year) {
        if (currentYear < year) {
            return true;
        }
        if (currentMonth <= month) {
            if (currentMonth < month) {
                return true;
            }
            if (currentDay <= day) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * @param {kickoffDeadline} deadline1
 * @param {launchDeadline} deadline2
 */
function checkCronologicalOrder(deadline1, deadline2) {
    let day1 = deadline1.newDate.day;
    let month1 = deadline1.newDate.month;
    let year1 = deadline1.newDate.year;
    let day2 = deadline2.newDate.day;
    let month2 = deadline2.newDate.month;
    let year2 = deadline2.newDate.year;
    let yearString1 = year1.toString();
    let yearString2 = year2.toString();
    if (yearString1.length == 2) {
        yearString1 = "20" + yearString1;
        year1 = parseInt(yearString1);
    } else if (yearString1.length != 4) {
        return false;
    }
    if (yearString2.length == 2) {
        yearString2 = "20" + yearString2;
        year2 = parseInt(yearString2);
    } else if (yearString2.length != 4) {
        return false;
    }
    if (year1 <= year2) {
        if (year1 < year2) {
            return true;
        }
        if (month1 <= month2) {
            if (month1 < month2) {
                return true;
            }
            if (day1 <= day2) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }

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


/**
BRIEF DESCRIPTION: This function validates a topic that is trying to be uploaded to Solutio's database.
It receives a topic and checks that all expected fields are filled.

PRE-CONDITIONS: Receives a topic. User needs to be signed in.


POST-CONDITIONS: Returns the result of the validator.

result = {
         title: "empty",
        subtitle: "empty",
        description: "empty",
        relatedCategories: "empty",
        image: "empty",
    };

OUTSIDE FUNCTIONS: --None--
 * @param {topic} topic
 */
export async function validateTopic(topic) {
    let result = {
        title: "empty",
        subtitle: "empty",
        description: "empty",
        relatedCategories: "empty",
        image: "empty",
    };
    if (topic.title != "") {
        result.title = "ok";
    };
    if (topic.subtitle != "") {
        result.subtitle = "ok";
    };
    if (topic.description != "") {
        result.description = "ok";
    };
    if (topic.categories.length != 0) {
        result.relatedCategories = "ok";
    };
    if (topic.image != "" && topic.image != " ") {
        result.image = "ok";
    } else {
        return result;
    }

    return result;
}
let validatorTop = {
    title: "empty",
    subtitle: "empty",
    description: "empty",
    relatedCategories: "empty",
    image: "empty",
};
/**
BRIEF DESCRIPTION: This function checks if the validator returned some error or not. It basically checks if 
the result from the validateTopic() returned an error it any of its fields.

PRE-CONDITIONS: Receives the validator result. User needs to be signed in.


POST-CONDITIONS: Returns true if everything its ok, false otherwise.


OUTSIDE FUNCTIONS: --None--
 * @param {validatorTop} validator
 */
export function checkValidatorTopic(validator) {
    if (validator.title != "ok" ||
        validator.subtitle != "ok" || validator.description != "ok" ||
        validator.image != "ok" || validator.relatedCategories != "ok"
    ) {
        return false;
    }
    return true;
}