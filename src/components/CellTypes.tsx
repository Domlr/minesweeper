export type CellType = {
  x: number;
  y: number;
  isMine: boolean;
  neighbour: number;
  isRevealed: boolean;
  isEmpty: boolean;
  isFlagged: boolean;
};

export let cellData: CellType[][] = [
  [
    {
      x: 0,
      y: 0,
      isMine: false,
      neighbour: 0,
      isRevealed: false,
      isEmpty: false,
      isFlagged: false,
    },
  ],
];
