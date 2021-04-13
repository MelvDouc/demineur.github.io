const grid = document.getElementById("grid");
const winMessage = document.getElementById("win-message");
let width = 10;
let numberOfMines = 20;
let squares = [];
let minesArray = [];
let flags = numberOfMines;
let isInitialClick = true;
let isGameOver = false;

// ===== ===== ===== ===== =====
// Get surrounding numbers in a square array of numbers
// ===== ===== ===== ===== =====

/**
 * @param {number} index The index of an item in an array. 
 * @returns {number[]} An array of the indices of the items geometrically adjacent to the index argument.
 */
function getAdjacentItems(index) {
    const coords = (n) => {
        return {
            x: Math.floor(n / width),
            y: n % width
        }
    };
    const nCoords = coords(index);
    const adjacentItems = [
        coords(index - width - 1),
        coords(index - width),
        coords(index - width + 1),
        coords(index - 1),
        coords(index + 1),
        coords(index + width - 1),
        coords(index + width),
        coords(index + width + 1),
    ].filter(n => {
        return n.x >= 0 && n.x < width
            && n.y >= 0 && n.y < width
            && Math.abs(nCoords.x - n.x) <= 1
            && Math.abs(nCoords.y - n.y) <= 1
    }).map(n => n.x * width + n.y);

    return adjacentItems;
}

// ===== ===== ===== ===== =====
// Count number of mines in 8 surrounding squares
// ===== ===== ===== ===== =====

function countAdjacentMines(square) {
    return getAdjacentItems(square.order, width).map(order => squares[order]).filter(sq => sq.mined).length;
}

// ===== ===== ===== ===== =====
// Set up board without mines
// ===== ===== ===== ===== =====

function createBoard() {
    grid.style.setProperty("--columns", width);

    for (let i = 0; i < width ** 2; i++) {
        const div = document.createElement("div");
        div.dataset.status = "covered";
        grid.append(div);

        const square = {
            element: div,
            order: i,
            flagged: false
        }

        squares.push(square);
    }
}

createBoard();


// ===== ===== ===== ===== =====
// Add mines on first click
// ===== ===== ===== ===== =====

function setMines(square) {
    // Get random array of mines
    for (let i = 0; i < Math.pow(width, 2); i++) {
        // true = mine
        if (i < numberOfMines) minesArray.push(true);
        else minesArray.push(false);
    }
    minesArray.sort(() => Math.random() - .5);
    // Always make first clicked square safe
    while (
        minesArray[square.order] === true
        || getAdjacentItems(square.order).some(n => minesArray[n] === true)
        || minesArray.some((_, i) => getAdjacentItems(i).filter(i => minesArray[i] === true).length > 4)
    )
        minesArray.sort(() => Math.random() - .5);

    squares.forEach((sq, i) => {
        sq.mined = minesArray[i];
    });
}

// ===== ===== ===== ===== =====
// Reveal square on click
// ===== ===== ===== ===== =====

function revealSquare(square) {
    setTimeout(function () {
        if (square.element.dataset.status !== "covered") return;
        if (square.mined) {
            squares.filter(sq => sq.mined).forEach(mine => {
                mine.element.dataset.status = "mined";
            });
            alert("Boom !");
            isGameOver = true;
            return;
        }
        square.element.dataset.status = "safe";
        if (countAdjacentMines(square) > 0)
            square.element.innerText = countAdjacentMines(square);
        const expand = (a) => {
            const adjacentSquares = getAdjacentItems(a.order)
                .map(order => squares[order])
                .filter(sq => !sq.mined && sq.element.dataset.status === "covered");
            adjacentSquares.forEach(sq => {
                sq.element.dataset.status = "safe";
                if (countAdjacentMines(sq) > 0)
                    sq.element.innerText = countAdjacentMines(sq);
                else expand(sq);
            })
        }
        expand(square);
    }, 10);
}

// ===== ===== ===== ===== =====
// Check win
// ===== ===== ===== ===== =====

function checkWin() {
    setTimeout(function () {
        const divs = Array.from(document.querySelectorAll("#grid div"));
        if (
            divs.every(div => div.dataset.status === "safe" || div.dataset.status === "flagged")
            && squares.filter(square => square.mined).every(square => square.flagged)
        ) {
            isGameOver = true;
            setTimeout(() => {
                document.body.classList.add("rotate");
                winMessage.classList.add("fadeIn");
                winMessage.querySelector("p").classList.add("scrollBy");
            }, 1000);
        }
    }, 10)
}

// ===== ===== ===== ===== =====
// Click events
// ===== ===== ===== ===== =====

squares.forEach(sq => {
    sq.element.addEventListener("click", function () {
        if (isGameOver) return;
        if (isInitialClick) {
            setMines(sq);
            isInitialClick = false;
        }
        revealSquare(sq);
        checkWin();
    });
    sq.element.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        if (isGameOver) return;
        switch (this.dataset.status) {
            case "covered":
                this.dataset.status = "flagged";
                if (flags > 0) flags--;
                sq.flagged = true;
                break;
            case "flagged":
                this.dataset.status = "covered";
                sq.flagged = false;
                flags++;
                break;
        }
        document.querySelector("#flags p").innerText = flags;
        checkWin()
    })
});

document.querySelector("#controls button").addEventListener("click", function () {
    isGameOver = false;
    isInitialClick = true;
    minesArray = [];
    flags = numberOfMines;
    squares.forEach(square => {
        square.element.innerText = "";
        square.element.dataset.status = "covered";
        square.flagged = false;
        square.mined = false;
    });
    document.querySelector("#flags p").innerText = flags;
    document.body.classList.remove("rotate");
    winMessage.classList.remove("fadeIn");
    winMessage.querySelector("p").classList.remove("scrollBy");
})