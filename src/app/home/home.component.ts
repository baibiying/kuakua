import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
// @ts-ignore
import WebGLFluid from 'webgl-fluid';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('fluidCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private leftInterval: any;
  private rightInterval: any;
  private fluidInstance: any;

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
  generateQuote() {
    let newQuote;
    do {
      newQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    } while (newQuote === this.quote && this.quotes.length > 1);
    this.quote = newQuote;
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    // 初始化 WebGLFluid，关闭自动触发
    this.fluidInstance = WebGLFluid(canvas, {
      TRIGGER: 'none',
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 0.98,
      VELOCITY_DISSIPATION: 0.99,
      PRESSURE: 0.8,
      CURL: 30,
      SPLAT_RADIUS: 0.25,
      SHADING: true,
      COLORFUL: false,
    });

    // 设置WebGL背景为米黄色（#f7efd7）
    const gl = canvas.getContext('webgl');
    if (gl) {
      gl.clearColor(0.97, 0.94, 0.84, 1); // #f7efd7
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // 左侧持续注入蓝色
    this.leftInterval = setInterval(() => {
      this.splat(canvas, 0.18, 0.5, 0, 0, [0.3, 0.4, 1.0]);
    }, 60);

    // 右侧持续注入红色
    this.rightInterval = setInterval(() => {
      this.splat(canvas, 0.82, 0.5, 0, 0, [1.0, 0.6, 0.6]);
    }, 60);

    // 鼠标移动时在当前位置注入渐变色
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      // 渐变色：x 越靠左越蓝，越靠右越红
      const r = x;
      const g = 0.2 + 0.3 * (1 - Math.abs(x - 0.5) * 2);
      const b = 1 - x;
      this.splat(canvas, x, y, 0, 0, [r, g, b]);
    });
  }

  // 通用注入方法
  splat(canvas: HTMLCanvasElement, x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    // @ts-ignore
    if (this.fluidInstance && this.fluidInstance.splat) {
      // 新版 webgl-fluid 可能暴露 splat 方法
      this.fluidInstance.splat(x * canvas.width, y * canvas.height, dx, dy, color);
    } else if ((window as any).splat) {
      // 兼容旧的全局 splat
      (window as any).splat(x, y, dx, dy, ...color);
    }
  }

  ngOnDestroy() {
    if (this.leftInterval) clearInterval(this.leftInterval);
    if (this.rightInterval) clearInterval(this.rightInterval);
  }
} 