import { vars } from "./vars.js";
import { displayFilteredPositions } from "./ui/filter.js";
import { nextPuzzle } from "./puzzleLogic.js";

export function shuffleArray(array) {
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

export function addMiddleGames(list, wasFiltered) {

  const newPositions = [];

  list.forEach((pos) => {
    const relatedMiddlegames = vars.savedMiddlegames.filter(x => x.fk === pos.id);

    if (relatedMiddlegames.length > 0) {
      relatedMiddlegames.forEach(middlegame => {
        newPositions.push({ ...pos, middle: middlegame.moves });
      });
      pos.middle = relatedMiddlegames
    } else {
      newPositions.push({ ...pos }); // Keep positions without middlegames
    }

  });
  if (wasFiltered)
    displayFilteredPositions(list);

  return newPositions;
}

export function applyFilter() {
  const codeFilter = document.getElementById("codeFilter").value.trim().toUpperCase();
  const nameFilter = document.getElementById("nameFilter").value.trim().toLowerCase();
  const colorFilter = document.getElementById("colorFilter").value;
  vars.isFaultOnly = document.getElementById("faultFilter").value;
  vars.includeMiddle = document.getElementById("middle").value;

  // Filter saved positions based on the inputs
  vars.filteredSavedPositions = vars.savedPositions.filter(position => {
    const codeMatches = codeFilter ? position.name.toUpperCase().startsWith(codeFilter) : true;
    const nameMatches = nameFilter ? position.name.toLowerCase().includes(nameFilter) : true;
    const colorMatches = colorFilter ? position.fen.split(' ')[1] === colorFilter : true;
    const faultMatches = vars.isFaultOnly > 0 ? vars.faultList[position.id] > 0 : true;
    return codeMatches && nameMatches && colorMatches && faultMatches;
  });

  // Display filtered results

  if (vars.includeMiddle > 0) {
    vars.filteredSavedPositions = addMiddleGames(vars.filteredSavedPositions, true)
  }
  else displayFilteredPositions(vars.filteredSavedPositions, vars.filteredSavedPositions.length, vars.savedPositions.length, vars.addnewPuzzle);

  vars.filteredSavedPositions = shuffleArray(vars.filteredSavedPositions)
  vars.puzzleIndex = vars.filteredSavedPositions.length;
  nextPuzzle()
}