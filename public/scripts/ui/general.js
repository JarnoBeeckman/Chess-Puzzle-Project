import { vars } from "../vars.js";
import { saveNewPuzzle, saveMiddlePuzzle, toggleArchived, toggleArchivedMiddle } from "../storage.js"
import { filterPositions } from "./filter.js";
import { nextPuzzle, handleMove, addnewPuzzle } from "../puzzleLogic.js"

export function highlightSquare(square) {
  clearHighlights();
  const el = document.querySelector(`[data-square='${square}']`);
  if (el) el.style.backgroundColor = '#a9a9a9';
}

export function clearHighlights() {
  document.querySelectorAll('[data-square]').forEach(el => {
    el.style.backgroundColor = '';
  });
}

// Function to display messages in the #message div
export function displayMessage(message, type) {
  const messageContainer = document.getElementById("message");
  messageContainer.innerHTML = `<span class="${type}">${message}</span>`;
  return messageContainer
}

export function displayNewPuzzleForm(position) {
  const puzzleNameElement = document.getElementById("puzzleName");
  puzzleNameElement.textContent = `Puzzle: Adding new puzzle`;

  // Display a form to capture the puzzle name
  const messageContainer = document.getElementById("message");

  messageContainer.innerHTML = `
    <h3>Set Up a New Puzzle</h3>
    ${position.fen ? '' : `<button id="flipBoard" class="flip">Flip Board</button> <!-- Flip Board Button -->
    <button id="setStartingPosition" class="save">Start recording moves</button> <!-- Set Starting Position -->
    <label for="puzzleNameInput">Puzzle Name:</label>
    <input type="text" id="puzzleNameInput" placeholder="Enter puzzle name" />`}
    <button id="saveNewPuzzle" class="save">Save Puzzle</button>
  `;
  // Add an event listener for saving the puzzle

  if (!position.fen) {
    document.getElementById("saveNewPuzzle").addEventListener("click", () => saveNewPuzzle());
    // Flip Board Button Handler
    document.getElementById("flipBoard").addEventListener("click", () => {

      vars.board.flip(); // Flip the chessboard
      vars.isWhite = !vars.isWhite; // Toggle isWhite flag
    });
    document.getElementById("setStartingPosition").addEventListener("click", () => {
      vars.startingFen = vars.chess.fen(); // Save the current board position as the starting FEN
      vars.setupMoveIndex = vars.chess.history().length; // Record the move index when the starting position is set
    });
  } else
    document.getElementById("saveNewPuzzle").addEventListener("click", () => saveMiddlePuzzle(position));
}

export function showArchiveControls() {
  const container = document.getElementById("message");
  container.innerHTML = "";

  const current = vars.filteredSavedPositions[vars.puzzleIndex];
  const isArchived = current.archived === true;

  const archiveBtn = document.createElement("button");
  archiveBtn.textContent = isArchived ? "Unarchive" : "Archive";
  archiveBtn.className = "btn archive-btn";
  archiveBtn.onclick = () => {
    if (current.middleId) {
      toggleArchivedMiddle()
      const relatedMiddlegames = vars.savedMiddlegames.filter(x => x.fk === vars.currentId && !x.archived)
      if (relatedMiddlegames.length === 1) toggleArchived()
    }
    else toggleArchived()
  };
  container.appendChild(archiveBtn);

  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Continue";
  continueBtn.className = "btn continue-btn";
  continueBtn.onclick = () => {
    container.innerHTML = "";
    nextPuzzle();
  };
  container.appendChild(continueBtn);
}

// Set up event listeners
document.getElementById("addPuzzle").addEventListener("click", addnewPuzzle);
document.getElementById("filterPuzzle").addEventListener("click", filterPositions);
document.getElementById("skipPuzzle").addEventListener("click", nextPuzzle);
// Mobile clicking
document.querySelector('#board').addEventListener('touchstart', (event) => {
  event.preventDefault(); // Remove mobile tap delay

  const squareEl = event.target.closest('.square-55d63');
  if (!squareEl) return;

  const square = squareEl.getAttribute('data-square');
  const piece = vars.chess.get(square);

  if (!vars.selectedSquare) {
    // First time selecting a piece
    if (piece && piece.color === vars.chess.turn()) {
      vars.selectedSquare = square;
      highlightSquare(square);
    }
  } else {
    if (piece && piece.color === vars.chess.turn()) {
      // Change selection to a different piece (same side)
      clearHighlights();
      vars.selectedSquare = square;
      highlightSquare(square);
    } else {
      // Attempt to move to empty square or opponent's piece
      handleMove(vars.selectedSquare, square);
      clearHighlights();
      vars.selectedSquare = null;
    }
  }
});

// Settings modal logic
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const settingsClose = settingsModal.querySelector(".close");
const archiveToggle = document.getElementById("bulkArchiveToggle");

// Open settings
settingsBtn.addEventListener("click", () => {
  settingsModal.style.display = "block";
  archiveToggle.checked = vars.bulkArchiveMode; // show current state
});

// Close settings (X button or outside click)
settingsClose.addEventListener("click", () => settingsModal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === settingsModal) settingsModal.style.display = "none";
});

// Toggle bulk archive mode
archiveToggle.addEventListener("change", e => {
  vars.bulkArchiveMode = e.target.checked;
});
