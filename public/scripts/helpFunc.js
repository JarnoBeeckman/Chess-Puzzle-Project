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

  // Function to display messages in the #message div
export function displayMessage(message, type) {
      const messageContainer = document.getElementById("message");
      messageContainer.innerHTML = `<span class="${type}">${message}</span>`;
    }

    // Helper function to display filtered positions
export function displayFilteredPositions(positions, container, amountPositions, totalAmountPositions, addnewPuzzle) {
      container.innerHTML = `<h4>Filtered ${amountPositions} Results from ${totalAmountPositions} openings:</h4>`;
    
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
          Moves: ${position.moves.join(", ")} <br/>
          ${position.middle ? position.middle.map((mid,ind)=>{return `Line ${ind+1}: ${mid.moves.join(", ")}<br/>`}):""}
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
    
      container.appendChild(list);
    }

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