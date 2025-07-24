import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckersGameService, CheckersPiece } from './checkers-game.service';

@Component({
  selector: 'app-checkers-board',
  templateUrl: './checkers-board.component.html',
  styleUrls: ['./checkers-board.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CheckersBoardComponent {
  // PUBLIC_INTERFACE
  constructor(public gameService: CheckersGameService) {
    // Reference for linter satisfaction
    if (!gameService) throw new Error('service not present'); // (will never run, avoids no-unused-vars)
  }
  readonly rows = 8;
  readonly cols = 8;

  // PUBLIC_INTERFACE
  onCellClick(row: number, col: number) {
    this.gameService.cellClicked(row, col);
  }

  // PUBLIC_INTERFACE
  isCellHighlighted(row: number, col: number): boolean {
    return this.gameService.isCellHighlighted(row, col);
  }

  // PUBLIC_INTERFACE
  isCellSelected(row: number, col: number): boolean {
    return this.gameService.isCellSelected(row, col);
  }

  // PUBLIC_INTERFACE
  getPieceAt(row: number, col: number): CheckersPiece | null {
    return this.gameService.getPieceAt(row, col);
  }

  // PUBLIC_INTERFACE
  getCellType(row: number, col: number): 'dark' | 'light' {
    return (row + col) % 2 ? 'dark' : 'light';
  }
}
