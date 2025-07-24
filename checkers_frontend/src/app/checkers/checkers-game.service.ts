import { Injectable } from '@angular/core';

export interface CheckersPiece {
  player: 1 | 2; // 1:Red, 2:Black
  king: boolean;
}
export interface BoardCell {
  piece: CheckersPiece | null;
}
export interface Move {
  from: [number, number];
  to: [number, number];
  captures?: [number, number];
}

type GameStatus = 'ongoing' | 'red_win' | 'black_win' | 'draw';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class CheckersGameService {
  readonly rows = 8;
  readonly cols = 8;
  board: BoardCell[][] = [];
  currentPlayer: 1 | 2 = 1;
  selectedCell: [number, number] | null = null;
  highlightedCells: [number, number][] = [];
  possibleMoves: Move[] = [];
  moveLog: string[] = [];
  status: GameStatus = 'ongoing';

  // PUBLIC_INTERFACE
  get gameStatus() {
    if (this.status === 'ongoing')
      return 'Game in Progress';
    if (this.status === 'draw')
      return 'Draw';
    if (this.status === 'red_win')
      return 'Red wins!';
    if (this.status === 'black_win')
      return 'Black wins!';
    return '';
  }

  constructor() {
    this.resetGame();
  }

  // PUBLIC_INTERFACE
  resetGame() {
    this.board = [];
    for (let r = 0; r < this.rows; ++r) {
      const row: BoardCell[] = [];
      for (let c = 0; c < this.cols; ++c) {
        row.push({ piece: null });
      }
      this.board.push(row);
    }
    // Place Red pieces (player 1) on top 3 rows (dark squares only)
    for (let r = 0; r < 3; ++r) {
      for (let c = 0; c < this.cols; ++c) {
        if ((r + c) % 2 === 1) {
          this.board[r][c].piece = { player: 1, king: false };
        }
      }
    }
    // Place Black pieces (player 2) on bottom 3 rows
    for (let r = 5; r < 8; ++r) {
      for (let c = 0; c < this.cols; ++c) {
        if ((r + c) % 2 === 1) {
          this.board[r][c].piece = { player: 2, king: false };
        }
      }
    }
    this.currentPlayer = 1;
    this.selectedCell = null;
    this.highlightedCells = [];
    this.possibleMoves = [];
    this.moveLog = [];
    this.status = 'ongoing';
  }

  // PUBLIC_INTERFACE
  cellClicked(row: number, col: number) {
    if (this.status !== 'ongoing') return;

    // 1. Select or deselect piece
    if (!this.selectedCell) {
      const piece = this.getPieceAt(row, col);
      if (!piece || piece.player !== this.currentPlayer) return;
      this.selectedCell = [row, col];
      this.highlightedCells = this.getValidDestinations(row, col);
      this.possibleMoves = this.getValidMoves(row, col);
    } else {
      const [selRow, selCol] = this.selectedCell;
      if (row === selRow && col === selCol) {
        this.selectedCell = null;
        this.highlightedCells = [];
        this.possibleMoves = [];
        return;
      }
      // Is this a valid destination?
      for (const move of this.possibleMoves) {
        if (move.to[0] === row && move.to[1] === col) {
          this.makeMove(move);
          return;
        }
      }
      // Select new piece of same player
      const piece = this.getPieceAt(row, col);
      if (piece && piece.player === this.currentPlayer) {
        this.selectedCell = [row, col];
        this.highlightedCells = this.getValidDestinations(row, col);
        this.possibleMoves = this.getValidMoves(row, col);
      }
    }
  }

  // PUBLIC_INTERFACE
  isCellHighlighted(row: number, col: number): boolean {
    return this.highlightedCells.some(([r, c]) => r === row && c === col);
  }
  // PUBLIC_INTERFACE
  isCellSelected(row: number, col: number): boolean {
    return this.selectedCell?.[0] === row && this.selectedCell?.[1] === col;
  }
  // PUBLIC_INTERFACE
  getPieceAt(row: number, col: number): CheckersPiece | null {
    return this.board[row][col].piece;
  }
  // PUBLIC_INTERFACE
  getValidDestinations(row: number, col: number): [number, number][] {
    return this.getValidMoves(row, col).map(move => move.to);
  }
  // PUBLIC_INTERFACE
  getValidMoves(row: number, col: number): Move[] {
    const moves: Move[] = [];
    const piece = this.getPieceAt(row, col);
    if (!piece) return moves;
    const dirs = piece.king
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.player === 1
        ? [[1, -1], [1, 1]] // player 1: "Red" moves down
        : [[-1, -1], [-1, 1]]; // player 2: "Black" moves up

    // Normal moves (one square diagonal)
    for (const [dr, dc] of dirs) {
      const r2 = row + dr;
      const c2 = col + dc;
      if (r2 >= 0 && r2 < this.rows && c2 >= 0 && c2 < this.cols && !this.getPieceAt(r2, c2)) {
        moves.push({ from: [row, col], to: [r2, c2] });
      }
    }
    // Capture moves (jump over opponent)
    for (const [dr, dc] of dirs) {
      const r2 = row + dr;
      const c2 = col + dc;
      const r3 = row + dr * 2;
      const c3 = col + dc * 2;
      if (
        r3 >= 0 && r3 < this.rows && c3 >= 0 && c3 < this.cols &&
        this.getPieceAt(r2, c2) &&
        this.getPieceAt(r2, c2)?.player !== piece.player &&
        !this.getPieceAt(r3, c3)
      ) {
        moves.push({ from: [row, col], to: [r3, c3], captures: [r2, c2] });
      }
    }
    // If any captures are available, force capture
    const captures = moves.filter(m => m.captures);
    if (captures.length > 0) return captures;
    return moves;
  }

  // PUBLIC_INTERFACE
  makeSelectedMove() {
    if (!this.selectedCell) return;
    if (this.possibleMoves.length === 1) {
      this.makeMove(this.possibleMoves[0]);
    }
  }

  // PUBLIC_INTERFACE
  makeMove(move: Move) {
    const [fromR, fromC] = move.from;
    const [toR, toC] = move.to;
    const piece = this.getPieceAt(fromR, fromC);
    if (!piece) return;

    // Move piece on board
    this.board[toR][toC].piece = piece;
    this.board[fromR][fromC].piece = null;

    // Handle capture
    if (move.captures) {
      const [capR, capC] = move.captures;
      this.board[capR][capC].piece = null;
    }

    // Handle kinging
    if ((piece.player === 1 && toR === 7) || (piece.player === 2 && toR === 0)) {
      piece.king = true;
    }

    let logMove = `(${fromR},${fromC})→(${toR},${toC})`;
    if (piece.king) logMove += 'K';
    this.moveLog.push(logMove);

    // Handle multiple captures ("flying kings" not standard: only one capture for now)
    this.selectedCell = null;
    this.highlightedCells = [];
    this.possibleMoves = [];

    // Switch player if no additional capture is possible
    if (move.captures) {
      const newMoves = this.getValidMoves(toR, toC).filter(m => m.captures);
      if (newMoves.length > 0) {
        this.selectedCell = [toR, toC];
        this.highlightedCells = this.getValidDestinations(toR, toC);
        this.possibleMoves = newMoves;
        // Player must continue capturing with that piece
        return;
      }
    }

    this.currentPlayer = (this.currentPlayer === 1 ? 2 : 1);

    // End of turn: check for victory, draw
    this.checkGameEnd();
  }

  // PUBLIC_INTERFACE
  checkGameEnd() {
    const flatBoard = this.board.flat();
    const redPieces = flatBoard.filter(cell => cell.piece?.player === 1).length;
    const blackPieces = flatBoard.filter(cell => cell.piece?.player === 2).length;

    if (redPieces === 0) this.status = 'black_win';
    else if (blackPieces === 0) this.status = 'red_win';
    else if (!this.anyMovesForPlayer(1) && !this.anyMovesForPlayer(2)) this.status = 'draw';
    else if (!this.anyMovesForPlayer(this.currentPlayer)) {
      this.status = this.currentPlayer === 1 ? 'black_win' : 'red_win';
    }
  }

  // PUBLIC_INTERFACE
  anyMovesForPlayer(player: 1 | 2): boolean {
    for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c)
      if (this.getPieceAt(r, c)?.player === player && this.getValidMoves(r, c).length > 0)
        return true;
    return false;
  }
}
