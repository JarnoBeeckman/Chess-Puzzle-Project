import { vars } from "./vars.js";
import { displayFilteredPositions } from "./ui/filter.js";

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