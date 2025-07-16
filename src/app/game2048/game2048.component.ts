import { Component } from '@angular/core';

@Component({
  selector: 'app-game2048',
  standalone: true,
  templateUrl: './game2048.component.html',
  styleUrl: './game2048.component.css'
})
export class Game2048Component {
  // 4x4 网格
  grid: number[][] = [];
  score = 0;

  constructor() {
    this.reset();
  }

  reset() {
    this.grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    this.score = 0;
    this.addRandomTile();
    this.addRandomTile();
  }

  addRandomTile() {
    const empty: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  handleKey(event: KeyboardEvent) {
    let moved = false;
    if (event.key === 'ArrowLeft') moved = this.moveLeft();
    if (event.key === 'ArrowRight') moved = this.moveRight();
    if (event.key === 'ArrowUp') moved = this.moveUp();
    if (event.key === 'ArrowDown') moved = this.moveDown();
    if (moved) this.addRandomTile();
  }

  moveLeft(): boolean {
    let moved = false;
    for (let r = 0; r < 4; r++) {
      let row = this.grid[r].filter(x => x !== 0);
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
          row[i] *= 2;
          this.score += row[i];
          row[i + 1] = 0;
        }
      }
      row = row.filter(x => x !== 0);
      while (row.length < 4) row.push(0);
      if (row.some((v, i) => v !== this.grid[r][i])) moved = true;
      this.grid[r] = row;
    }
    return moved;
  }
  moveRight(): boolean {
    this.grid = this.grid.map(row => row.slice().reverse());
    const moved = this.moveLeft();
    this.grid = this.grid.map(row => row.slice().reverse());
    return moved;
  }
  moveUp(): boolean {
    this.transpose();
    const moved = this.moveLeft();
    this.transpose();
    return moved;
  }
  moveDown(): boolean {
    this.transpose();
    const moved = this.moveRight();
    this.transpose();
    return moved;
  }
  transpose() {
    const newGrid = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        newGrid[c][r] = this.grid[r][c];
    this.grid = newGrid;
  }
} 