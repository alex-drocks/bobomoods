import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { PixelBoboService } from '../services/pixel-bobo.service';
import { Rarity, CardData, MOODS, PERSONALITIES } from '../models/types';

declare global {
  interface Window {
    html2canvas: any;
  }
}

@Component({
  selector: 'app-card-generator',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="main-container">
      <h1>BOBO MOODS GENERATOR</h1>
      <div class="subtitle">Generate 3 variants of the same rarity</div>

      <div class="rarity-selector">
        @for (rarity of rarities; track rarity) {
          <button
            class="rarity-btn {{rarity}}"
            [class.selected]="selectedRarity() === rarity"
            (click)="setRarity(rarity)">
            {{rarity.toUpperCase()}}
          </button>
        }
      </div>

      <div class="cards-container" id="cardsContainer">
        @for (card of cardData(); track card.seed; let i = $index) {
          <div class="card-wrapper">
            <div class="card {{selectedRarity()}}" id="card-{{i}}">
              <div class="rarity-badge">{{selectedRarity().toUpperCase()}}</div>

              <div class="card-header">
                <div class="card-title" id="cardTitle-{{i}}">{{card.mood}}</div>
                <div class="card-personality" id="cardId-{{i}}">{{card.personality.toUpperCase()}}</div>
              </div>

              <div class="card-art">
                <canvas
                  #canvas
                  id="boboCanvas-{{i}}"
                  width="900"
                  height="900"
                  (canvasReady)="generateBoboForCard(i)">
                </canvas>
              </div>

              <div class="card-footer">
                <div class="card-footer-content">
                  <div class="card-info">
                    <span id="cardDesc-{{i}}" class="card-desc">{{card.mood}} BOBO {{card.personality.toUpperCase()}}</span>
                  </div>
                  <div class="qr-container">
                    <img
                      id="qrImage-{{i}}"
                      src="https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=https%3A%2F%2Fbobomemes.com%2F"
                      alt="QR"
                      width="512"
                      height="512" />
                  </div>
                </div>
              </div>
            </div>

            <div class="card-controls">
              <select
                [value]="card.mood"
                (change)="updateMood(i, $event)"
                class="mood-select">
                @for (mood of moods; track mood) {
                  <option [value]="mood">{{mood}}</option>
                }
              </select>
              <select
                [value]="card.personality"
                (change)="updatePersonality(i, $event)"
                class="personality-select">
                @for (personality of personalities; track personality) {
                  <option [value]="personality">{{personality.toUpperCase()}}</option>
                }
              </select>
            </div>

            <button class="download-btn" (click)="downloadCard(i)">Download #{{i + 1}}</button>
          </div>
        }
      </div>

      <div class="main-controls">
        <button (click)="generateAllBobos()">Generate New Variants</button>
        <button (click)="downloadAllCards()">Download All 3</button>
      </div>

      <!-- Pack Cover Generator -->
      <div class="pack-cover-section">
        <h2>COVER GENERATOR</h2>
        <div class="pack-cover-container">
          <div id="packCoverContainer" class="pack-cover-wrapper">
            <canvas
              #packCanvas
              id="packCanvas"
              width="600"
              height="800">
            </canvas>
          </div>
          <div class="pack-cover-controls">
            <button (click)="generatePackCover()">Generate New Cover</button>
            <button (click)="downloadPackCover()">Download Pack Cover</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './card-generator.component.scss'
})
export class CardGeneratorComponent implements OnInit {
  private pixelBoboService = inject(PixelBoboService);

  protected readonly rarities: readonly Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
  protected readonly moods = MOODS;
  protected readonly personalities = PERSONALITIES;

  protected selectedRarity = signal<Rarity>('common');
  protected cardData = signal<CardData[]>([]);

  ngOnInit(): void {
    this.loadHtml2Canvas();
    this.generateAllBobos();
  }

  protected setRarity(rarity: Rarity): void {
    this.selectedRarity.set(rarity);
    this.generateAllBobos();
  }

  protected generateAllBobos(): void {
    const newCards: CardData[] = [];

    // Create 3 cards
    for (let i = 0; i < 3; i++) {
      const seed = Date.now() + Math.random() * 1000000 + i * 1000;
      const personality = this.personalities[Math.floor(Math.random() * this.personalities.length)];
      const mood = this.moods[Math.floor(Math.random() * this.moods.length)];

      newCards.push({
        seed,
        rarity: this.selectedRarity(),
        personality,
        mood
      });
    }

    this.cardData.set(newCards);

    // Generate bobos after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.generateAllCanvases();
    }, 100);
  }

  private generateAllCanvases(): void {
    this.cardData().forEach((_, index) => {
      this.generateBoboForCard(index);
    });
  }

  protected generateBoboForCard(index: number): void {
    const canvas = document.getElementById(`boboCanvas-${index}`) as HTMLCanvasElement;
    if (!canvas) return;

    const card = this.cardData()[index];
    if (!card) return;

    this.pixelBoboService.generateBobo(canvas, card.seed, card.rarity);
  }

  protected updateMood(index: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const mood = target.value;

    const cards = [...this.cardData()];
    cards[index] = { ...cards[index], mood };
    this.cardData.set(cards);
  }

  protected updatePersonality(index: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const personality = target.value;

    const cards = [...this.cardData()];
    cards[index] = { ...cards[index], personality };
    this.cardData.set(cards);
  }

  protected downloadCard(index: number): void {
    const card = document.getElementById(`card-${index}`);
    const data = this.cardData()[index];

    if (!card || !data) return;

    if (window.html2canvas) {
      const scaleFactor = window.devicePixelRatio || 1;

      window.html2canvas(card, {
        scale: Math.max(4, scaleFactor * 2),
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        imageTimeout: 0,
        removeContainer: false,
        onclone: (clonedDoc: Document) => {
          const clonedCanvas = clonedDoc.getElementById(`boboCanvas-${index}`) as HTMLCanvasElement;
          if (clonedCanvas) {
            const ctx = clonedCanvas.getContext('2d', { alpha: false });
            if (ctx) {
              ctx.imageSmoothingEnabled = false;
              (ctx as any).mozImageSmoothingEnabled = false;
              (ctx as any).webkitImageSmoothingEnabled = false;
              (ctx as any).msImageSmoothingEnabled = false;
            }
            clonedCanvas.style.imageRendering = 'pixelated';
            clonedCanvas.style.imageRendering = 'crisp-edges';
            clonedCanvas.style.imageRendering = '-moz-crisp-edges';
          }
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            const element = el as HTMLElement;
            element.style.imageRendering = 'pixelated';
            element.style.imageRendering = 'crisp-edges';
            (element.style as any).fontSmooth = 'never';
            (element.style as any).webkitFontSmoothing = 'none';
          });
        }
      }).then((canvas: HTMLCanvasElement) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `bobo-${data.rarity}-${data.mood}-${data.personality}-HD.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png', 1.0);
      });
    }
  }

  protected downloadAllCards(): void {
    // Download each card with a small delay to prevent browser issues
    this.cardData().forEach((_, index) => {
      setTimeout(() => {
        this.downloadCard(index);
      }, index * 500);
    });
  }

  protected generatePackCover(): void {
    // TODO: Implement pack cover generator
    console.log('Pack cover generation not implemented yet');
  }

  protected downloadPackCover(): void {
    const canvas = document.getElementById('packCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `bobo-pack-cover-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png', 1.0);
  }

  private loadHtml2Canvas(): void {
    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => {
        console.log('html2canvas loaded');
      };
      document.head.appendChild(script);
    }
  }
}
