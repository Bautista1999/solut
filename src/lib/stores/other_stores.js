import { writable } from 'svelte/store';

/**
BRIEF DESCRIPTION: Loading store mainly for the create folder. As the folder manages to separate screens,
the topic creation and solution creation, we need to have a global loading variable to change the state of 
the create screen.
 */
export const isLoading = writable(false);
/**
BRIEF DESCRIPTION: For successfull sign in.
 */
export const signInSuccessful = writable(false);
/**
BRIEF DESCRIPTION: To know if the user is signed in or not
 */
export const loginedIn = writable(false);

/**
BRIEF DESCRIPTION: Many modals are created for a shared component in the "/components" folder. This means,
modals that are not created for specific screens but to be shared by all of them which are interested to use them.
To manage their state, to see if its needs to be opened or not, these modals suscribe to a store that can 
be changed by other files that may want to use that modal. This example is for the pledge modal.
 */
export const pledgeModal = writable(false);
/**
BRIEF DESCRIPTION: Many modals are created for a shared component in the "/components" folder. This means,
modals that are not created for specific screens but to be shared by all of them which are interested to use them.
To manage their state, to see if its needs to be opened or not, these modals suscribe to a store that can 
be changed by other files that may want to use that modal. This example is for the update modal for developers.
 */
export const updateModal = writable(false);
/**
BRIEF DESCRIPTION: Many modals are created for a shared component in the "/components" folder. This means,
modals that are not created for specific screens but to be shared by all of them which are interested to use them.
To manage their state, to see if its needs to be opened or not, these modals suscribe to a store that can 
be changed by other files that may want to use that modal. This example is for the terms and conditions modal.
 */
export const termsModal = writable(false);
/**
BRIEF DESCRIPTION: Many modals are created for a shared component in the "/components" folder. This means,
modals that are not created for specific screens but to be shared by all of them which are interested to use them.
To manage their state, to see if its needs to be opened or not, these modals suscribe to a store that can 
be changed by other files that may want to use that modal. This example is for the subidea modal, specifically
used by the idea screen and solution screen.
 */
export const subideaModal = writable(false);
/**
BRIEF DESCRIPTION: Store for when a subidea data is loading from the database.
 */
export const subideaLoading = writable(false);
/**
BRIEF DESCRIPTION: Many modals are created for a shared component in the "/components" folder. This means,
modals that are not created for specific screens but to be shared by all of them which are interested to use them.
To manage their state, to see if its needs to be opened or not, these modals suscribe to a store that can 
be changed by other files that may want to use that modal. This example is for the post update modal, 
specifically used by the solution screen, when the developer wants to post an update.
 */
export const PostUpdateModal = writable(false);
/**
BRIEF DESCRIPTION: Many modals are created for a shared component in the "/components" folder. This means,
modals that are not created for specific screens but to be shared by all of them which are interested to use them.
To manage their state, to see if its needs to be opened or not, these modals suscribe to a store that can 
be changed by other files that may want to use that modal. This example is for the finish modal, 
specifically used by the solution screen, when the developer wants to finish the project.
 */
export const finishProject = writable(false);
/**
 * @type {string[]}
 */
let images = [];
/**
BRIEF DESCRIPTION: This store was created to handle provided images by the an update created by a developer.
 */
export const updateImages = writable(images);
/**
BRIEF DESCRIPTION: This store was created to handle displayed images by the an update created by a developer.
This one contains the images that are being displayed on the update in current moment. If you click the slide button, 
this list changes.
 */
export const displayedUpdImages = writable(images);
/**
BRIEF DESCRIPTION: This store was created to handle the amount of notifications received by the signed in 
user.
 */
export const amountNotis = writable(0);


