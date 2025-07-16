import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-color-test-game',
  standalone: true,
  templateUrl: './color-test-game.component.html',
  styleUrl: './color-test-game.component.css',
  imports: [CommonModule]
})
export class ColorTestGameComponent implements OnInit, OnDestroy {
  gridSize = 2;
  answerIndex = 0;
  score = 0;
  round = 1;
  timer = 10;
  timerInterval: any = null;

  // blocks 用对象数组，只包含 isOdd 字段
  blocks: { isOdd: boolean }[] = [];

  colorPairs = [
    { main: 'sky', mainColor: '#7ddcff', odd: 'deep-sky', oddColor: '#039be5' },
    { main: 'pink', mainColor: '#ffb3de', odd: 'deep-pink', oddColor: '#e75480' },
    { main: 'green', mainColor: '#a8ffb3', odd: 'deep-green', oddColor: '#1fa152' },
    { main: 'yellow', mainColor: '#fff7b3', odd: 'deep-yellow', oddColor: '#e5c100' },
    { main: 'purple', mainColor: '#e0b3ff', odd: 'deep-purple', oddColor: '#7c3aed' },
    { main: 'orange', mainColor: '#ffd6b3', odd: 'deep-orange', oddColor: '#ff8800' },
  ];
  currentColorIndex = 0;
  currentColorClass = 'sky';

  colorNameMap: Record<string, string> = {
    sky: '天蓝',
    pink: '粉色',
    green: '绿色',
    yellow: '黄色',
    purple: '紫色',
    orange: '橙色'
  };

  constructor() {}

  ngOnInit() {
    this.nextRound();
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timer = 10;
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.score = 0;
        this.nextRound();
        this.startTimer();
      }
    }, 1000);
  }

  nextRound() {
    this.gridSize = Math.min(8, 2 + Math.floor(this.score / 3));
    this.answerIndex = Math.floor(Math.random() * this.gridSize * this.gridSize);

    // 每次升级切换颜色
    this.currentColorIndex = this.score % this.colorPairs.length;
    this.currentColorClass = this.colorPairs[this.currentColorIndex].main;

    this.blocks = Array.from({ length: this.gridSize * this.gridSize }, (_, i) => ({
      isOdd: i === this.answerIndex
    }));

    this.round++;
  }

  pick(idx: number) {
    if (idx === this.answerIndex) {
      this.score++;
      this.nextRound();
    } else {
      this.score = 0;
      this.nextRound();
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
} 