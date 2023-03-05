import { CellType, cellData } from "./CellTypes";

//This will return an array of all cells that have mines
export function getMines(data: CellType[][]) {
  return getCellsWithFilter(data, (cell) => cell.isMine);
}
//This will return an array of cells with flags
export function getFlags(data: CellType[][]) {
  return getCellsWithFilter(data, (cell) => cell.isFlagged);
}

//this will return an array of all cells that are not revealed
export function getHidden(data: CellType[][]) {
  return getCellsWithFilter(data, (cell) => !cell.isRevealed);
}

//We use this as a helper so that we can reuse the code for getMines, getFlags and getHidden by passing in the condition we want to check for
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
  return Math.floor(Math.random() * dimension);
};

// this takes in the getrandomnumber function and assignes random x and y coords. While mines planted are less than how many mines we want
// it will keep looping through the array and assigning mines to random cells. It then returns the new data array.
export function plantMines(
  data: CellType[][],
  height: number,
  width: number,
  mines: number,
  firstClickX?: number,
  firstClickY?: number
): CellType[][] {
  // Randomly add mines to the board
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const randomX = getRandomNumber(width);
    const randomY = getRandomNumber(height);
    if (
      !data[randomX][randomY].isMine &&
      randomX !== firstClickX &&
      randomY !== firstClickY
    ) {
      data[randomX][randomY].isMine = true;
      minesPlaced++;
    }
  }

  return data;
}

//This takes in the data array and will create a new Data array. It will loop through each cell in data and check if it is a mine. If it isn't a mine
//it will check the pointBoundaries function and count how many mines are around that cell using the data array. It will then add that number the new cell and push when
//the row has been completed. In the very end it will return the new data array.
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

//resets the board with initial values, producing a data array. Plantmines will populate the data array with mines
//and getNeighbours will count the number of mines around each cell pushing a newdataarray
export const initBoardData = (
  height: number,
  width: number,
  mines: number,
  firstClickX?: number,
  firstClickY?: number
): CellType[][] => {
  // Create 2D array with all cells unrevealed and not containing a mine
  let data: CellType[][] = [];
  for (let i = 0; i < height; i++) {
    let row: CellType[] = [];
    for (let j = 0; j < width; j++) {
      row.push({
        x: i,
        y: j,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        isEmpty: false,
        neighbour: 0,
      });
    }
    data.push(row);
  }
  //set the mines
  data = plantMines(data, height, width, mines, firstClickX, firstClickY);

  // Calculate the number of neighbouring mines for each cell
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
