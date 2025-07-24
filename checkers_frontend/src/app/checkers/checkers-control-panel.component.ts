import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckersGameService } from './checkers-game.service';

@Component({
  selector: 'app-checkers-control-panel',
  templateUrl: './checkers-control-panel.component.html',
  styleUrls: ['./checkers-control-panel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CheckersControlPanelComponent {
  constructor(public gameService: CheckersGameService) {
    // Reference for linter satisfaction
    if (!gameService) throw new Error('service not present'); // (will never run, avoids no-unused-vars)
  }

  // PUBLIC_INTERFACE
  newGame() {
    this.gameService.resetGame();
  }

  // PUBLIC_INTERFACE
  doMove() {
    this.gameService.makeSelectedMove();
  }
}
