import { SQUARES, grid, columns, rows } from "./app.js";

export function gridIndex(elem) {
  return Array.from(grid.children).indexOf(elem);
}

/**
 * 
 * @param {number} index 
 * @returns 
 */
export function getAdjacentItems(index) {
  const nCoords = {
    x: index % columns,
    y: Math.floor(index / columns)
  };

  const adjacentItems = [];
  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      if (
        xOffset === 0 && yOffset === 0
        || nCoords.x + xOffset < 0
        || nCoords.x + xOffset >= columns
        || nCoords.y + yOffset < 0
        || nCoords.y + yOffset >= rows
      )
        continue;
      adjacentItems.push((nCoords.y + yOffset) * columns + nCoords.x + xOffset);
    }
  }

  return adjacentItems;
}

export function countAdjacentMines(elem) {
  const index = gridIndex(elem);
  return getAdjacentItems(index)
    .reduce((total, index) => SQUARES[index].mined ? total + 1 : total, 0);
}