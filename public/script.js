const board = Chessboard("board", {
  draggable: true,
  position: "start",
  onDrop: handleMove,
});

let startingFen = "";
let setupMoveIndex = 0; // Tracks the index of the last move in history when the starting position is set

const chess = new Chess();
let savedPositions = [];
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
function displayPositions() {
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
}

// Load a specific saved position
function loadPosition(index) {
  currentIsWhite = isWhite;
  const position = savedPositions[index];
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

  function getRandomIndex(max) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
}

  function loadRandomPuzzle() {
    // Randomly select a puzzle from savedPositions
    const randomIndex = getRandomIndex(savedPositions.length);
    loadPosition(randomIndex)
  }
  
  
  

// Handle move on the board
function handleMove(source, target) {
  // If there's no active puzzle, just allow free movement
  if (moveSequence.length === 0) {
    const move = chess.move({ from: source, to: target });
    if (move === null) return "snapback"; // Revert invalid moves
    board.position(chess.fen()); // Update the board
    return;
  }

  // Existing logic for handling moves in a puzzle
  const move = chess.move({ from: source, to: target });

  // If move is null (invalid), return to the original position
  if (move === null) {
    displayMessage("Invalid move! Please try again.", "error");
    return "snapback";
  }

  // Normalize the move SAN (remove any additional symbols like +, #, etc.)
  const moveSAN = move.san;
  const expectedMove = moveSequence[currentMoveIndex]; // Get the expected move

  // Check if the move matches the expected move in the sequence
  if (moveSAN !== expectedMove) {
    displayMessage(`Wrong move! The correct move is: ${expectedMove}`, "error");
    chess.undo();
    board.position(chess.fen());
    return "snapback";
  } else {
    currentMoveIndex++; // Move to the next move in the sequence
    if (currentMoveIndex === moveSequence.length) {
      setTimeout(loadRandomPuzzle, 100);
    } else {
      setTimeout(makeOpponentMove,100)
    }
  }
}


  
  
  // Function to play the opponent's move automatically
  function playOpponentMove() {
    if (currentMoveIndex < moveSequence.length) {
      const opponentMove = moveSequence[currentMoveIndex];
  
      // Make the opponent's move on the board
      const move = chess.move(opponentMove);
      board.position(chess.fen());  // Update the board to reflect the move
  
      console.log("Opponent moves:", move);
  
      // Increment the move index after the opponent's move
      currentMoveIndex++;
  
      // Check if the sequence is complete
      if (currentMoveIndex >= moveSequence.length) {
        displayMessage("You completed the opening sequence!", "success");
        loadRandomPuzzle();  // Load a new puzzle when the sequence is completed
      }
    }
  }
  
  
  // Function to play the opponent's move automatically
  function playOpponentMove() {
    if (currentMoveIndex < moveSequence.length) {
      const opponentMove = moveSequence[currentMoveIndex];
  
      // Make the opponent's move on the board
      const move = chess.move(opponentMove);
      board.position(chess.fen());  // Update the board to reflect the move
  
      console.log("Opponent moves:", move);
  
      // Increment the move index after the opponent's move
      currentMoveIndex++;
  
      // Check if the sequence is complete
      if (currentMoveIndex >= moveSequence.length) {
        displayMessage("You completed the opening sequence!", "success");
        loadRandomPuzzle();  // Load a new puzzle when the sequence is completed
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
    console.log("Opponent's move:", move);
    board.position(chess.fen());
    currentMoveIndex++; // Move to the next move in the sequence
    if (currentMoveIndex === moveSequence.length) {
      
    }
  }
}

async function saveNewPuzzle() {
  const puzzleNameInput = document.getElementById("puzzleNameInput");
  const puzzleName = puzzleNameInput.value.trim();
  
  if (!puzzleName) {
    alert("Please enter a name for the puzzle.");
    return;
  }
  const moves = chess.history(); // Moves made during setup
  const puzzlemoves= moves.slice(setupMoveIndex)
  console.log(puzzlemoves)
  console.log(startingFen)

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
  isWhite = true; // Reset to white's turn
  
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

// Set up event listeners
document.getElementById("addPuzzle").addEventListener("click", addnewPuzzle);
document.getElementById("editPuzzle").addEventListener("click", displayPositions);
document.getElementById("startPuzzle").addEventListener("click", loadRandomPuzzle);



// Initial fetch of positions
fetchPositions();
