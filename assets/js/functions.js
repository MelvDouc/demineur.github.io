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
            x: n % columns,
            y: Math.floor(n / columns)
        }
    };
    const nCoords = coords(index);

    let adjacentItems = [];
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            if (
                (xOffset === 0 && yOffset === 0)
                || (nCoords.x + xOffset < 0)
                || (nCoords.x + xOffset >= columns)
                || (nCoords.y + yOffset < 0)
                || (nCoords.y + yOffset >= rows)
            ) continue;
            const o = {
                x: nCoords.x + xOffset,
                y: nCoords.y + yOffset
            }
            adjacentItems.push(o);
        }
    }
    adjacentItems = adjacentItems.map(n => n.y * columns + n.x)

    return adjacentItems;
}

export function countAdjacentMines(elem) {
    const index = gridIndex(elem)
    return getAdjacentItems(index)
        .map(i => SQUARES[i])
        .filter(square => square.mined)
        .length;
}