import { Injectable } from '@angular/core';
import { Rarity, PALETTES } from '../models/types';

@Injectable({ providedIn: 'root' })
export class PixelBoboService {
  private pixelSize = 9;

  generateBobo(canvas: HTMLCanvasElement, seed: number, rarity: Rarity): void {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    this.setupCanvasRendering(ctx);
    const random = this.seededRandom(seed);
    this.clear(ctx, canvas);
    const palette = PALETTES[rarity];

    // Enhanced background patterns
    this.drawBackground(ctx, canvas, palette, rarity, random);

    // Add aura for higher rarities
    if (rarity === 'legendary' || rarity === 'mythic') {
      this.drawAura(ctx, 50, 50, rarity, random);
    }

    // Generate unique bear shape
    const bearColor = palette.bear[Math.floor(random() * palette.bear.length)];

    // Head parameters
    const headWidth = 65 + Math.floor(random() * 20);
    const headHeight = 55 + Math.floor(random() * 15);
    const headX = 50 - headWidth / 2;
    const headY = 18;

    // Body
    const bodyWidth = headWidth - 5;
    const bodyHeight = 48;
    const bodyY = headY + headHeight - 10;

    // Draw body
    this.drawEllipse(ctx, 50 - bodyWidth / 2, bodyY, bodyWidth, bodyHeight, bearColor);

    // Add subtle arm indications
    const armStyle = Math.floor(random() * 3);
    this.drawArms(ctx, 50, bodyY, bodyWidth, bodyHeight, bearColor, armStyle);

    // Add body accessories
    if (random() > 0.5 && rarity !== 'common') {
      this.addBodyAccessory(ctx, 50 - bodyWidth / 2, bodyY, bodyWidth, bodyHeight, rarity, random);
    }

    // Feet with more variations
    this.drawFeet(ctx, 50, bodyY, bodyWidth, bodyHeight, bearColor, rarity, random);

    // Draw head
    this.drawEllipse(ctx, headX, headY, headWidth, headHeight, bearColor);

    // ALWAYS draw ears - they're essential for a bear!
    this.drawEars(ctx, headX, headY, headWidth, headHeight, bearColor, palette, random);

    // Fur patches
    if (random() > 0.7) {
      this.addFurPatches(ctx, headX, headY, headWidth, headHeight, palette, random);
    }

    // Draw facial features
    this.drawFacialFeatures(ctx, headX, headY, headWidth, headHeight, rarity, palette, random);

    // Head accessories
    if (rarity !== 'common' && random() > 0.3) {
      this.addHeadAccessory(ctx, headX, headY, headWidth, headHeight, rarity, random);
    }

    // Special effects based on rarity
    this.addRarityEffects(ctx, canvas, rarity, headX, headY, headWidth, headHeight, bodyY, bodyWidth, bodyHeight, random);
  }

  private setupCanvasRendering(ctx: CanvasRenderingContext2D): void {
    ctx.imageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;
  }

  private seededRandom(seed: number): () => number {
    let s = seed;
    return function () {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  private clear(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
  }

  private drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, palette: any, rarity: Rarity, random: () => number): void {
    // Base pattern
    for (let i = 0; i < 100; i += 10) {
      for (let j = 0; j < 100; j += 10) {
        if (random() > 0.7) {
          const bgColor = palette.background[Math.floor(random() * palette.background.length)];
          ctx.fillStyle = bgColor;
          ctx.fillRect(i * this.pixelSize, j * this.pixelSize, 10 * this.pixelSize, 10 * this.pixelSize);
        }
      }
    }

    // Additional patterns for higher rarities
    if (rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic') {
      for (let i = 0; i < 20; i++) {
        const x = Math.floor(random() * 100);
        const y = Math.floor(random() * 100);
        const size = 2 + Math.floor(random() * 3);
        const color = palette.accent[Math.floor(random() * palette.accent.length)];
        this.drawStar(ctx, x, y, size, color);
      }
    }
  }

  private drawAura(ctx: CanvasRenderingContext2D, x: number, y: number, rarity: Rarity, random: () => number): void {
    const colors = rarity === 'legendary' ?
      ['#FFD70033', '#FFC70033', '#FFE70033'] :
      ['#00FFFF33', '#00EFEF33', '#FF00FF33'];

    for (let r = 45; r > 30; r -= 3) {
      const color = colors[Math.floor(random() * colors.length)];
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (px >= 0 && px < 100 && py >= 0 && py < 100) {
          if (random() > 0.5) {
            this.drawPixel(ctx, Math.floor(px), Math.floor(py), color);
          }
        }
      }
    }
  }

