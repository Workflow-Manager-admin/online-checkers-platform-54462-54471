import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CheckersBoardComponent } from './checkers/checkers-board.component';
import { CheckersControlPanelComponent } from './checkers/checkers-control-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CheckersBoardComponent, CheckersControlPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
