import { displayMessage } from "./general.js";
import { vars } from "../vars.js";
import { applyFilter, splitMoves } from "../helpers.js";
import { addnewPuzzle } from "../puzzleLogic.js";

const resultsContainer = document.createElement("div");
// Filter and display positions
export function filterPositions() {
  const container = displayMessage("<h3>Filter Puzzles:</h3>", "");

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

     <label>
      <input type="checkbox" id="middle" checked/>
      Include Middlegames
      </label>
    <br/>

    <label>
    <input type="checkbox" id="faultFilter"/>
    Faults-made only
    </label><br/>

    <label>
      <input type="checkbox" id="includeArchived" />
      Include Archived
    </label><br/>

    <button id="applyFilter">Apply Filter</button>
  `;
  container.appendChild(filterContainer);

  resultsContainer.id = "resultsContainer";
  container.appendChild(resultsContainer);

  ['codeFilter', 'nameFilter'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById("applyFilter").click();
      }
    });
  });

  document.getElementById("applyFilter").addEventListener("click", applyFilter);
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

    // Format middlegame lines
    const middleContent = position.middle
      ? position.middle.map((mid, ind) => {
        return `${ind === 0 ? '<br/>' : ''}Line ${ind + 1}:<br/>${splitMoves(mid.moves).join("<br/>")}`;
      }).join("<br/>")
      : "";

    listItem.innerHTML = `
      <strong>Position ${index + 1}</strong>:<br />
      Name: ${position.name}<br />
      Color: ${position.fen.split(' ')[1] === 'w' ? "White" : "Black"}<br />
      Moves: ${position.moves.join(", ")} 
      ${middleContent}
      <br/>
    `;

    // Create and style the button
    const button = document.createElement("button");
    button.textContent = "Add Middlegame";
    button.classList.add("add");
    button.addEventListener("click", () => {
      addnewPuzzle(position);
    });

    listItem.appendChild(button);
    list.appendChild(listItem);
  });

  resultsContainer.appendChild(list);
}

