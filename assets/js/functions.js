import { SQUARES, grid, columns, rows } from "./app.js";

export function gridIndex(elem) {
    return Array.from(grid.children).indexOf(elem)
}

/**
 * 
 * @param {number} index 
 * @returns 
 */
export function getAdjacentItems(index) {
    const coords = (n) => {
        return {
            x: Math.floor(n / columns),
            y: n % columns
        }
    };
    const nCoords = coords(index);
    const adjacentItems = [
        coords(index - columns - 1),
        coords(index - columns),
        coords(index - columns + 1),
        coords(index - 1),
        coords(index + 1),
        coords(index + columns - 1),
        coords(index + columns),
        coords(index + columns + 1),
    ].filter(n => {
        return n.x >= 0 && n.x < columns
            && n.y >= 0 && n.y < rows
            && Math.abs(nCoords.x - n.x) <= 1
            && Math.abs(nCoords.y - n.y) <= 1
    }).map(n => n.x * columns + n.y);

    return adjacentItems;
}

export function countAdjacentMines(elem) {
    return getAdjacentItems(gridIndex(elem))
        .map(index => SQUARES[index])
        .filter(square => square.mined).length;
}