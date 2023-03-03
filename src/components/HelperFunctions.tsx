import { CellType } from "./CellTypes";

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
