import { vars } from "./vars.js";

export async function getPositions() {
  try {

    const response = await fetch("/positions");
    const data = await response.json();
    if (data) {
      vars.savedPositions = data.openings;
      vars.savedMiddlegames = data.middlegames
    }

  } catch (error) {
    console.error("Error fetching positions:", error);
    alert("Failed to fetch saved positions. Please try again.");
  }
}

export function getFromLocalStorage(key) {
  try {
    const jsonData = localStorage.getItem(key); // Haalt de JSON-string op
    return jsonData ? JSON.parse(jsonData) : []; // Converteert terug naar het originele formaat
  } catch (error) {
    console.error("Er is een fout opgetreden bij het ophalen van local storage:", error);
    return null;
  }
}

export function saveToLocalStorage(key, value) {
  try {
    const jsonData = JSON.stringify(value); // Converteert de data naar een JSON-string
    localStorage.setItem(key, jsonData); // Slaat de JSON-string op in de local storage
  } catch (error) {
    console.error("Er is een fout opgetreden bij het opslaan naar local storage:", error);
  }
}

// Save to server
export async function saveNewPuzzle() {
  const puzzleNameInput = document.getElementById("puzzleNameInput");
  const puzzleName = puzzleNameInput.value.trim();

  if (!puzzleName) {
    alert("Please enter a name for the puzzle.");
    return;
  }
  const moves = vars.chess.history(); // Moves made during setup
  const puzzlemoves = moves.slice(vars.setupMoveIndex)

  try {
    await fetch("/positions/opening", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: puzzleName, fen: vars.startingFen, moves: puzzlemoves, id: vars.savedPositions.length, archived: false }),
    });
    alert("Puzzle saved")
  } catch (error) {
    console.error("Error saving new puzzle:", error);
  }
  getPositions();
}

// Save to server
export async function saveMiddlePuzzle(position) {

  const moves = vars.chess.history(); // Moves made during setup
  const puzzlemoves = moves.slice(vars.setupMoveIndex)

  try {
    await fetch("/positions/middle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: position.fen, moves: puzzlemoves, id: vars.savedMiddlegames.length, fk: position.id }),
    });
    alert("Puzzle saved")
  } catch (error) {
    console.error("Error saving new puzzle:", error);
  }
  getPositions();
}

export async function toggleArchived() {
  try {
    await fetch("/positions/opening", {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: vars.currentId })
    })
  } catch (error) {
    console.error("Error saving new puzzle:", error);
  }
}