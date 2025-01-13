const board = Chessboard("board", {
  draggable: true,
  position: "start",
  onDrop: handleMove,
});

let startingFen = "";
let setupMoveIndex = 0; // Tracks the index of the last move in history when the starting position is set

const chess = new Chess();
let savedPositions = [];
let filteredSavedPositions = [];
let puzzleIndex = 0;
let currentMoveIndex = 0; // Tracks the current move in the opening sequence
let isWhite = true; // Tracks if you are playing white or black
let moveSequence = []; // Tracks the sequence of moves (for alternating)


// Fetch saved positions
async function fetchPositions() {
  try {
    const response = await fetch("/positions");
    const data = await response.json();
    savedPositions = data;
    
    if (savedPositions.length === 0) {
      alert("No saved positions found.");
    }
  } catch (error) {
    console.error("Error fetching positions:", error);
    alert("Failed to fetch saved positions. Please try again.");
  }
}

// Display saved positions
/*function displayPositions() {
  const container = document.getElementById("message");
  container.innerHTML = "<h3>Saved Positions:</h3>";

  const list = document.createElement("ul");
  savedPositions.forEach((position, index) => {
    const listItem = document.createElement("li");

    // Show FEN and moves
    listItem.innerHTML = `
      <strong>Position ${index + 1}</strong>:<br />
      Name: ${position.name} <br/>
      Color: ${position.fen.split(' ')[1] === 'w' ? "White" : "Black"}<br />
      Moves: <input type="text" id="moves-${index}" value="${position.moves.join(", ")}"}/><br />
      <button class="save" id="save-${index}")">Save</button>
    `;
    listItem.querySelector(`#save-${index}`).addEventListener("click", async () => {
      const updatedMoves = document.getElementById(`moves-${index}`).value.split(",").map(move => move.trim());
      position.moves = updatedMoves;

      try {
         await fetch(`/positions/${index}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ moves: updatedMoves }),
        });

      } catch (error) {
        console.error("Error updating position:", error);
      }
    });

    list.appendChild(listItem);
  });

  container.appendChild(list);
}*/

// Filter and display positions
function filterPositions() {
  const container = document.getElementById("message");
  container.innerHTML = "<h3>Filter Puzzles:</h3>";

  // Create filter inputs
  const filterContainer = document.createElement("div");
  filterContainer.innerHTML = `
    <label for="codeFilter">Filter by Code:</label>
    <input type="text" id="codeFilter" placeholder="e.g., A00, D40"><br/>

    <label for="nameFilter">Filter by Name:</label>
    <input type="text" id="nameFilter" placeholder="e.g., Queen's Gambit"><br/>

    <label for="colorFilter">Filter by Color:</label>
    <select id="colorFilter">
      <option value="">Any</option>
      <option value="w">White</option>
      <option value="b">Black</option>
    </select><br/>

    <button id="applyFilter">Apply Filter</button>
  `;
  container.appendChild(filterContainer);

  const resultsContainer = document.createElement("div");
  resultsContainer.id = "resultsContainer";
  container.appendChild(resultsContainer);

  // Add event listener for filtering
  document.getElementById("applyFilter").addEventListener("click", () => {
    const codeFilter = document.getElementById("codeFilter").value.trim().toUpperCase();
    const nameFilter = document.getElementById("nameFilter").value.trim().toLowerCase();
    const colorFilter = document.getElementById("colorFilter").value;

    // Filter saved positions based on the inputs
    filteredSavedPositions = savedPositions.filter(position => {
      const codeMatches = codeFilter ? position.name.toUpperCase().startsWith(codeFilter) : true;
      const nameMatches = nameFilter ? position.name.toLowerCase().includes(nameFilter) : true;
      const colorMatches = colorFilter ? position.fen.split(' ')[1] === colorFilter : true;
      return codeMatches && nameMatches && colorMatches;
    });

    // Display filtered results
    displayFilteredPositions(filteredSavedPositions, resultsContainer);
  });
}

