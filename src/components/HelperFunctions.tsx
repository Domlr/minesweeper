import { CellType, cellData } from "./CellTypes";

export function getMines(data: CellType[][]) {
  let mineArray: CellType[] = [];

  data.map((datarow) => {
    datarow.map((dataitem) => {
      if (dataitem.isMine) {
        mineArray.push(dataitem);
      }
    });
  });

  return mineArray;
}

export function getFlags(data: CellType[][]) {
  let mineArray: CellType[] = [];

  data.map((datarow) => {
    datarow.map((dataitem) => {
      if (dataitem.isFlagged) {
        mineArray.push(dataitem);
      }
    });
  });

  return mineArray;
}

export function getHidden(data: CellType[][]) {
  let mineArray: CellType[] = [];

  data.map((datarow) => {
    datarow.map((dataitem) => {
      if (!dataitem.isRevealed) {
        mineArray.push(dataitem);
      }
    });
  });

  return mineArray;
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

// get number of neighbouring mines for each board cell
function getNeighbours(
  data: CellType[][],
  height: number,
  width: number
): CellType[][] {
  const updatedData = [...data];

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (data[i][j].isMine !== true) {
        let mine = 0;
        const area = traverseBoard(
          data[i][j].x,
          data[i][j].y,
          data,
          width,
          height
        );
        area.map((value) => {
          if (value.isMine) {
            mine++;
          }
        });
        if (mine === 0) {
          updatedData[i][j].isEmpty = true;
        }
        updatedData[i][j].neighbour = mine;
      }
    }
  }

  return updatedData;
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

// looks for neighbouring cells and returns them
export function traverseBoard(
  x: number,
  y: number,
  data: CellType[][],
  width: number,
  height: number
): CellType[] {
  const el: CellType[] = [];

  //up
  if (x > 0) {
    el.push(data[x - 1][y]);
  }

  //down
  if (x < height - 1) {
    el.push(data[x + 1][y]);
  }

  //left
  if (y > 0) {
    el.push(data[x][y - 1]);
  }

  //right
  if (y < width - 1) {
    el.push(data[x][y + 1]);
  }

  // top left
  if (x > 0 && y > 0) {
    el.push(data[x - 1][y - 1]);
  }

  // top right
  if (x > 0 && y < width - 1) {
    el.push(data[x - 1][y + 1]);
  }

  // bottom right
  if (x < height - 1 && y < width - 1) {
    el.push(data[x + 1][y + 1]);
  }

  // bottom left
  if (x < height - 1 && y > 0) {
    el.push(data[x + 1][y - 1]);
  }

  return el;
}
