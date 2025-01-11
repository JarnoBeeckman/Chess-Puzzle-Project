import positions from '../positions.json' assert { type: 'json' };

// Extract opening codes and count them
const codeCounts = positions.reduce((acc, puzzle) => {
    const match = puzzle.name.match(/^([A-Z]\d{2})/); // Match codes like D44, C67
    if (match) {
        const code = match[1];
        acc[code] = (acc[code] || 0) + 1;
    }
    return acc;
}, {});

// Convert the result to an array, sort it alphabetically by code, and display
const sortedResults = Object.entries(codeCounts)
    .sort((a, b) => a[0].localeCompare(b[0])) // Sort by code alphabetically
    .map(([code, count]) => ({ code, count })); // Format for better readability

console.log("Sorted opening codes and their counts by code:");
console.log(sortedResults);
