import { displayMessage } from "./general.js";
import { vars } from "../vars.js";
import { shuffleArray, addMiddleGames } from "../helpers.js";
import { nextPuzzle, addnewPuzzle } from "../puzzleLogic.js";

const resultsContainer = document.createElement("div");
// Filter and display positions
export function filterPositions() {

  const container = displayMessage("<h3>Filter Puzzles:</h3>", "")

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

    <label for="faultFilter">Faults-made only:</label>
    <select id="faultFilter">
      <option value="0">No</option>
      <option value="1">Yes</option>
    </select><br/>

    <label for="middle">Middlegames included:</label>
    <select id="middle">
      <option value="1">Yes</option>
      <option value="0">No</option>
    </select><br/>

    <button id="applyFilter">Apply Filter</button>
  `;
  container.appendChild(filterContainer);


  resultsContainer.id = "resultsContainer";
  container.appendChild(resultsContainer);

  // Trigger filter when pressing Enter in input fields
  ['codeFilter', 'nameFilter'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById("applyFilter").click();
      }
    });
  });

  // Add event listener for filtering
  document.getElementById("applyFilter").addEventListener("click", () => {
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
  });
}


// Helper function to display filtered positions
export function displayFilteredPositions(positions) {
  resultsContainer.innerHTML = `<h4>Filtered ${vars.filteredSavedPositions.length} Results from ${vars.savedPositions.length} openings:</h4>`;

  if (positions.length === 0) {
    resultsContainer.innerHTML += "<p>No matching puzzles found.</p>";
    return;
  }

  const list = document.createElement("ul");
  positions.forEach((position, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
          <strong>Position ${index + 1}</strong>:<br />
          Name: ${position.name}<br />
          Color: ${position.fen.split(' ')[1] === 'w' ? "White" : "Black"}<br />
          Moves: ${position.moves.join(", ")} <br/>
          ${position.middle ? position.middle.map((mid, ind) => { return `Line ${ind + 1}: ${mid.moves.join(", ")}<br/>` }) : ""}
        `;

    // Create button separately
    const button = document.createElement("button");
    button.textContent = "Add Middlegame";
    button.classList.add("add");

    // Attach event listener before appending
    button.addEventListener("click", () => {
      addnewPuzzle(position);
    });

    listItem.appendChild(button); // Append the button to the list item
    list.appendChild(listItem);
  });

  resultsContainer.appendChild(list);
}

