import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent {
  games = [
    {
      title: '夸夸弹幕',
      desc: '在屏幕上发射你的夸夸弹幕，收获温暖和快乐！',
      icon: '🎉',
      link: '#',
      comingSoon: true
    },
    {
      title: '夸夸接龙',
      desc: '和朋友一起夸夸接龙，看看谁更会夸！',
      icon: '🤝',
      link: '#',
      comingSoon: true
    },
    {
      title: '夸夸抽卡',
      desc: '抽取专属你的幸运夸夸卡片！',
      icon: '🃏',
      link: '#',
      comingSoon: true
    },
    {
      title: '夸夸倒计时',
      desc: '在限定时间内点击，看看你能收获多少夸夸！',
      icon: '⏱️',
      link: '#',
      comingSoon: true
    },
    {
      title: '夸夸抽签',
      desc: '每日一签，抽取今日专属夸夸语！',
      icon: '🧧',
      link: '#',
      comingSoon: true
    },
    {
      title: '夸夸数数',
      desc: '点击按钮，每数一次都收获一句夸夸！',
      icon: '🔢',
      link: '/games/counting',
      comingSoon: false
    },
    {
      title: '夸夸点击',
      desc: '每点击一次按钮，都会收到一句夸夸！',
      icon: '👏',
      link: '/games/clicking',
      comingSoon: false
    },
    {
      title: '2048',
      desc: '经典数字合成游戏，挑战你的极限！',
      icon: '🔢',
      link: '/games/2048',
      comingSoon: false
    },
    {
      title: '色觉测试',
      desc: '在一组色块中找出颜色不同的那一块，挑战你的色觉极限！',
      icon: '🌈',
      link: '/games/color-test',
      comingSoon: false
    }
  ];
} 