// Helper function to display filtered positions
function displayFilteredPositions(positions, container) {
  container.innerHTML = `<h4>Filtered ${filteredSavedPositions.length} Results from ${savedPositions.length} puzzles:</h4>`;

  if (positions.length === 0) {
    container.innerHTML += "<p>No matching puzzles found.</p>";
    return;
  }

  const list = document.createElement("ul");
  positions.forEach((position, index) => {
    const listItem = document.createElement("li");

    listItem.innerHTML = `
      <strong>Position ${index + 1}</strong>:<br />
      Name: ${position.name}<br />
      Color: ${position.fen.split(' ')[1] === 'w' ? "White" : "Black"}<br />
      Moves: ${position.moves.join(", ")}
    `;

    list.appendChild(listItem);
  });

  container.appendChild(list);
}


function shuffleArray(array) {
  // Create a Uint32Array to hold random numbers
  const randomBuffer = new Uint32Array(array.length);

  // Generate secure random numbers
  window.crypto.getRandomValues(randomBuffer);

  // Fisher-Yates Shuffle Algorithm
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index using the secure random value
    const randomIndex = randomBuffer[i] % (i + 1);

    // Swap the current element with the randomly chosen one
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }

  return array;
}


// Load a saved position
function loadPosition(index) {
  currentIsWhite = isWhite;
  if (filteredSavedPositions.length === 0)
    filteredSavedPositions = shuffleArray(savedPositions)
  const position = filteredSavedPositions[index];
  isWhite = position.fen.split(' ')[1] === 'w'; // Determine if you're playing as white or black
  chess.load(position.fen);
  board.position(position.fen);
  currentMoveIndex = 0; // Reset the move index for the new position
  const puzzleNameElement = document.getElementById("puzzleName");
  puzzleNameElement.textContent = `${position.name || "Unnamed"}`;
  
  moveSequence = position.moves; // Set the move sequence to follow
  if ((currentIsWhite && !isWhite) || (!currentIsWhite && isWhite)) {
    board.flip(); // Flip the board if you're playing black
  }
}

// Function to display messages in the #message div
function displayMessage(message, type) {
    const messageContainer = document.getElementById("message");
    messageContainer.innerHTML = `<span class="${type}">${message}</span>`;
    
    // Optional: If you want the message to disappear after a few seconds
    setTimeout(() => {
      messageContainer.innerHTML = "";
    }, 3000); // message disappears after 3 seconds
  }

  /*function getRandomIndex(max) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
}*/

  /*function loadRandomPuzzle() {
    // Randomly select a puzzle from savedPositions
    const randomIndex = getRandomIndex(savedPositions.length);
    loadPosition(randomIndex)
  }*/
  
// Handle move on the board
  function handleMove(source, target) {
    const move = chess.move({
      from: source,
      to: target,
      promotion: "q", // Default to queen temporarily
    });
  
    // If move is null, revert to original position
    if (move === null) return "snapback";
  
    // Handle pawn promotion
    if (move.piece === "p" && (target[1] === "1" || target[1] === "8")) {
      setTimeout(() => {
        const promotion = prompt("Promote to (q, r, b, n):", "q").toLowerCase();
        if (["q", "r", "b", "n"].includes(promotion)) {
          // Undo the previous move and replay with the selected promotion
          chess.undo();
          chess.move({
            from: source,
            to: target,
            promotion,
          });
          board.position(chess.fen()); // Update the board with the promoted piece
        } else {
          // If invalid input, default to queen
          chess.undo();
          chess.move({
            from: source,
            to: target,
            promotion: "q",
          });
          board.position(chess.fen());
        }
      }, 0);
    } else {
      board.position(chess.fen()); // Update the board for non-promotion moves
    }
  
    // Puzzle logic
    if (moveSequence.length > 0) {
      const expectedMove = moveSequence[currentMoveIndex];
      if (move.san !== expectedMove) {
        displayMessage(`Wrong move! Expected: ${expectedMove}`, "error");
        chess.undo();
        board.position(chess.fen());
        return "snapback";
      }
      currentMoveIndex++;
      if (currentMoveIndex === moveSequence.length) {
        displayMessage("Puzzle completed!", "success");
        
        setTimeout(nextPuzzle, 100);
      } else {
        setTimeout(makeOpponentMove, 100);
      }
    }
  }
  
