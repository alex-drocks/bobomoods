import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

interface BoboCard {
  src: string;
  alt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  rotation: number;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  scale: number;
}

@Component({
  selector: 'app-floating-cards',
  template: `
    <div class="floating-cards-container">
      @for (card of boboCards; track card.src) {
        <div
          class="floating-card"
          [class]="'floating-card--' + card.rarity"
          [style.--base-rotation]="card.rotation + 'deg'"
          [style.--base-scale]="card.scale"
          [style.top]="card.position.top"
          [style.bottom]="card.position.bottom"
          [style.left]="card.position.left"
          [style.right]="card.position.right">
          <div class="card-glow"></div>
          <img
            [ngSrc]="card.src"
            [alt]="card.alt"
            class="bobo-card-image"
            width="300"
            height="400"
            priority />
        </div>
      }
    </div>
  `,
  styleUrls: ['./floating-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage]
})
export class FloatingCardsComponent {
  readonly boboCards: BoboCard[] = [
    // Distributed positioning to avoid overlaps
    // Top row - well spaced
    {
      src: '/bobo-common-PRERICH-trader-HD.png',
      alt: 'Bobo Common Prerich Trader',
      rarity: 'common',
      rotation: -11,
      position: { top: '5%', left: '2%' },
      scale: 0.3
    },
    {
      src: '/bobo-rare-ANNOYED-beta-HD.png',
      alt: 'Bobo Rare Annoyed Beta',
      rarity: 'rare',
      rotation: -16,
      position: { top: '8%', left: '35%' },
      scale: 0.4
    },
    {
      src: '/bobo-epic-COOKED-viber-HD.png',
      alt: 'Bobo Epic Cooked Viber',
      rarity: 'epic',
      rotation: 8,
      position: { top: '2%', right: '25%' },
      scale: 0.42
    },
    {
      src: '/bobo-legendary-OPTIMISTIC-artist-HD.png',
      alt: 'Bobo Legendary Optimistic Artist',
      rarity: 'legendary',
      rotation: 14,
      position: { top: '10%', right: '3%' },
      scale: 0.44
    },
    // Middle row - strategically placed
    {
      src: '/bobo-common-SAD-mfer-HD.png',
      alt: 'Bobo Common Sad Mfer',
      rarity: 'common',
      rotation: 8,
      position: { top: '37%', left: '8%' },
      scale: 0.3
    },
    {
      src: '/bobo-epic-LONELY-shitposter-HD.png',
      alt: 'Bobo Epic Lonely Shitposter',
      rarity: 'epic',
      rotation: -6,
      position: { top: '43%', left: '41%' },
      scale: 0.4
    },
    {
      src: '/bobo-mythic-BADASS-bear-HD.png',
      alt: 'Bobo Mythic Badass Bear',
      rarity: 'mythic',
      rotation: 23,
      position: { top: '40%', right: '11%' },
      scale: 0.5
    },
    // Bottom row - evenly distributed
    {
      src: '/bobo-epic-HOPEFUL-doomer-HD.png',
      alt: 'Bobo Epic Hopeful Doomer',
      rarity: 'epic',
      rotation: -5,
      position: { bottom: '8%', left: '5%' },
      scale: 0.43
    },
    {
      src: '/bobo-legendary-BLESSED-shitposter-HD.png',
      alt: 'Bobo Legendary Blessed Shitposter',
      rarity: 'legendary',
      rotation: -10,
      position: { bottom: '17%', left: '28%' },
      scale: 0.45
    },
    {
      src: '/bobo-legendary-UNHINGED-chad-HD.png',
      alt: 'Bobo Legendary Unhinged Chad',
      rarity: 'legendary',
      rotation: -19,
      position: { bottom: '13%', right: '17%' },
      scale: 0.46
    }
  ];
}
