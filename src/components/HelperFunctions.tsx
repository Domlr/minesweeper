import { CellType, cellData } from "./CellTypes";

export function getMines(data: CellType[][]) {
  return getCellsWithFilter(data, (cell) => cell.isMine);
}

export function getFlags(data: CellType[][]) {
  return getCellsWithFilter(data, (cell) => cell.isFlagged);
}

export function getHidden(data: CellType[][]) {
  return getCellsWithFilter(data, (cell) => !cell.isRevealed);
}

function getCellsWithFilter(
  data: CellType[][],
  filterFunc: (cell: CellType) => boolean
) {
  let cellArray: CellType[] = [];

  data.map((datarow) => {
    datarow.map((dataitem) => {
      if (filterFunc(dataitem)) {
        cellArray.push(dataitem);
      }
    });
  });

  return cellArray;
}

// get random number given a dimension
export const getRandomNumber = (dimension: number) => {
  return Math.floor(Math.random() * 1000 + 1) % dimension;
};

export function plantMines(
  data: CellType[][],
  height: number,
  width: number,
  mines: number
): CellType[][] {
  let randomX: number,
    randomY: number,
    minesPlanted = 0;

  while (minesPlanted < mines) {
    randomX = getRandomNumber(width);
    randomY = getRandomNumber(height);
    if (!data[randomX][randomY].isMine) {
      data[randomX][randomY].isMine = true;
      minesPlanted++;
    }
  }

  return data;
}

function getNeighbours(
  data: CellType[][],
  height: number,
  width: number
): CellType[][] {
  const newData: CellType[][] = [];

  // Loop through each row in the data array
  for (let i = 0; i < height; i++) {
    // Create a new row array to add to the newData array
    const newRow: CellType[] = [];

    // Loop through each cell in the row
    for (let j = 0; j < width; j++) {
      const cell = data[i][j];
      const isMine = cell.isMine;
      let mine = 0;

      // If the cell isn't a mine, count the number of neighbouring mines
      if (!isMine) {
        const area = pointBoundaries(cell.x, cell.y, data, width, height);
        for (const value of area) {
          if (value.isMine) {
            mine++;
          }
        }

        // If the cell has no neighbouring mines, mark it as empty
        if (mine === 0) {
          newRow.push({
            ...cell,
            isEmpty: true,
            neighbour: mine,
          });
        } else {
          newRow.push({
            ...cell,
            isEmpty: false,
            neighbour: mine,
          });
        }
      } else {
        newRow.push(cell);
      }
    }

    // Add the new row array to the newData array
    newData.push(newRow);
  }

  return newData;
}

export const createEmptyArray = (height: number, width: number) => {
  let data: typeof cellData = [];

  for (let i = 0; i < height; i++) {
    data.push([]);
    for (let j = 0; j < width; j++) {
      data[i][j] = {
        x: i,
        y: j,
        isMine: false,
        neighbour: 0,
        isRevealed: false,
        isEmpty: false,
        isFlagged: false,
      };
    }
  }
  return data;
};

// Gets initial board data
export const initBoardData = (height: number, width: number, mines: number) => {
  let data: typeof cellData = createEmptyArray(height, width);
  data = plantMines(data, height, width, mines);
  data = getNeighbours(data, height, width);
  return data;
};

export function pointBoundaries(
  x: number,
  y: number,
  data: CellType[][],
  width: number,
  height: number
): CellType[] {
  const el: CellType[] = [];
  const directions = [
    [-1, 0], // up
    [-1, 1], // top right
    [0, 1], // right
    [1, 1], // bottom right
    [1, 0], // down
    [1, -1], // bottom left
    [0, -1], // left
    [-1, -1], // top left
  ];

  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;

    if (newX >= 0 && newX < height && newY >= 0 && newY < width) {
      el.push(data[newX][newY]);
    }
  }

  return el;
}
