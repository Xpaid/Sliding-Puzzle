var movesNum = 0; // Number of moves initiated by the user
var startTime; // Start time of the game
var movescell = document.getElementById("movesnum"); // Element to display number of moves
var timerDisplay = document.getElementById("timer"); // Element to display the timer

var tiles = [];
var puzzleSize = 4; // Change puzzle size to 4x4

// Position of the empty tile
var emptyRow = puzzleSize;
var emptyCol = puzzleSize;

var timerStarted = false;
var timerInterval;

// Preload sounds
let bgMusic = new Audio('assets/bg.mp3');
let moveTileSound = new Audio('assets/tile.mp3');
let invalidMoveSound = new Audio('assets/error.mp3');
let congratsSound = new Audio('assets/congrats.mp3');
let buttonPressedSound = new Audio('assets/button.mp3');

// Play background music on loop
bgMusic.loop = true;

// Function to play audio and handle rapid clicks
function playSound(audio) {
    let sound = audio.cloneNode();
    sound.play();
}

// Initialize the puzzle
function initPuzzle() {
    var puzzleElement = document.getElementById("puzzle");
    puzzleElement.innerHTML = "";
    tiles = [];

    for (var i = 1; i <= puzzleSize * puzzleSize - 1; i++) {
        var tile = document.createElement("li");
        tile.className = "Tile Tile" + i;
        tile.innerHTML = i;
        puzzleElement.appendChild(tile);
        tiles.push(tile);
    }

    emptyRow = puzzleSize;
    emptyCol = puzzleSize;

    randomizePuzzle();
}

// Check if the puzzle is solved
var isPuzzleSolved = function() {
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        var tileIndex = parseInt(tile.innerHTML);
        var expectedRow = Math.ceil(tileIndex / puzzleSize);
        var expectedCol = tileIndex % puzzleSize || puzzleSize;
        var currentRow = parseInt(tile.style.gridRow);
        var currentCol = parseInt(tile.style.gridColumn);

        if (currentRow !== expectedRow || currentCol !== expectedCol) {
            return false;
        }
    }
    return true;
};

// Randomize the puzzle ensuring it's solvable
var randomizePuzzle = function() {
    var solvableArrangement = generateRandomSolvableArrangement();

    // Apply the solvable arrangement to tiles
    for (var i = 0; i < tiles.length; i++) {
        tiles[i].style.gridRow = solvableArrangement[i][0];
        tiles[i].style.gridColumn = solvableArrangement[i][1];
    }

    emptyRow = puzzleSize;
    emptyCol = puzzleSize;

    // Reassign event listeners after rearranging tiles
    tiles.forEach(function(tile) {
        tile.onclick = moveTile;
    });

    startTime = null; // Reset the start time
    timerDisplay.innerHTML = "0 seconds"; // Reset the timer display
    movesNum = 0; // Reset the moves count
    movescell.innerHTML = movesNum; // Update the moves count display
    clearInterval(timerInterval); // Clear any existing timer intervals
    timerStarted = false; // Reset the timer started flag
};

// Generate a solvable arrangement of tiles randomly
function generateRandomSolvableArrangement() {
    var solvedState = generateSolvedState();
    var solvableArrangement = shuffleArray(solvedState);

    // Ensure the generated arrangement is solvable
    while (!isSolvable(solvableArrangement)) {
        solvableArrangement = shuffleArray(solvedState);
    }

    return solvableArrangement;
}

// Helper function to generate a solved state array
function generateSolvedState() {
    var state = [];
    for (var i = 1; i <= puzzleSize; i++) {
        for (var j = 1; j <= puzzleSize; j++) {
            if (i === puzzleSize && j === puzzleSize) break; // Skip the last position
            state.push([i, j]);
        }
    }
    return state;
}

// Helper function to check if a given arrangement is solvable
function isSolvable(arrangement) {
    let inversions = 0;
    for (let i = 0; i < arrangement.length - 1; i++) {
        for (let j = i + 1; j < arrangement.length; j++) {
            let indexI = (arrangement[i][0] - 1) * puzzleSize + arrangement[i][1];
            let indexJ = (arrangement[j][0] - 1) * puzzleSize + arrangement[j][1];
            if (indexI > indexJ) inversions++;
        }
    }
    return inversions % 2 === 0;
}

// Fisher-Yates shuffle algorithm to shuffle the array
var shuffleArray = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Move the tiles
var moveTile = function() {
    var thisRow = parseInt(this.style.gridRow);
    var thisCol = parseInt(this.style.gridColumn);

    if ((emptyRow === thisRow && Math.abs(emptyCol - thisCol) === 1) ||
        (emptyCol === thisCol && Math.abs(emptyRow - thisRow) === 1)) {
        // Move the tile
        this.style.gridRow = emptyRow;
        this.style.gridColumn = emptyCol;
        emptyRow = thisRow;
        emptyCol = thisCol;

        movesNum++;
        movescell.innerHTML = movesNum; // Update # of moves displayed

        playSound(moveTileSound); // Play move tile sound

        if (!timerStarted) {
            startTime = new Date(); // Start the timer
            updateTimer(); // Start updating the timer
            timerStarted = true; // Set the flag to indicate timer has started
        }

        if (isPuzzleSolved()) {
            showCongratsFrame();
            playSound(congratsSound); // Play congratulations sound
        }
    } else {
        playSound(invalidMoveSound); // Play invalid move sound
    }
};

// Show the congratulations frame
var showCongratsFrame = function() {
    if (!isPuzzleSolved()) {
        return; // Exit function if puzzle is not solved
    }
    
    clearInterval(timerInterval); // Stop the timer
    var endTime = new Date();
    var timeDiff = Math.round((endTime - startTime) / 1000); // Time in seconds
    var congratsFrame = document.getElementById("congratsFrame");
    var finalMoves = document.getElementById("finalMoves");
    var finalTime = document.getElementById("finalTime");

    finalMoves.innerHTML = movesNum;
    finalTime.innerHTML = timeDiff + " seconds";

    congratsFrame.style.display = "flex"; // Display the congrats frame
};


// Update the timer every second
var updateTimer = function() {
    timerInterval = setInterval(function() {
        var currentTime = new Date();
        var elapsedTime = Math.round((currentTime - startTime) / 1000); // Time in seconds
        timerDisplay.innerHTML = elapsedTime + " seconds";
    }, 1000);
};

// Assign event listeners
document.getElementById("newgame").onclick = function() {
    randomizePuzzle();
    playSound(buttonPressedSound);
};

document.getElementById("playAgain").onclick = function() {
    document.getElementById("congratsFrame").style.display = "none";
    randomizePuzzle();
    playSound(buttonPressedSound);
};

// Initialize the puzzle on page load
document.addEventListener("DOMContentLoaded", function() {
    initPuzzle();
    // Play background music on user interaction
    document.addEventListener('click', function() {
        bgMusic.play();
    }, { once: true }); // Ensure it runs only once
});
