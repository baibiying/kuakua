import { Component, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { Routes } from '@angular/router';
import { GamesComponent } from './games/games.component';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CountingGameComponent } from './counting-game/counting-game.component';
import { HomeComponent } from './home/home.component';
import { ClickingGameComponent } from './clicking-game/clicking-game.component';
import { Game2048Component } from './game2048/game2048.component';
import { ColorTestGameComponent } from './color-test-game/color-test-game.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="main-nav">
      <a class="nav-link" routerLink="/" [class.active]="router.url === '/'">首页</a>
      <a class="nav-link" routerLink="/games" [class.active]="router.url === '/games'">小游戏广场</a>
    </nav>
    <router-outlet></router-outlet>
    <canvas class="kk-mouse-canvas"></canvas>
    <svg width="0" height="0" style="position: absolute">
      <filter id="liquid-glow">
        <feTurbulence id="turb" type="turbulence" baseFrequency="0.18 0.22" numOctaves="2" seed="2" result="turb"/>
        <feDisplacementMap in2="turb" in="SourceGraphic" scale="60" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>
  `,
  styleUrl: '../styles.css'
})
export class App implements AfterViewInit, OnDestroy {
  // 只保留流光和 canvas 相关逻辑，其余主页逻辑移到 HomeComponent
  protected readonly title = signal('kuakua-angular');
  quotes = [
    '你今天真棒，继续加油！',
    '你的笑容真有感染力！',
    '你做事的态度让人佩服！',
    '你值得拥有美好的一切！',
    '你的努力终将被看到！',
    '你是最棒的自己！',
    '你的善良温暖了身边的人！',
    '你很特别，世界因你而美好！',
    '你的坚持令人敬佩！',
    '你拥有无限可能！'
  ];
  quote = this.quotes[0];

  constructor(public router: Router) {}

  isHomePage() {
    // Angular 路由初始化时 this.router.url 可能为 ''，用 window.location.pathname 兜底
    const url = this.router.url || window.location.pathname;
    return url === '/' || url === '';
  }

  private glowEl: HTMLElement | null = null;
  private mouseX = window.innerWidth / 2;
  private mouseY = window.innerHeight / 2;
  private glowX = this.mouseX;
  private glowY = this.mouseY;
  private animationFrameId: number | null = null;

  private cursorGlowEl: HTMLElement | null = null;
  private cursorGlowX = window.innerWidth / 2;
  private cursorGlowY = window.innerHeight / 2;
  private cursorGlowTimeout: any = null;
  private mouseMoveHandler = (e: MouseEvent) => {
    const now = performance.now();
    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;
    const dt = now - this.lastMoveTime;
    const speed = Math.sqrt(dx * dx + dy * dy) / (dt || 1);
    // 速度映射到半径（10~600px）
    this.glowRadius = Math.max(1, Math.min(1, speed * 400 + 1));
    this.glowAlpha = 1;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.lastMoveTime = now;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.mouseActive = true;
    // 重置淡出
    if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
    this.fadeTimeout = setTimeout(() => {
      this.mouseActive = false;
    }, 200);
    this.trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (this.trail.length > 24) this.trail.shift();
  };
  private turbElem: SVGElement | null = null;
  private turbTime = 0;
  private animateGlow = () => {
    // 惯性插值，0.15 越大越跟手，越小越丝滑
    this.glowX += (this.mouseX - this.glowX) * 0.15;
    this.glowY += (this.mouseY - this.glowY) * 0.15;
    if (this.glowEl) {
      this.glowEl.style.background =
        `radial-gradient(circle at ${this.glowX}px ${this.glowY}px, rgba(244,114,182,0.45) 0%, rgba(167,139,250,0.35) 30%, rgba(34,211,238,0.22) 55%, transparent 80%)` +
        `, radial-gradient(circle at ${this.glowX + 60}px ${this.glowY + 40}px, rgba(251,191,36,0.18) 0%, transparent 60%)`;
    }
    // 鼠标炫彩流光环绕动画
    if (this.cursorGlowEl) {
      // 惯性插值
      const prevLeft = parseFloat(this.cursorGlowEl.style.left) || window.innerWidth / 2;
      const prevTop = parseFloat(this.cursorGlowEl.style.top) || window.innerHeight / 2;
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const newLeft = lerp(prevLeft, this.cursorGlowX, 0.25);
      const newTop = lerp(prevTop, this.cursorGlowY, 0.25);
      this.cursorGlowEl.style.left = `${newLeft}px`;
      this.cursorGlowEl.style.top = `${newTop}px`;
    }
    // 液体流动动画
    if (!this.turbElem) {
      this.turbElem = document.getElementById('turb') as unknown as SVGElement;
    }
    if (this.turbElem) {
      this.turbTime += 0.018;
      const freqX = 0.16 + Math.sin(this.turbTime) * 0.10;
      const freqY = 0.22 + Math.cos(this.turbTime * 0.7) * 0.10;
      this.turbElem.setAttribute('baseFrequency', `${freqX} ${freqY}`);
      this.turbElem.setAttribute('seed', (2 + Math.sin(this.turbTime) * 6).toFixed(2));
    }
    this.animationFrameId = requestAnimationFrame(this.animateGlow);
  };

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private mouseActive = false;
  private lastDrawTime = 0;
  private fadeTimeout: any = null;
  private isAnimating = false;
  private lastMouseX = window.innerWidth / 2;
  private lastMouseY = window.innerHeight / 2;
  private lastMoveTime = performance.now();
  private glowRadius = 1;
  private glowAlpha = 0.01;
  private trail: {x: number, y: number, t: number}[] = [];

  private drawRainbowGlow(x: number, y: number, radius: number, t: number, alpha: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // 绘制流体拖尾
    for (let i = 1; i < this.trail.length; i++) {
      const p1 = this.trail[i - 1];
      const p2 = this.trail[i];
      // 彩虹色
      const hue1 = (t * 60 + i * 18) % 360;
      const hue2 = (t * 60 + (i + 1) * 18) % 360;
      const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, `hsla(${hue1}, 90%, 65%, ${0.18 * (i / this.trail.length) * alpha})`);
      grad.addColorStop(1, `hsla(${hue2}, 90%, 65%, ${0.14 * (i / this.trail.length) * alpha})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 60 * (i / this.trail.length) + 10;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  private animateCanvas = (now: number) => {
    if (!this.ctx) return;
    if (this.mouseActive) {
      this.glowAlpha = Math.min(1, this.glowAlpha + 0.12);
    } else {
      this.glowAlpha = Math.max(0, this.glowAlpha - 0.04);
      // 鼠标静止时逐步清空拖尾
      if (this.trail.length > 1) this.trail.shift();
    }
    if (this.glowAlpha > 0.01 && this.trail.length > 1) {
      const last = this.trail[this.trail.length - 1];
      this.drawRainbowGlow(last.x, last.y, this.glowRadius, now / 1000, this.glowAlpha);
    } else {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    requestAnimationFrame(this.animateCanvas);
  };

  generateQuote() {
    let newQuote;
    do {
      newQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    } while (newQuote === this.quote && this.quotes.length > 1);
    this.quote = newQuote;
  }

  ngAfterViewInit() {
    this.glowEl = document.querySelector('.kk-glow');
    this.cursorGlowEl = document.querySelector('.kk-cursor-glow');
    this.canvas = document.querySelector('.kk-mouse-canvas') as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      const resize = () => {
        this.canvas!.width = window.innerWidth;
        this.canvas!.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);
      console.log('Canvas and ctx initialized', this.canvas, this.ctx);
    }
    window.addEventListener('mousemove', this.mouseMoveHandler);
    this.animationFrameId = requestAnimationFrame(this.animateCanvas);
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.cursorGlowTimeout) {
      clearTimeout(this.cursorGlowTimeout);
    }
    if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
  }
}

// 必须在 App 类声明后再写 routes
export const routes: import('@angular/router').Routes = [
  { path: '', component: HomeComponent },
  { path: 'games', component: GamesComponent },
  { path: 'games/counting', component: CountingGameComponent },
  { path: 'games/clicking', component: ClickingGameComponent },
  { path: 'games/2048', component: Game2048Component },
  { path: 'games/color-test', component: ColorTestGameComponent },
];
