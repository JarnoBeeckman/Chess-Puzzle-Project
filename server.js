import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';  // To interact with the file system
import path from 'path';  // To work with paths

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (like CSS, JS, images) from the "public" folder
app.use(express.static(path.join(process.cwd(), 'public')));

// Set the path for positions.json file
const positionsFilePath = path.join(process.cwd(), 'positions.json');

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

// Save positions to the JSON file
function savePositions(positions) {
  try {
    fs.writeFileSync(positionsFilePath, JSON.stringify(positions, null, 2), 'utf8');
    console.log('Positions saved to positions.json');
  } catch (err) {
    console.error('Error saving positions file:', err);
  }
}

// Endpoint to fetch saved positions
app.get("/positions", (req, res) => {
  const savedPositions = getSavedPositions();  // Read positions from the file
  res.json(savedPositions);  // Send saved positions as the response
});

// Endpoint to save a new position
app.post("/positions", (req, res) => {
  const { fen, name, moves, id } = req.body;
  if (fen && moves && name && id) {
    const savedPositions = getSavedPositions();  // Get the current saved positions
    savedPositions.push({ fen, name, moves, id });  // Add the new position
    savePositions(savedPositions);  // Save the updated list back to positions.json
    res.json({ message: "Position saved successfully!" });
  } else {
    res.status(400).json({ message: "Invalid data provided." });
  }
});

// Endpoint to update an existing position by index
/*app.put("/positions/:index", (req, res) => {
  const { index } = req.params; // Get index from the URL
  const { moves } = req.body; // Updated moves from the request body

  const savedPositions = getSavedPositions(); // Get the current saved positions

  // Validate the index and moves
  if (index >= 0 && index < savedPositions.length && moves) {
    savedPositions[index].moves = moves; // Update the moves for the position
    savePositions(savedPositions); // Save the updated positions to the file
    res.json({ success: true, message: "Position updated successfully!" });
  } else {
    res.status(400).json({ success: false, message: "Invalid index or data provided." });
  }
});*/


// Serve the `index.html` file on the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
