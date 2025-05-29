import fs from 'fs';  // To interact with the file system
const positionsFilePath = path.join(process.cwd(), 'positions.json');
import path from 'path';  // To work with paths

// Save positions to the JSON file
function savePositions(positions) {
  try {
    fs.writeFileSync(positionsFilePath, JSON.stringify(positions, null, 2), 'utf8');
    console.log('Positions saved to positions.json');
  } catch (err) {
    console.error('Error saving positions file:', err);
  }
}

// Read saved positions from the JSON file
function getSavedPositions() {
  try {
    const data = fs.readFileSync(positionsFilePath, 'utf8');
    return JSON.parse(data); // Parse the JSON data
  } catch (err) {
    console.error('Error reading positions file:', err);
    return [];  // Return empty array if there's an error reading the file
  }
}

const savedPositions = getSavedPositions();
savedPositions.forEach((pos) => {
  if (!pos.archived)
    pos.archived = false;
})

savePositions(savedPositions)