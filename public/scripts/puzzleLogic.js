import { displayNewPuzzleForm, displayMessage, showArchiveControls } from "./ui/general.js";
import { vars } from "./vars.js";
import { shuffleArray, addMiddleGames } from "./helpers.js"
import { saveToLocalStorage } from "./storage.js"

// Load a puzzle
export function loadPosition(index) {
  let currentIsWhite = vars.isWhite;
  if (vars.filteredSavedPositions.length === 0) {
    vars.isFaultOnly = 0; //it also comes here after completing all fault-only puzzles
    vars.filteredSavedPositions = shuffleArray(addMiddleGames(vars.savedPositions))
  }

  const position = vars.filteredSavedPositions[index];
  vars.currentId = position.id
  vars.isWhite = position.fen.split(' ')[1] === 'w'; // Determine if you're playing as white or black
  vars.chess.load(position.fen);
  vars.board.position(position.fen);
  vars.currentMoveIndex = 0; // Reset the move index for the new position
  const puzzleNameElement = document.getElementById("puzzleName");
  puzzleNameElement.textContent = `${position.name || "Unnamed"} (${index + 1}/${vars.filteredSavedPositions.length})`;
  vars.faultcounter = 0;
  if (vars.includeMiddle && position.middle)
    vars.moveSequence = [...position.moves, ...position.middle]
  else
    vars.moveSequence = position.moves; // Set the move sequence to follow
  if ((currentIsWhite && !vars.isWhite) || (!currentIsWhite && vars.isWhite)) {
    vars.board.flip(); // Flip the board if you're playing black
  }
}

// Handle move on the board
export function handleMove(source, target) {
  const move = vars.chess.move({
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
        vars.chess.undo();
        vars.chess.move({
          from: source,
          to: target,
          promotion,
        });
        vars.board.position(vars.chess.fen()); // Update the board with the promoted piece
      } else {
        // If invalid input, default to queen
        vars.chess.undo();
        vars.chess.move({
          from: source,
          to: target,
          promotion: "q",
        });
        vars.board.position(vars.chess.fen());
      }
    }, 0);
  } else {
    vars.board.position(vars.chess.fen()); // Update the board for non-promotion moves
  }

  // Puzzle logic
  if (vars.moveSequence.length > 0) {
    const expectedMove = vars.moveSequence[vars.currentMoveIndex];
    if (move.san !== expectedMove) {
      displayMessage(`Wrong move! Expected: ${expectedMove}`, "error");
      vars.faultcounter++;
      vars.chess.undo();
      vars.board.position(vars.chess.fen());
      return "snapback";
    }
    vars.currentMoveIndex++;
    if (vars.currentMoveIndex === vars.moveSequence.length) {

      vars.faultList[vars.filteredSavedPositions[vars.puzzleIndex]?.id] = vars.faultcounter
      saveToLocalStorage(vars.storageKey, vars.faultList)

      if (vars.isFaultOnly > 0 && vars.faultcounter === 0) {
        vars.filteredSavedPositions.splice(vars.puzzleIndex, 1)
      }

      if (vars.filteredSavedPositions.length === 0)
        displayMessage(`Completed all, resetting to default`, "success");

      else displayMessage(`Completed ${vars.faultcounter > 0 ? 'with faults' : ''}`, "success");

      if (vars.bulkArchiveMode)
        showArchiveControls();
      else setTimeout(nextPuzzle, 100);
    } else {
      setTimeout(makeOpponentMove, 100);
    }
  }
}

// Automatically make the opponent's move
export function makeOpponentMove() {
  // Get the opponent's move (the next move in the sequence)
  const opponentMove = vars.moveSequence[vars.currentMoveIndex];

  // Parse the SAN notation to make the move
  const move = vars.chess.move(opponentMove);
  if (move) {

    vars.board.position(vars.chess.fen());
    vars.currentMoveIndex++; // Move to the next move in the sequence
    /*if (vars.currentMoveIndex === vars.moveSequence.length) {

    }*/
  }
}

export function nextPuzzle() {
  if (vars.puzzleIndex >= vars.filteredSavedPositions.length - 1)
    vars.puzzleIndex = 0
  else vars.puzzleIndex++;
  loadPosition(vars.puzzleIndex)
}

// Setup making new puzzle to record, then send to saveNewPuzzle()
export function addnewPuzzle(position) {
  //logic part
  // Clear the chessboard and reset the chess engine

  vars.chess.reset();
  vars.board.position("start"); // Optional: Start with a clear board instead

  vars.setupMoveIndex = 0;

  //For adding middlegames, start from chosen opening
  if (position.fen) {
    const isBlack = position.fen.split(' ')[1] === 'b';
    vars.chess.load(position.fen);
    position.moves.forEach(move => {
      vars.chess.move(move)
      vars.setupMoveIndex++;
    })
    vars.board.position(vars.chess.fen())
    if (vars.isWhite && isBlack) {
      vars.board.flip(); // Flip the board if needed
    }
  }

  // Clear the current puzzle state
  vars.moveSequence = []; // Clear the move sequence
  vars.currentMoveIndex = 0; // Reset the move index

  //UI part
  displayNewPuzzleForm(position);
}