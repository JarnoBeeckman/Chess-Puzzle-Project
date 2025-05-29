export const vars = {
   board: {},
   chess: {},
   startingFen: "",
   setupMoveIndex: 0, // Tracks the index of the last move in history when the starting position is set
   savedMiddlegames: [],
   savedPositions: [],
   filteredSavedPositions: [],
   puzzleIndex: 0,
   currentMoveIndex: 0, // Tracks the current move in the opening sequence
   currentId: null,
   isWhite: true, // Tracks if you are playing white or black
   moveSequence: [], // Tracks the sequence of moves (for alternating)
   faultList: [],
   faultcounter: 0,
   isFaultOnly: 0,
   includeMiddle: true,
   selectedSquare: null,
   storageKey: "faults",
   bulkArchiveMode: false
}

