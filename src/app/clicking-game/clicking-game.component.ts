import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonPipe } from '@angular/common';

interface Match3Cell {
  animal: number;
  selected: boolean;
}

@Component({
  selector: 'app-clicking-game',
  standalone: true,
  templateUrl: './clicking-game.component.html',
  styleUrl: './clicking-game.component.css',
  imports: [CommonModule, JsonPipe]
})
export class ClickingGameComponent {
  board: Match3Cell[][] = [];
  animalSets = [
    ['🐻', '🦊', '🐸', '🐥', '🦉'], // 棕、橙、绿、黄、紫
    ['🐶', '🐱', '🐭', '🐹', '🐰'], // 棕、黄、灰、粉、白
    ['🦁', '🐯', '🐮', '🐷', '🐵'], // 黄、橙、黑白、粉、棕
    ['🐙', '🦑', '🦀', '🦞', '🦐'], // 粉、红、橙、紫
    ['🐠', '🐟', '🐡', '🐬', '🐳'], // 橙、蓝、黄、青、蓝
    ['🦄', '🐲', '🐉', '🦕', '🦖']  // 紫、绿、蓝、灰、棕
  ];
  plantSets = [
    ['🌲', '🌻', '🍄', '🍂', '🌷'], // 绿、黄、红、棕、粉
    ['🌳', '🌸', '🌵', '🍁', '🌼'], // 绿、粉、绿、红、黄
    ['🍀', '🌿', '🍃', '🍁', '🍂']  // 绿、绿、绿、红、棕
  ];
  foodSets = [
    ['🍎', '🍌', '🍇', '🍊', '🍉'], // 红、黄、紫、橙、绿
    ['🍓', '🍋', '🍒', '🥝', '🥕'], // 红、黄、红、绿、橙
    ['🍔', '🍟', '🍕', '🌭', '🥗'], // 棕、黄、红、橙、绿
    ['🍣', '🍤', '🍙', '🍛', '🍦']  // 粉、橙、白、黄、白
  ];
  emojiCategorySets = [this.animalSets, this.plantSets, this.foodSets];
  animalList = this.animalSets[0];
  score = 0;
  size = 8;

  // 拖拽相关
  dragging = false;
  dragAnimal: string | null = null;
  dragFrom: { row: number, col: number } | null = null;
  dragTo: { row: number, col: number } | null = null;
  dragPos: { x: number, y: number } | null = null;

  constructor() {
    this.reset();
  }

  reset() {
    // 先随机选类别，再随机选组
    const category = this.emojiCategorySets[Math.floor(Math.random() * this.emojiCategorySets.length)];
    this.animalList = category[Math.floor(Math.random() * category.length)];
    this.score = 0;
    this.dragging = false;
    this.dragAnimal = null;
    this.dragFrom = null;
    this.dragTo = null;
    this.dragPos = null;
    this.board = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => ({ animal: this.randomAnimalIndex(), selected: false }))
    );
    this.removeInitialMatches();
  }

  randomAnimalIndex() {
    return Math.floor(Math.random() * this.animalList.length);
  }

  onCellMouseDown(event: MouseEvent, row: number, col: number) {
    event.preventDefault();
    this.dragging = true;
    this.dragFrom = { row, col };
    this.dragAnimal = this.animalList[this.board[row][col].animal];
    this.dragPos = { x: event.clientX, y: event.clientY };
    this.board[row][col].selected = true;
  }

  onCellMouseEnter(row: number, col: number) {
    if (this.dragging) {
      this.dragTo = { row, col };
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.dragging) {
      this.dragPos = { x: event.clientX, y: event.clientY };
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.dragging && this.dragFrom && this.dragTo) {
      const { row: r1, col: c1 } = this.dragFrom;
      const { row: r2, col: c2 } = this.dragTo;
      if ((Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2)) {
        this.swap(r1, c1, r2, c2);
        this.resolveMatches(); // 只做消除，不做“弹回”
      }
    }
    this.clearSelected();
    this.dragging = false;
    this.dragAnimal = null;
    this.dragFrom = null;
    this.dragTo = null;
    this.dragPos = null;
  }

  clearSelected() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        this.board[r][c].selected = false;
      }
    }
  }

  swap(r1: number, c1: number, r2: number, c2: number) {
    const tmp = this.board[r1][c1];
    this.board[r1][c1] = this.board[r2][c2];
    this.board[r2][c2] = tmp;
  }

  resolveMatches(): boolean {
    let matched = this.findMatches();
    let any = false;
    while (matched.length > 0) {
      any = true;
      for (const { row, col } of matched) {
        this.board[row][col].animal = -1;
        this.score += 10;
      }
      this.collapse();
      matched = this.findMatches();
    }
    return any;
  }

  findMatches(): { row: number, col: number }[] {
    const matches: { row: number, col: number }[] = [];
    // 横向
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size - 2; c++) {
        const v = this.board[r][c].animal;
        if (v !== -1 && v === this.board[r][c + 1].animal && v === this.board[r][c + 2].animal) {
          let k = c;
          while (k < this.size && this.board[r][k].animal === v) {
            matches.push({ row: r, col: k });
            k++;
          }
          c = k - 1;
        }
      }
    }
    // 纵向
    for (let c = 0; c < this.size; c++) {
      for (let r = 0; r < this.size - 2; r++) {
        const v = this.board[r][c].animal;
        if (v !== -1 && v === this.board[r + 1][c].animal && v === this.board[r + 2][c].animal) {
          let k = r;
          while (k < this.size && this.board[k][c].animal === v) {
            matches.push({ row: k, col: c });
            k++;
          }
          r = k - 1;
        }
      }
    }
    // 去重
    return matches.filter((m, i, arr) => arr.findIndex(x => x.row === m.row && x.col === m.col) === i);
  }

  collapse() {
    for (let c = 0; c < this.size; c++) {
      let pointer = this.size - 1;
      for (let r = this.size - 1; r >= 0; r--) {
        if (this.board[r][c].animal !== -1) {
          this.board[pointer][c].animal = this.board[r][c].animal;
          pointer--;
        }
      }
      for (let r = pointer; r >= 0; r--) {
        this.board[r][c].animal = this.randomAnimalIndex();
      }
    }
  }

  removeInitialMatches() {
    while (this.findMatches().length > 0) {
      for (const { row, col } of this.findMatches()) {
        this.board[row][col].animal = this.randomAnimalIndex();
      }
    }
  }
} 