import { BOARD_SIZE } from "../consts";
import { createEmptyBoard } from "../reducers/reducersUtil";

export class Board {
  constructor() {
    this.grid = createEmptyBoard();
    this.usedRows = new Set();
    this.usedCols = new Set();
  }

  set = function (x, y, val) {
    this.usedRows.add(x);
    this.usedCols.add(y);
    this.grid[x][y] = val;
  };

  get = function () {
    return this.grid[x][y];
  };

  remove = function (x, y) {
    this.grid[x][y] = undefined;
    let columnUsed = false;
    let rowUsed = false;
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (this.grid[x][i]) rowUsed = true;
      if (this.grid[i][y]) columnUsed = true;
      if (rowUsed && columnUsed) break;
    }
    if (!rowUsed) this.usedRows.delete(x);
    if (!columnUsed) this.usedCols.delete(y);
  };
}
