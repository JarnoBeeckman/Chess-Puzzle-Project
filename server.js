import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';  // To interact with the file system
import path from 'path';  // To work with paths

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (like CSS, JS, images) from the "public" folder
// eslint-disable-next-line no-undef
app.use(express.static(path.join(process.cwd(), 'public')));

// Set the path for positions.json file
// eslint-disable-next-line no-undef
const positionsFilePath = path.join(process.cwd(), 'positions.json');
// eslint-disable-next-line no-undef
const middleFilePath = path.join(process.cwd(), 'middlegames.json');

// Read saved positions from the JSON file
function getSavedPositions() {
  try {
    const data = fs.readFileSync(positionsFilePath, 'utf8');
    return JSON.parse(data); // Parse the JSON data
  } catch (err) {
    console.error('Error reading files:', err);
    return [];  // Return empty array if there's an error reading the file
  }
}

function getSavedMiddles() {
  try {
    const data2 = fs.readFileSync(middleFilePath, 'utf8');
    return JSON.parse(data2); // Parse the JSON data
  } catch (err) {
    console.error('Error reading middlegames:', err);
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

// Save positions to the JSON file
function saveMiddlegames(positions) {
  try {
    fs.writeFileSync(middleFilePath, JSON.stringify(positions, null, 2), 'utf8');
    console.log('Middlegames saved to middlegames.json');
  } catch (err) {
    console.error('Error saving middlegames file:', err);
  }
}

// Endpoint to fetch saved positions
app.get("/positions", (req, res) => {
  const savedPositions = getSavedPositions();  // Read positions from the file
  const savedMiddles = getSavedMiddles();
  res.json({ openings: savedPositions, middlegames: savedMiddles });  // Send saved positions as the response
});

// Endpoint to save a new position
app.post("/positions/opening", (req, res) => {
  const { fen, name, moves, id, archived } = req.body;
  if (fen && moves && name && id) {
    const savedPositions = getSavedPositions();  // Get the current saved positions
    savedPositions.push({ fen, name, moves, id, archived });  // Add the new position
    savePositions(savedPositions);  // Save the updated list back to positions.json
    res.json({ message: "Position saved successfully!" });
  } else {
    res.status(400).json({ message: "Invalid data provided." });
  }
});

// Endpoint to save a new middlegame
app.post("/positions/middle", (req, res) => {
  const { fen, moves, id, fk } = req.body;
  if (fen && moves && id >= 0 && fk >= 0) {
    const savedPositions = getSavedMiddles();  // Get the current saved positions
    savedPositions.push({ fen, moves, id, fk });  // Add the new position
    saveMiddlegames(savedPositions);  // Save the updated list back to middlegames.json
    res.json({ message: "Middlegame saved successfully!" });
  } else {
    res.status(400).json({ message: "Invalid data provided." });
  }
});

app.put("/positions/opening", (req, res) => {
  const { id } = req.body;
  if (id) {
    const data = getSavedPositions();
    const index = data.findIndex(p => p.id === id);
    if (index >= 0) data[index].archived = !data[index].archived;
    savePositions(data);
    res.json({ message: "Toggled archived succesfully!" });
  } else {
    res.status(400).json({ message: "Invalid data provided." });
  }
})

app.put("/positions/middle", (req, res) => {
  const { id } = req.body;
  if (id) {
    const data = getSavedMiddles();
    const index = data.findIndex(p => p.id === id);
    if (index >= 0) data[index].archived = !data[index].archived;
    saveMiddlegames(data);
    res.json({ message: "Toggled archived succesfully!" });
  } else {
    res.status(400).json({ message: "Invalid data provided." });
  }
})


// Serve the `index.html` file on the root route
app.get("/", (req, res) => {
  // eslint-disable-next-line no-undef
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Start the server
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