  private drawArms(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bodyHeight: number, bearColor: string, armStyle: number): void {
    if (armStyle === 1) {
      // Small paw circles at sides
      this.drawCircle(ctx, centerX - bodyWidth / 2 - 2, bodyY + bodyHeight / 2, 4, bearColor);
      this.drawCircle(ctx, centerX + bodyWidth / 2 + 2, bodyY + bodyHeight / 2, 4, bearColor);
    } else if (armStyle === 2) {
      // Very small arm nubs
      for (let i = 0; i < 6; i++) {
        this.drawPixel(ctx, centerX - bodyWidth / 2 - 1, bodyY + 15 + i, bearColor);
        this.drawPixel(ctx, centerX - bodyWidth / 2 - 2, bodyY + 15 + i, bearColor);
        this.drawPixel(ctx, centerX + bodyWidth / 2 + 1, bodyY + 15 + i, bearColor);
        this.drawPixel(ctx, centerX + bodyWidth / 2 + 2, bodyY + 15 + i, bearColor);
      }
    }
  }

  private drawFeet(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bodyHeight: number, bearColor: string, rarity: Rarity, random: () => number): void {
    const feetType = Math.floor(random() * 4);
    const feetY = bodyY + bodyHeight - 8;

    if (feetType > 0) {
      const leftFootX = centerX - bodyWidth / 4;
      const rightFootX = centerX + bodyWidth / 4;

      // Different foot styles
      if (feetType === 1) { // Regular feet
        this.drawEllipse(ctx, leftFootX - 5, feetY, 12, 10, bearColor);
        this.drawEllipse(ctx, rightFootX - 5, feetY, 12, 10, bearColor);
      } else if (feetType === 2) { // Shoes
        const shoeColor = ['#000', '#FF0000', '#0000FF', '#FFFFFF'][Math.floor(random() * 4)];
        this.drawEllipse(ctx, leftFootX - 6, feetY, 14, 12, shoeColor);
        this.drawEllipse(ctx, rightFootX - 6, feetY, 14, 12, shoeColor);
        // Shoe details
        for (let i = 0; i < 3; i++) {
          this.drawPixel(ctx, leftFootX - 3 + i * 2, feetY + 4, '#FFF');
          this.drawPixel(ctx, rightFootX - 3 + i * 2, feetY + 4, '#FFF');
        }
      } else { // Socks
        const sockColor = ['#FFF', '#000', '#FF69B4'][Math.floor(random() * 3)];
        this.drawEllipse(ctx, leftFootX - 5, feetY - 3, 12, 15, sockColor);
        this.drawEllipse(ctx, rightFootX - 5, feetY - 3, 12, 15, sockColor);
        // Sock stripes
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 10; j++) {
            this.drawPixel(ctx, leftFootX - 4 + j, feetY - 2 + i * 3, bearColor);
            this.drawPixel(ctx, rightFootX - 4 + j, feetY - 2 + i * 3, bearColor);
          }
        }
      }

