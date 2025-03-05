import { appendFileSync } from 'fs';

// Arrays for generating random sentences
const subjects = ['The cat', 'A dog', 'The programmer', 'Someone', 'My friend', 'The robot', 'The car', 'A bird'];
const verbs = ['jumped', 'ran', 'wrote', 'clicked', 'flew', 'drove', 'sang', 'danced'];
const objects = ['over the fence', 'through the code', 'under the bridge', 'around the park', 'in the sky', 'on the road'];

// Function to generate a random sentence
function generateRandomSentence() {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const object = objects[Math.floor(Math.random() * objects.length)];
    return `${subject} ${verb} ${object}.`;
}

// Generate 100,000 lines
let content = '';
for (let i = 0; i < 2000000; i++) {
    content += generateRandomSentence() + '\n';
    
    // Write to file every 10,000 lines to manage memory
    if (i % 10000 === 0 && i !== 0) {
        appendFileSync('random2mLines.txt', content);
        content = '';
        console.log(`Generated ${i} lines...`);
    }
}
if (content) {
    appendFileSync('random2mLines.txt', content);
}

console.log('Generated 100,000 lines of random text successfully!'); 