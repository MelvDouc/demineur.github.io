import { gridIndex, getAdjacentItems, countAdjacentMines } from "./functions.js";

// ===== ===== ===== ===== =====
// Variables
// ===== ===== ===== ===== =====
export const grid = document.getElementById("grid");
const flagCounter = document.querySelector(".flags");
const newGameButton = document.getElementById("new-game");
const difficultySelect = document.getElementById("difficulty");
const winMessage = document.getElementById("win-message");

const difficulties = {
    beginner: {
        columns: 9,
        rows: 9,
        mines: 10
    },
    intermediate: {
        columns: 16,
        rows: 16,
        mines: 40
    },
    advanced: {
        columns: 30,
        rows: 16,
        mines: 99
    },
}
let difficulty = difficulties.beginner
export let columns = difficulty.columns;
export let rows = difficulty.rows;
let numberOfMines = difficulty.mines;
let flags = numberOfMines;

let isInitialClick = true;
let isGameOver = false;

// ===== ===== ===== ===== =====
// SQUARES
// ===== ===== ===== ===== =====

export const SQUARES = [];

function createSquares() {
    for (let i = 0; i < columns * rows; i++) {
        const div = document.createElement("div");
        div.dataset.status = "covered";

        const square = {
            element: div,
            get index() {
                return Array.from(grid.children).indexOf(this.element)
            },
            get status() {
                return this.element.dataset.status;
            },
            set status(status) {
                this.element.dataset.status = status;
            }
        }

        SQUARES.push(square);
    }
}

createSquares();

// ===== ===== ===== ===== =====
// Append HTML elements
// ===== ===== ===== ===== =====

function appendElements() {
    // Remove previous square elements
    Array.from(grid.children)?.forEach(child => child.remove());
    SQUARES
        .map(square => square.element)
        .forEach(square => grid.append(square));
    grid.style.setProperty("--columns", columns);
    // Set grid height
    grid.style.setProperty("--squareWidth", `calc(75vh / ${rows})`);
    document.querySelector("main").dataset.diff = difficultySelect.value;
}

appendElements();

// ===== ===== ===== ===== =====
// Flags
// ===== ===== ===== ===== =====

function resetFlags() {
    flags = numberOfMines;
    flagCounter.innerText = flags;
}

resetFlags();

// ===== ===== ===== ===== =====
// Event listeners
// ===== ===== ===== ===== =====

SQUARES.forEach(square => {
    square.element.addEventListener("click", clickSquare);
    square.element.addEventListener("contextmenu", flagSquare);
});

newGameButton.addEventListener("click", startNewGame);
difficultySelect.addEventListener("change", setDifficulty);

// ===== ===== ===== ===== =====
// Square click functions
// ===== ===== ===== ===== =====

function clickSquare(e) {
    if (e.target.dataset.status !== "covered") return;
    if (isGameOver) return;
    if (isInitialClick) {
        isInitialClick = false;
        setMines(e.target);
    }
    revealSquare(e.target);
    checkLoss(e.target);
    checkWin();
}

function flagSquare(e) {
    e.preventDefault();
    if (isGameOver) return;
    switch (e.target.dataset.status) {
        case "covered":
            if (flags > 0) {
                e.target.dataset.status = "flagged";
                flags--;
            }
            break;
        case "flagged":
            e.target.dataset.status = "covered";
            flags++;
            break;
    }
    flagCounter.innerText = flags;
    // reset flag counter animation
    flagCounter.className = "";
    setTimeout(() => {
        flagCounter.className = "flags";
    }, 0);
    checkWin();
}

// ===== ===== ===== ===== =====
// Set mines after initial click
// ===== ===== ===== ===== =====

function setMines(elem) {
    // The mines are set by assigning each square a property of "mined" with a boolean value.
    // 1. Get random array of booleans the length of SQUARES
    const booleans = Array.from(
        { length: columns * rows }, (_, i) => (i < numberOfMines) ? true : false
    );
    booleans.sort(() => Math.random() - .5);

    // 2. Make sure index of 1st clicked square is not a true and other things
    const index = gridIndex(elem)
    while (
        booleans[index] === true
        || getAdjacentItems(index).some(item => booleans[item] === true)
        || booleans
            .some((_, i) => getAdjacentItems(i).filter(i => booleans[i] === true).length > 4)
    )
        booleans.sort(() => Math.random() - .5);

    // 3. Assign boolean to each square, determining whether it is mined
    SQUARES.forEach((square, i) => square.mined = booleans[i]);
}

// ===== ===== ===== ===== =====
// Reveal square on click
// ===== ===== ===== ===== =====

function revealSquare(elem) {
    setTimeout(() => {
        if (elem.dataset.status !== "covered") return;

        const elemIndex = gridIndex(elem);

        if (SQUARES[elemIndex].mined) return;

        if (countAdjacentMines(elem) > 0)
            elem.dataset.status = `safe${countAdjacentMines(elem)}`;
        const expand = (i) => {
            const adjacentSquares = getAdjacentItems(i)
                .map(i => SQUARES[i])
                .filter(square => !square.mined && square.status === "covered");
            adjacentSquares.forEach(square => {
                square.status = `safe${countAdjacentMines(square.element)}`;
                if (countAdjacentMines(square.element) === 0)
                    expand(square.index);
            })
        }
        expand(elemIndex);
    }, 100);
}

// ===== ===== ===== ===== =====
// Check win/lose
// ===== ===== ===== ===== =====

function checkLoss(elem) {
    const elemIndex = gridIndex(elem);

    if (!SQUARES[elemIndex].mined) return;

    elem.dataset.status = "mined";
    SQUARES.forEach(square => {
        if (square.mined) square.status = "mined";
    })
    isGameOver = true;
    alert("boom")
    return
}

function checkWin() {
    setTimeout(() => {
        if (flags > 0) return;
        if (
            SQUARES.every(square => {
                if (square.mined) return square.status === "flagged";
                else return square.status.startsWith("safe");
            })
        ) {
            isGameOver = true;
            setTimeout(() => {
                document.body.classList.add("rotate");
                winMessage.classList.add("fadeIn");
                winMessage.querySelector("p").classList.add("scrollBy");
            }, 1000);
        }
    }, 500);
}

// ===== ===== ===== ===== =====
// Start new game
// ===== ===== ===== ===== =====

function startNewGame() {
    isGameOver = false;
    isInitialClick = true;
    SQUARES.length = 0;
    createSquares();
    appendElements();
    SQUARES.forEach(square => {
        square.element.addEventListener("click", clickSquare);
        square.element.addEventListener("contextmenu", flagSquare);
    });
    resetFlags();
    document.body.removeAttribute("class");
    winMessage.removeAttribute("class");
    winMessage.querySelector("p").removeAttribute("class");
}

// ===== ===== ===== ===== =====
// Set difficulty
// ===== ===== ===== ===== =====

function setDifficulty(e) {
    difficulty = difficulties[e.target.value];
    columns = difficulty.columns;
    rows = difficulty.rows;
    numberOfMines = difficulty.mines;
    flags = numberOfMines;
    startNewGame();
}