// Automatically make the opponent's move
function makeOpponentMove() {
  // Get the opponent's move (the next move in the sequence)
  const opponentMove = moveSequence[currentMoveIndex];

  // Parse the SAN notation to make the move
  const move = chess.move(opponentMove);
  if (move) {
    
    board.position(chess.fen());
    currentMoveIndex++; // Move to the next move in the sequence
    if (currentMoveIndex === moveSequence.length) {
      
    }
  }
}

// Save to server
async function saveNewPuzzle() {
  const puzzleNameInput = document.getElementById("puzzleNameInput");
  const puzzleName = puzzleNameInput.value.trim();
  
  if (!puzzleName) {
    alert("Please enter a name for the puzzle.");
    return;
  }
  const moves = chess.history(); // Moves made during setup
  const puzzlemoves= moves.slice(setupMoveIndex)

  try {
     await fetch("/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: puzzleName, fen: startingFen, moves: puzzlemoves }),
    });
    alert("Puzzle saved")
  } catch (error) {
    console.error("Error saving new puzzle:", error);
  }
  fetchPositions();
}

// Setup making new puzzle to record, then send to saveNewPuzzle()
function addnewPuzzle() {
  // Clear the chessboard and reset the chess engine
  chess.reset();
  board.position("start"); // Optional: Start with a clear board instead

  const puzzleNameElement = document.getElementById("puzzleName");
  puzzleNameElement.textContent = `Puzzle: Adding new puzzle`;

  setupMoveIndex = 0;

  // Clear the current puzzle state
  moveSequence = []; // Clear the move sequence
  currentMoveIndex = 0; // Reset the move index
  
  
  // Display a form to capture the puzzle name
  const messageContainer = document.getElementById("message");
  messageContainer.innerHTML = `
    <h3>Set Up a New Puzzle</h3>
    <button id="flipBoard" class="flip">Flip Board</button> <!-- Flip Board Button -->
    <button id="setStartingPosition" class="save">Start recording moves</button> <!-- Set Starting Position -->
    <label for="puzzleNameInput">Puzzle Name:</label>
    <input type="text" id="puzzleNameInput" placeholder="Enter puzzle name" />
    <button id="saveNewPuzzle" class="save">Save Puzzle</button>
  `;
  // Add an event listener for saving the puzzle
  document.getElementById("saveNewPuzzle").addEventListener("click", saveNewPuzzle);
  // Flip Board Button Handler
document.getElementById("flipBoard").addEventListener("click", () => {
  board.flip(); // Flip the chessboard
  isWhite = !isWhite; // Toggle isWhite flag
});
document.getElementById("setStartingPosition").addEventListener("click", () => {
  startingFen = chess.fen(); // Save the current board position as the starting FEN
  setupMoveIndex = chess.history().length; // Record the move index when the starting position is set
});
}

function nextPuzzle() {
  if (puzzleIndex >= filteredSavedPositions.length-1)
    puzzleIndex = 0
  else puzzleIndex++;
  loadPosition(puzzleIndex)
}

// Set up event listeners
document.getElementById("addPuzzle").addEventListener("click", addnewPuzzle);
document.getElementById("filterPuzzle").addEventListener("click", filterPositions);
document.getElementById("skipPuzzle").addEventListener("click", nextPuzzle);

// Initial fetch of positions
fetchPositions();
