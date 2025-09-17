import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CardData, MOODS, PERSONALITIES, Rarity } from '../models/types';
import { PixelBoboService } from '../services/pixel-bobo.service';
import { ComboBoxComponent } from './combo-box.component';

declare global {
  interface Window {
    html2canvas: any;
  }
}

@Component({
  selector: 'app-card-generator',
  imports: [CommonModule, ComboBoxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="main-container">
      <h1 class="generator-main-title">BOBO MOODS GENERATOR</h1>
      <div class="subtitle">Generate random versions using the selected rarity level.</div>

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
              <app-combo-box
                [options]="moods"
                [value]="card.mood"
                placeholder="Select or type mood..."
                (valueChange)="updateMood(i, $event)"
                class="mood-combo">
              </app-combo-box>
              <app-combo-box
                [options]="personalities"
                [value]="card.personality"
                placeholder="Select or type personality..."
                (valueChange)="updatePersonality(i, $event)"
                class="personality-combo">
              </app-combo-box>
            </div>

            <button class="download-btn" (click)="downloadCard(i)">Download #{{i + 1}}</button>
          </div>
        }
      </div>

      <div class="main-controls">
        <button class="regen-btn" (click)="generateAllBobos()">
          REGEN
        </button>
      </div>

    </div>
  `,
  styleUrl: './card-generator.component.scss'
})
export class CardGeneratorComponent implements OnInit, OnDestroy {
  private pixelBoboService = inject(PixelBoboService);
  private resizeHandler?: () => void;

  protected readonly rarities: readonly Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
  protected readonly moods = MOODS;
  protected readonly personalities = PERSONALITIES;

  protected selectedRarity = signal<Rarity>('rare');
  protected cardData = signal<CardData[]>([]);

  ngOnInit(): void {
    this.loadHtml2Canvas();
    this.generateAllBobos();

    // Listen for window resize to adjust card count
    this.resizeHandler = () => {
      const currentCardCount = this.cardData().length;
      const expectedCardCount = this.isMobile() ? 1 : 3;

      if (currentCardCount !== expectedCardCount) {
        this.generateAllBobos();
      }
    };

    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  protected setRarity(rarity: Rarity): void {
    this.selectedRarity.set(rarity);
    this.generateAllBobos();
  }

  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  protected generateAllBobos(): void {
    const newCards: CardData[] = [];

    // Create 1 card on mobile, 3 cards on desktop
    const cardCount = this.isMobile() ? 1 : 3;
    for (let i = 0; i < cardCount; i++) {
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

  protected updateMood(index: number, mood: string): void {
    const cards = [...this.cardData()];
    cards[index] = { ...cards[index], mood };
    this.cardData.set(cards);
  }

  protected updatePersonality(index: number, personality: string): void {
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
