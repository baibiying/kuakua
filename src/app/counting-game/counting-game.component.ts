import { Component } from '@angular/core';

@Component({
  selector: 'app-counting-game',
  standalone: true,
  templateUrl: './counting-game.component.html',
  styleUrl: './counting-game.component.css'
})
export class CountingGameComponent {
  count = 0;
  compliments = [
    '你真棒！',
    '继续加油，越来越好！',
    '你的坚持令人佩服！',
    '你是最棒的自己！',
    '每一次点击都是进步！',
    '你的努力终将被看到！',
    '你值得拥有美好的一切！',
    '你的笑容真有感染力！',
    '你很特别，世界因你而美好！',
    '你的善良温暖了身边的人！'
  ];
  get compliment() {
    return this.compliments[this.count % this.compliments.length];
  }
  increment() {
    this.count++;
  }
  reset() {
    this.count = 0;
  }
} 