      // Toe beans for legendary/mythic
      if ((rarity === 'legendary' || rarity === 'mythic') && feetType === 1) {
        this.drawCircle(ctx, leftFootX, feetY + 3, 2, '#4a3c28');
        this.drawCircle(ctx, rightFootX, feetY + 3, 2, '#4a3c28');
      }
    }
  }

  private drawEars(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, bearColor: string, palette: any, random: () => number): void {
    const earType = Math.floor(random() * 4);
    const earOffset = 13 + Math.floor(random() * 8);
    const earSize = 11 + Math.floor(random() * 5);

    // Always draw base ears first
    this.drawCircle(ctx, headX + earOffset, headY + 6, earSize, bearColor);
    this.drawCircle(ctx, headX + headWidth - earOffset, headY + 6, earSize, bearColor);

    // Then add ear variations/details
    if (earType === 0) { // Round ears with inner ear
      this.drawCircle(ctx, headX + earOffset, headY + 6, earSize - 4, '#D2B48C');
      this.drawCircle(ctx, headX + headWidth - earOffset, headY + 6, earSize - 4, '#D2B48C');
    } else if (earType === 1) { // Inner ear detail
      this.drawCircle(ctx, headX + earOffset, headY + 6, earSize - 4, '#FFB6C1');
      this.drawCircle(ctx, headX + headWidth - earOffset, headY + 6, earSize - 4, '#FFB6C1');
    } else if (earType === 2) { // Dark inner ears
      this.drawCircle(ctx, headX + earOffset, headY + 6, earSize - 4, '#4B2F20');
      this.drawCircle(ctx, headX + headWidth - earOffset, headY + 6, earSize - 4, '#4B2F20');
    } else { // Pierced ears with inner ear
      this.drawCircle(ctx, headX + earOffset, headY + 6, earSize - 4, '#D2B48C');
      this.drawCircle(ctx, headX + headWidth - earOffset, headY + 6, earSize - 4, '#D2B48C');
      // Earrings
      const earringColor = palette.accent[0];
      this.drawPixel(ctx, headX + earOffset, headY + 10, earringColor);
      this.drawPixel(ctx, headX + earOffset, headY + 11, earringColor);
      this.drawPixel(ctx, headX + earOffset, headY + 12, earringColor);
      this.drawPixel(ctx, headX + headWidth - earOffset, headY + 10, earringColor);
      this.drawPixel(ctx, headX + headWidth - earOffset, headY + 11, earringColor);
      this.drawPixel(ctx, headX + headWidth - earOffset, headY + 12, earringColor);
    }
  }

  private drawFacialFeatures(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, rarity: Rarity, palette: any, random: () => number): void {
    // Eyebrows
    const eyebrowType = Math.floor(random() * 5);
    this.drawEyebrows(ctx, headX + 20, headY + 18, headX + headWidth - 20, headY + 18, eyebrowType);

    // Eyes with more variations
    const eyeType = Math.floor(random() * 8);
    const eyeY = headY + 22;
    this.drawEyes(ctx, headX + 20, eyeY, headX + headWidth - 20, eyeY, eyeType);

    // Snout with variations
    const snoutWidth = 24 + Math.floor(random() * 8);
    const snoutHeight = 16 + Math.floor(random() * 5);
    const snoutColor = random() > 0.8 ? palette.bear[1] : '#6B5637';
    this.drawEllipse(ctx, 50 - snoutWidth / 2, headY + 38, snoutWidth, snoutHeight, snoutColor);

    // Nose variations
    this.drawNose(ctx, 50, headY + 42, Math.floor(random() * 4));

    // Mouth with more expressions
    const mouthType = Math.floor(random() * 7);
    this.drawMouth(ctx, 50, headY + 48, mouthType);
  }

  private drawEyebrows(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, type: number): void {
    if (type === 0) { // Worried
      for (let i = 0; i < 6; i++) {
        this.drawPixel(ctx, x1 + i, y1 - i / 3, '#000');
        this.drawPixel(ctx, x2 + 6 - i, y2 - i / 3, '#000');
      }
    } else if (type === 1) { // Angry
      for (let i = 0; i < 6; i++) {
        this.drawPixel(ctx, x1 + i, y1 + i / 3, '#000');
        this.drawPixel(ctx, x2 + 6 - i, y2 + i / 3, '#000');
      }
    } else if (type === 2) { // Thick
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 7; i++) {
          this.drawPixel(ctx, x1 + i, y1 + j, '#000');
          this.drawPixel(ctx, x2 + i, y2 + j, '#000');
        }
      }
    } else if (type === 3) { // Unibrow
      for (let i = x1; i <= x2 + 7; i++) {
        this.drawPixel(ctx, i, y1, '#000');
        if (Math.random() > 0.7) this.drawPixel(ctx, i, y1 + 1, '#000');
      }
    }
  }

  private drawEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, type: number): void {
    const eyeDrawers = [
      () => this.drawDroopyEyes(ctx, x1, y1, x2, y2),
      () => this.drawTiredEyes(ctx, x1, y1, x2, y2),
      () => this.drawDeadEyes(ctx, x1, y1, x2, y2),
      () => this.drawWorriedEyes(ctx, x1, y1, x2, y2),
      () => this.drawSpiralEyes(ctx, x1, y1, x2, y2),
      () => this.drawHeartEyes(ctx, x1, y1, x2, y2),
      () => this.drawDollarEyes(ctx, x1, y1, x2, y2),
      () => this.drawWinkingEyes(ctx, x1, y1, x2, y2)
    ];

    eyeDrawers[type]?.();
  }

  private drawBasicEye(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string): void {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        this.drawPixel(ctx, x + i, y + j, color);
      }
    }
  }

  private drawDroopyEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    // Draw base eye shape for both eyes
    this.drawBasicEye(ctx, x1, y1, 8, 3, '#FFF');
    this.drawBasicEye(ctx, x2, y2, 8, 3, '#FFF');

    // Draw pupils
    this.drawCircle(ctx, x1 + 3, y1 + 2, 2, '#000');
    this.drawCircle(ctx, x2 + 3, y2 + 2, 2, '#000');

    // Highlight
    this.drawPixel(ctx, x1 + 4, y1 + 1, '#FFF');
    this.drawPixel(ctx, x2 + 4, y2 + 1, '#FFF');

    // Eye bags
    for (let i = 0; i < 6; i++) {
      this.drawPixel(ctx, x1 + i, y1 + 4, '#4a3c28');
      this.drawPixel(ctx, x2 + i, y2 + 4, '#4a3c28');
    }
  }

  private drawTiredEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    // Draw closed eyes
    this.drawBasicEye(ctx, x1, y1, 7, 2, '#000');
    this.drawBasicEye(ctx, x2, y2, 7, 2, '#000');

    // Eye bags
    for (let i = 0; i < 6; i++) {
      this.drawPixel(ctx, x1 + i, y1 + 4, '#4a3c28');
      this.drawPixel(ctx, x2 + i, y2 + 4, '#4a3c28');
    }
  }

  private drawDeadEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    // X eyes
    for (let i = 0; i < 5; i++) {
      this.drawPixel(ctx, x1 + i, y1 + i, '#000');
      this.drawPixel(ctx, x1 + i, y1 + 4 - i, '#000');
      this.drawPixel(ctx, x2 + i, y2 + i, '#000');
      this.drawPixel(ctx, x2 + i, y2 + 4 - i, '#000');
    }
  }

  private drawWorriedEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    this.drawCircle(ctx, x1 + 4, y1 + 1, 4, '#FFF');
    this.drawCircle(ctx, x2 + 4, y2 + 1, 4, '#FFF');
    this.drawCircle(ctx, x1 + 4, y1 + 1, 2, '#000');
    this.drawCircle(ctx, x2 + 4, y2 + 1, 2, '#000');

    // Highlight
    this.drawPixel(ctx, x1 + 5, y1, '#FFF');
    this.drawPixel(ctx, x2 + 5, y2, '#FFF');
  }

  private drawSpiralEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    // Spiral pattern
    const spiralPattern: [number, number][] = [
      [2, 2], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4]
    ];
    spiralPattern.forEach(([dx, dy]) => {
      this.drawPixel(ctx, x1 + dx, y1 + dy, '#000');
      this.drawPixel(ctx, x2 + dx, y2 + dy, '#000');
    });
  }

  private drawHeartEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    const heartColor = '#FF1493';
    const positions = [x1, x2];
    const yPositions = [y1, y2];

    positions.forEach((x, index) => {
      const y = yPositions[index];
      // Heart shape pattern
      this.drawPixel(ctx, x + 2, y, heartColor);
      this.drawPixel(ctx, x + 3, y, heartColor);
      this.drawPixel(ctx, x + 5, y, heartColor);
      this.drawPixel(ctx, x + 6, y, heartColor);

      for (let i = 1; i < 7; i++) {
        this.drawPixel(ctx, x + i, y + 1, heartColor);
      }
      for (let i = 2; i < 6; i++) {
        this.drawPixel(ctx, x + i, y + 2, heartColor);
      }
      this.drawPixel(ctx, x + 3, y + 3, heartColor);
      this.drawPixel(ctx, x + 4, y + 3, heartColor);
    });
  }

  private drawDollarEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    const dollarColor = '#00FF00';
    const positions = [x1, x2];
    const yPositions = [y1, y2];

    positions.forEach((x, index) => {
      const y = yPositions[index];
      // $ shape simplified
      for (let i = 0; i < 5; i++) {
        this.drawPixel(ctx, x + 3, y + i, dollarColor);
      }
      [0, 2, 4].forEach(offset => {
        this.drawPixel(ctx, x + 2, y + offset, dollarColor);
        this.drawPixel(ctx, x + 4, y + offset, dollarColor);
      });
    });
  }

  private drawWinkingEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    // Left eye winking
    for (let i = 0; i < 7; i++) {
      this.drawPixel(ctx, x1 + i, y1 + 1, '#000');
    }
    // Right eye open
    this.drawCircle(ctx, x2 + 4, y2 + 1, 4, '#FFF');
    this.drawCircle(ctx, x2 + 4, y2 + 1, 2, '#000');
  }

  private drawNose(ctx: CanvasRenderingContext2D, x: number, y: number, type: number): void {
    if (type === 0) { // Triangle nose
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j <= i; j++) {
          this.drawPixel(ctx, x - i / 2 + j, y + i / 2, '#000');
        }
      }
    } else if (type === 1) { // Round nose
      this.drawCircle(ctx, x, y + 1, 3, '#000');
      this.drawPixel(ctx, x, y, '#FFF');
    } else if (type === 2) { // Cat nose
      this.drawPixel(ctx, x - 1, y, '#FFB6C1');
      this.drawPixel(ctx, x, y, '#FFB6C1');
      this.drawPixel(ctx, x + 1, y, '#FFB6C1');
      this.drawPixel(ctx, x - 2, y + 1, '#FFB6C1');
      this.drawPixel(ctx, x - 1, y + 1, '#FFB6C1');
      this.drawPixel(ctx, x, y + 1, '#FFB6C1');
      this.drawPixel(ctx, x + 1, y + 1, '#FFB6C1');
      this.drawPixel(ctx, x + 2, y + 1, '#FFB6C1');
      this.drawPixel(ctx, x, y + 2, '#FFB6C1');
    } else { // Classic wide nose
      for (let i = -4; i <= 4; i++) {
        for (let j = 0; j < 3; j++) {
          if (Math.abs(i) + j < 5) {
            this.drawPixel(ctx, x + i, y + j, '#000');
          }
        }
      }
    }
  }

  private drawMouth(ctx: CanvasRenderingContext2D, x: number, y: number, type: number): void {
    const mouthDrawers = [
      () => this.drawFrown(ctx, x, y),
      () => this.drawNeutralMouth(ctx, x, y),
      () => this.drawIronicSmile(ctx, x, y),
      () => this.drawNeutralMouth(ctx, x, y) // Default case
    ];

    mouthDrawers[type] || mouthDrawers[3]();
  }

  private drawMouthLine(ctx: CanvasRenderingContext2D, x: number, y: number, pattern: Array<{dx: number, dy: number}>): void {
    pattern.forEach(({dx, dy}) => {
      this.drawPixel(ctx, x + dx, y + dy, '#000');
    });
  }

  private drawFrown(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const frown = [
      {dx: -6, dy: 0}, {dx: -5, dy: 1}, {dx: -4, dy: 2}, {dx: -3, dy: 2},
      {dx: -2, dy: 2}, {dx: -1, dy: 2}, {dx: 0, dy: 2}, {dx: 1, dy: 2},
      {dx: 2, dy: 2}, {dx: 3, dy: 2}, {dx: 4, dy: 2}, {dx: 5, dy: 1}, {dx: 6, dy: 0}
    ];
    this.drawMouthLine(ctx, x, y, frown);
  }

  private drawNeutralMouth(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    for (let i = -6; i <= 6; i++) {
      this.drawPixel(ctx, x + i, y, '#000');
    }
  }

  private drawIronicSmile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const smile = [
      {dx: -6, dy: 2}, {dx: -5, dy: 1}, {dx: -4, dy: 0}, {dx: -3, dy: 0},
      {dx: -2, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 0}, {dx: 1, dy: 0},
      {dx: 2, dy: 0}, {dx: 3, dy: 0}, {dx: 4, dy: 0}, {dx: 5, dy: 1}, {dx: 6, dy: 2}
    ];
    this.drawMouthLine(ctx, x, y, smile);
  }

  private addFurPatches(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, palette: any, random: () => number): void {
    const patchCount = 2 + Math.floor(random() * 3);
    for (let p = 0; p < patchCount; p++) {
      const patchX = headX + 10 + Math.floor(random() * (headWidth - 20));
      const patchY = headY + 10 + Math.floor(random() * (headHeight - 20));
      const patchSize = 5 + Math.floor(random() * 8);
      const patchColor = palette.bear[Math.floor(random() * palette.bear.length)];

      for (let i = 0; i < patchSize; i++) {
        for (let j = 0; j < patchSize; j++) {
          if (random() > 0.3) {
            this.drawPixel(ctx, patchX + i, patchY + j, patchColor);
          }
        }
      }
    }
  }

  private addBodyAccessory(ctx: CanvasRenderingContext2D, bodyX: number, bodyY: number, bodyWidth: number, bodyHeight: number, rarity: Rarity, random: () => number): void {
    // Simplified body accessories - just draw a chain necklace for now
    const chainY = bodyY + 5;
    const chainColor = rarity === 'legendary' ? '#FFD700' : '#C0C0C0';
    for (let i = 10; i < bodyWidth - 10; i += 3) {
      this.drawPixel(ctx, bodyX + i, chainY, chainColor);
      this.drawPixel(ctx, bodyX + i, chainY + 1, chainColor);
    }
  }

  private addHeadAccessory(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, rarity: Rarity, random: () => number): void {
    const accessoryType = Math.floor(random() * 3);

    if (accessoryType === 0 && (rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic')) { // Crown
      const crownColor = rarity === 'legendary' ? '#FFD700' : (rarity === 'mythic' ? '#00FFFF' : '#C77DFF');
      for (let i = 0; i < 5; i++) {
        const peakX = headX + headWidth / 2 - 12 + i * 6;
        for (let j = 0; j < 8; j++) {
          this.drawPixel(ctx, peakX, headY - 8 + j, crownColor);
          this.drawPixel(ctx, peakX + 1, headY - 8 + j, crownColor);
        }
        // Jewels
        this.drawPixel(ctx, peakX, headY - 6, '#FF0000');
      }
    }
  }

  private addRarityEffects(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, rarity: Rarity, headX: number, headY: number, headWidth: number, headHeight: number, bodyY: number, bodyWidth: number, bodyHeight: number, random: () => number): void {
    if (rarity === 'mythic') {
      this.addGlitchEffect(ctx, random);
      this.addRainbowTrail(ctx, random);
      // Add bling chains with 20% probability
      if (random() < 0.2) {
        this.addMythicBlingChain(ctx, headX, headY, headWidth, headHeight, bodyY, bodyWidth, bodyHeight, random);
      }
    } else if (rarity === 'legendary') {
      this.addSparkles(ctx, random);
      this.addGoldDust(ctx, random);
    } else if (rarity === 'epic') {
      this.addMagicParticles(ctx, random);
    } else if (rarity === 'rare') {
      this.addSnowEffect(ctx, random);
    }
  }

  private addMythicBlingChain(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, bodyY: number, bodyWidth: number, bodyHeight: number, random: () => number): void {
    const chainType = Math.floor(random() * 2); // Simplified to 2 types for now
    const neckY = bodyY + 5;
    const chestCenterX = 50;
    const chestTopY = neckY + 8;

    if (chainType === 0) { // Cuban link chain
      this.drawCubanChain(ctx, chestCenterX, chestTopY, bodyWidth, random);
    } else { // Tennis chain
      this.drawTennisChain(ctx, chestCenterX, chestTopY, bodyWidth, random);
    }
  }

  private drawCubanChain(ctx: CanvasRenderingContext2D, centerX: number, chestY: number, bodyWidth: number, random: () => number): void {
    const chainY = chestY;
    const chainSpread = Math.min(bodyWidth * 0.8, 60);

    // Thick cuban links
    for (let i = -chainSpread / 2; i <= chainSpread / 2; i += 4) {
      const x = centerX + i;
      const y = chainY + Math.sin(i * 0.2) * 2;

      // Gold base
      for (let dx = 0; dx < 3; dx++) {
        for (let dy = 0; dy < 3; dy++) {
          this.drawPixel(ctx, x + dx, y + dy, '#FFD700');
        }
      }
      // Diamond studs
      if (i % 8 === 0) {
        this.drawPixel(ctx, x + 1, y + 1, '#FFFFFF');
        this.drawPixel(ctx, x + 1, y, '#87CEEB');
      }
    }

    // Center medallion
    for (let i = -4; i <= 4; i++) {
      for (let j = 0; j <= 6; j++) {
        if (Math.abs(i) + j <= 6) {
          this.drawPixel(ctx, centerX + i, chainY + 6 + j, '#FFD700');
        }
      }
    }
    // Diamond in center
    this.drawPixel(ctx, centerX, chainY + 9, '#00FFFF');
    this.drawPixel(ctx, centerX - 1, chainY + 8, '#00FFFF');
    this.drawPixel(ctx, centerX + 1, chainY + 8, '#00FFFF');
    this.drawPixel(ctx, centerX, chainY + 7, '#00FFFF');
  }

  private drawTennisChain(ctx: CanvasRenderingContext2D, centerX: number, chestY: number, bodyWidth: number, random: () => number): void {
    const chainY = chestY;
    const chainSpread = Math.min(bodyWidth * 0.85, 64);

    // All diamonds
    for (let i = -chainSpread / 2; i <= chainSpread / 2; i += 2) {
      const x = centerX + i;
      const y = chainY + Math.sin(i * 0.15) * 1.5;

      // Alternating diamond colors for that icy look
      const colors = ['#FFFFFF', '#00FFFF', '#E0FFFF'];
      const color = colors[Math.abs(i / 2) % colors.length];

      this.drawPixel(ctx, x, y, color);
      this.drawPixel(ctx, x + 1, y, color);
      this.drawPixel(ctx, x, y + 1, color);
      this.drawPixel(ctx, x + 1, y + 1, color);

      // Sparkle effect
      if (i % 6 === 0) {
        this.drawPixel(ctx, x - 1, y, '#FFFFFF');
        this.drawPixel(ctx, x + 2, y, '#FFFFFF');
        this.drawPixel(ctx, x, y - 1, '#FFFFFF');
        this.drawPixel(ctx, x, y + 2, '#FFFFFF');
      }
    }
  }

  private addGlitchEffect(ctx: CanvasRenderingContext2D, random: () => number): void {
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(random() * 100);
      const y = Math.floor(random() * 100);
      const color = ['#00FF00', '#FF00FF', '#00FFFF'][Math.floor(random() * 3)];
      this.drawPixel(ctx, x, y, color);

      // Glitch lines
      if (random() > 0.7) {
        const lineLength = 5 + Math.floor(random() * 10);
        for (let j = 0; j < lineLength; j++) {
          if (x + j < 100) {
            this.drawPixel(ctx, x + j, y, color);
          }
        }
      }
    }
  }

  private addRainbowTrail(ctx: CanvasRenderingContext2D, random: () => number): void {
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    for (let i = 0; i < 15; i++) {
      const x = 20 + Math.floor(random() * 60);
      const y = 70 + Math.floor(random() * 25);
      const color = colors[i % colors.length];
      for (let j = 0; j < 3; j++) {
        this.drawPixel(ctx, x + j, y, color + '66');
      }
    }
  }

  private addSparkles(ctx: CanvasRenderingContext2D, random: () => number): void {
    for (let i = 0; i < 25; i++) {
      const x = Math.floor(random() * 100);
      const y = Math.floor(random() * 100);
      this.drawPixel(ctx, x, y, '#FFD700');
      if (random() > 0.5) {
        this.drawPixel(ctx, x + 1, y, '#FFF');
        this.drawPixel(ctx, x - 1, y, '#FFF');
        this.drawPixel(ctx, x, y + 1, '#FFF');
        this.drawPixel(ctx, x, y - 1, '#FFF');
      }
    }
  }

  private addGoldDust(ctx: CanvasRenderingContext2D, random: () => number): void {
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(random() * 100);
      const y = Math.floor(random() * 100);
      const goldShade = ['#FFD700', '#FFC700', '#FFE700'][Math.floor(random() * 3)];
      this.drawPixel(ctx, x, y, goldShade + '99');
    }
  }

  private addMagicParticles(ctx: CanvasRenderingContext2D, random: () => number): void {
    const particleColor = '#B565D9';
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(random() * 100);
      const y = Math.floor(random() * 100);
      this.drawCircle(ctx, x, y, 1, particleColor + '66');

      // Trailing effect
      if (random() > 0.5) {
        for (let j = 1; j < 4; j++) {
          if (y + j < 100) {
            this.drawPixel(ctx, x, y + j, particleColor + '33');
          }
        }
      }
    }
  }

  private addSnowEffect(ctx: CanvasRenderingContext2D, random: () => number): void {
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(random() * 100);
      const y = Math.floor(random() * 100);
      this.drawPixel(ctx, x, y, '#FFFFFF');
      if (random() > 0.7) {
        this.drawPixel(ctx, x + 1, y, '#FFFFFF99');
        this.drawPixel(ctx, x, y + 1, '#FFFFFF99');
      }
    }
  }

  private drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string): void {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const dx = (i - width / 2) / (width / 2);
        const dy = (j - height / 2) / (height / 2);
        if (dx * dx + dy * dy <= 1) {
          this.drawPixel(ctx, x + i, y + j, color);
        }
      }
    }
  }

  private drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        if (i * i + j * j <= radius * radius) {
          this.drawPixel(ctx, x + i, y + j, color);
        }
      }
    }
  }

  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
    this.drawPixel(ctx, x, y - size, color);
    this.drawPixel(ctx, x - 1, y, color);
    this.drawPixel(ctx, x, y, color);
    this.drawPixel(ctx, x + 1, y, color);
    this.drawPixel(ctx, x, y + size, color);

    if (size > 2) {
      this.drawPixel(ctx, x - size, y, color);
      this.drawPixel(ctx, x + size, y, color);
    }
  }
}
