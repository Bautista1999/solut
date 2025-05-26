import { writeFileSync, appendFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const TOTAL_LINES = 2000000;
const BATCH_SIZE = 10000; // Write in batches for better performance
const OUTPUT_FILE = 'million_lines.txt';

console.log('Starting text file generation...');
console.time('Generation time');

// Create or truncate the file
writeFileSync(OUTPUT_FILE, '');

// Generate and write lines in batches
for (let i = 0; i < TOTAL_LINES; i += BATCH_SIZE) {
    let batch = '';
    const endIndex = Math.min(i + BATCH_SIZE, TOTAL_LINES);
    
    for (let j = i; j < endIndex; j++) {
        // Generate a simple text line with a number and timestamp
        batch += `Line ${j + 1}: Text line generated at ${new Date().toISOString()}\n`;
    }
    
    // Append the batch to file
    appendFileSync(OUTPUT_FILE, batch);
    
    // Progress update every 10%
    if (i % (TOTAL_LINES / 10) === 0) {
        const progress = ((i / TOTAL_LINES) * 100).toFixed(1);
        console.log(`Progress: ${progress}%`);
    }
}

console.timeEnd('Generation time');

// Get file stats
const stats = statSync(OUTPUT_FILE);
console.log(`Text file size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Text file created successfully at: ${resolve(OUTPUT_FILE)}`);