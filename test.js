function getAdjacentItems(index, columns, rows = columns) {
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
        return n.x >= 0 && n.x < rows
            && n.y >= 0 && n.y < columns
            && Math.abs(nCoords.x - n.x) <= 1
            && Math.abs(nCoords.y - n.y) <= 1
    }).map(n => n.x * columns + n.y);

    return adjacentItems;
}

console.log(getAdjacentItems(62, 7, 9));