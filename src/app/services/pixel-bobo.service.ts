import { Injectable } from '@angular/core';
import { Rarity, PALETTES } from '../models/types';

@Injectable({ providedIn: 'root' })
export class PixelBoboService {
  private readonly pixelSize = 9;

  // Constants for better maintainability
  private static readonly CANVAS_SIZE = 100;
  private static readonly BACKGROUND_PATTERN_SIZE = 10;
  private static readonly BACKGROUND_THRESHOLD = 0.7;
  private static readonly STAR_COUNT = 20;
  private static readonly AURA_INNER_RADIUS = 30;
  private static readonly AURA_OUTER_RADIUS = 45;

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
    for (let i = 0; i < PixelBoboService.CANVAS_SIZE; i += PixelBoboService.BACKGROUND_PATTERN_SIZE) {
      for (let j = 0; j < PixelBoboService.CANVAS_SIZE; j += PixelBoboService.BACKGROUND_PATTERN_SIZE) {
        if (random() > PixelBoboService.BACKGROUND_THRESHOLD) {
          const bgColor = this.getRandomArrayItem(palette.background, random) as string;
          ctx.fillStyle = bgColor;
          ctx.fillRect(
            i * this.pixelSize,
            j * this.pixelSize,
            PixelBoboService.BACKGROUND_PATTERN_SIZE * this.pixelSize,
            PixelBoboService.BACKGROUND_PATTERN_SIZE * this.pixelSize
          );
        }
      }
    }

    // Additional patterns for higher rarities
    if (this.isHighRarity(rarity)) {
      this.addBackgroundStars(ctx, palette, random);
    }
  }

  private isHighRarity(rarity: Rarity): boolean {
    return ['epic', 'legendary', 'mythic'].includes(rarity);
  }

  private addBackgroundStars(ctx: CanvasRenderingContext2D, palette: any, random: () => number): void {
    for (let i = 0; i < PixelBoboService.STAR_COUNT; i++) {
      const x = Math.floor(random() * PixelBoboService.CANVAS_SIZE);
      const y = Math.floor(random() * PixelBoboService.CANVAS_SIZE);
      const size = 2 + Math.floor(random() * 3);
      const color = this.getRandomArrayItem(palette.accent, random) as string;
      this.drawStar(ctx, x, y, size, color);
    }
  }

  private getRandomArrayItem<T>(array: T[], random: () => number): T {
    return array[Math.floor(random() * array.length)];
  }

  private drawAura(ctx: CanvasRenderingContext2D, x: number, y: number, rarity: Rarity, random: () => number): void {
    const colors = rarity === 'legendary' ?
      ['#FFD70033', '#FFC70033', '#FFE70033'] :
      ['#00FFFF33', '#00EFEF33', '#FF00FF33'];

    for (let r = PixelBoboService.AURA_OUTER_RADIUS; r > PixelBoboService.AURA_INNER_RADIUS; r -= 3) {
      const color = colors[Math.floor(random() * colors.length)];
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (px >= 0 && px < PixelBoboService.CANVAS_SIZE && py >= 0 && py < PixelBoboService.CANVAS_SIZE) {
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
    const leftEarX = headX + earOffset;
    const rightEarX = headX + headWidth - earOffset;
    const earY = headY + 6;

    // Always draw base ears first
    this.drawCircle(ctx, leftEarX, earY, earSize, bearColor);
    this.drawCircle(ctx, rightEarX, earY, earSize, bearColor);

    // Then add ear variations/details
    this.drawEarDetails(ctx, leftEarX, rightEarX, earY, earSize, earType, palette);
  }

  private drawEarDetails(ctx: CanvasRenderingContext2D, leftEarX: number, rightEarX: number, earY: number, earSize: number, earType: number, palette: any): void {
    const innerEarColors = ['#D2B48C', '#FFB6C1', '#4B2F20'];

    if (earType < 3) {
      const innerColor = innerEarColors[earType];
      this.drawCircle(ctx, leftEarX, earY, earSize - 4, innerColor);
      this.drawCircle(ctx, rightEarX, earY, earSize - 4, innerColor);
    } else {
      // Pierced ears with inner ear
      this.drawCircle(ctx, leftEarX, earY, earSize - 4, '#D2B48C');
      this.drawCircle(ctx, rightEarX, earY, earSize - 4, '#D2B48C');
      // Earrings
      this.drawEarrings(ctx, leftEarX, rightEarX, earY, palette.accent[0]);
    }
  }

  private drawEarrings(ctx: CanvasRenderingContext2D, leftEarX: number, rightEarX: number, earY: number, earringColor: string): void {
    const earringPositions = [
      { x: leftEarX, y: earY + 10 },
      { x: leftEarX, y: earY + 11 },
      { x: leftEarX, y: earY + 12 },
      { x: rightEarX, y: earY + 10 },
      { x: rightEarX, y: earY + 11 },
      { x: rightEarX, y: earY + 12 }
    ];

    earringPositions.forEach(pos => {
      this.drawPixel(ctx, pos.x, pos.y, earringColor);
    });
  }

  private drawFacialFeatures(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, rarity: Rarity, palette: any, random: () => number): void {
    // Eyebrows
    const eyebrowType = Math.floor(random() * 5);
    this.drawEyebrows(ctx, headX + 20, headY + 18, headX + headWidth - 20, headY + 18, eyebrowType);

    // Eyes with more variations
    const eyeType = Math.floor(random() * 8);
    const eyeY = headY + 22;
    this.drawEyes(ctx, headX + 20, eyeY, headX + headWidth - 20, eyeY, eyeType);

    // Add eye accessories (glasses, monocle, etc.)
    if (random() > 0.7) {
      this.addEyeAccessory(ctx, headX, headY, headWidth, headHeight, random);
    }

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

    // Additional facial features
    if (random() > 0.6) {
      this.addFacialFeature(ctx, headX, headY, headWidth, headHeight, rarity, random);
    }
  }

  private addEyeAccessory(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, random: () => number): void {
    const accessoryType = Math.floor(random() * 4);

    if (accessoryType === 0) { // Sunglasses
      const glassY = headY + 22;
      for (let i = 0; i < 12; i++) {
        this.drawPixel(ctx, headX + 18 + i, glassY, '#000');
        this.drawPixel(ctx, headX + 18 + i, glassY + 1, '#000');
        this.drawPixel(ctx, headX + headWidth - 30 + i, glassY, '#000');
        this.drawPixel(ctx, headX + headWidth - 30 + i, glassY + 1, '#000');
      }
      for (let i = 30; i < headWidth - 30; i++) {
        if (i % 2 === 0) this.drawPixel(ctx, headX + i, glassY - 1, '#000');
      }
    } else if (accessoryType === 1) { // Monocle
      const monocleX = headX + headWidth - 25;
      const monocleY = headY + 22;
      for (let i = 0; i < 10; i++) {
        this.drawPixel(ctx, monocleX + i, monocleY - 2, '#FFD700');
        this.drawPixel(ctx, monocleX + i, monocleY + 5, '#FFD700');
      }
      for (let j = -1; j < 5; j++) {
        this.drawPixel(ctx, monocleX - 1, monocleY + j, '#FFD700');
        this.drawPixel(ctx, monocleX + 10, monocleY + j, '#FFD700');
      }
      // Chain
      for (let i = 0; i < 8; i++) {
        if (i % 2 === 0) this.drawPixel(ctx, monocleX + 10 + i, monocleY + 2 + i, '#FFD700');
      }
    } else if (accessoryType === 2) { // Eyepatch
      const patchY = headY + 20;
      for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 8; j++) {
          this.drawPixel(ctx, headX + 18 + i, patchY + j, '#000');
        }
      }
      // Strap
      for (let i = 0; i < 15; i++) {
        this.drawPixel(ctx, headX + 5 + i, patchY + 3, '#000');
      }
    } else { // Reading glasses
      const glassY = headY + 22;
      // Frames
      for (let i = 0; i < 10; i++) {
        this.drawPixel(ctx, headX + 19 + i, glassY - 1, '#8B4513');
        this.drawPixel(ctx, headX + 19 + i, glassY + 4, '#8B4513');
        this.drawPixel(ctx, headX + headWidth - 29 + i, glassY - 1, '#8B4513');
        this.drawPixel(ctx, headX + headWidth - 29 + i, glassY + 4, '#8B4513');
      }
      for (let j = 0; j < 4; j++) {
        this.drawPixel(ctx, headX + 19, glassY + j, '#8B4513');
        this.drawPixel(ctx, headX + 28, glassY + j, '#8B4513');
        this.drawPixel(ctx, headX + headWidth - 29, glassY + j, '#8B4513');
        this.drawPixel(ctx, headX + headWidth - 20, glassY + j, '#8B4513');
      }
      // Bridge
      for (let i = 29; i < headWidth - 29; i++) {
        this.drawPixel(ctx, headX + i, glassY + 1, '#8B4513');
      }
    }
  }

  private addFacialFeature(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, rarity: Rarity, random: () => number): void {
    const featureType = Math.floor(random() * 8);

    if (featureType === 0) { // Scar
      for (let i = 0; i < 8; i++) {
        this.drawPixel(ctx, headX + 15 + i, headY + 25 + i / 2, '#8B0000');
      }
    } else if (featureType === 1) { // Bandage
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 3; j++) {
          this.drawPixel(ctx, headX + 25 + i, headY + 20 + j, '#F5DEB3');
        }
      }
      // Bandage lines
      this.drawPixel(ctx, headX + 27, headY + 21, '#D2B48C');
      this.drawPixel(ctx, headX + 30, headY + 21, '#D2B48C');
      this.drawPixel(ctx, headX + 33, headY + 21, '#D2B48C');
    } else if (featureType === 2) { // Blush
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 2; j++) {
          this.drawPixel(ctx, headX + 10 + i, headY + 30 + j, '#FFB6C1');
          this.drawPixel(ctx, headX + headWidth - 14 + i, headY + 30 + j, '#FFB6C1');
        }
      }
    } else if (featureType === 3) { // Freckles
      const freckleColor = '#8B4513';
      this.drawPixel(ctx, headX + 18, headY + 28, freckleColor);
      this.drawPixel(ctx, headX + 22, headY + 29, freckleColor);
      this.drawPixel(ctx, headX + 20, headY + 31, freckleColor);
      this.drawPixel(ctx, headX + headWidth - 18, headY + 28, freckleColor);
      this.drawPixel(ctx, headX + headWidth - 22, headY + 29, freckleColor);
      this.drawPixel(ctx, headX + headWidth - 20, headY + 31, freckleColor);
    } else if (featureType === 4) { // Tears
      this.drawPixel(ctx, headX + 22, headY + 26, '#87CEEB');
      this.drawPixel(ctx, headX + 22, headY + 27, '#87CEEB');
      this.drawPixel(ctx, headX + 22, headY + 28, '#87CEEB');
      this.drawPixel(ctx, headX + 22, headY + 29, '#87CEEB');

      this.drawPixel(ctx, headX + headWidth - 22, headY + 26, '#87CEEB');
      this.drawPixel(ctx, headX + headWidth - 22, headY + 27, '#87CEEB');
    } else if (featureType === 5 && rarity !== 'common') { // Face tattoo
      const tattooColor = PALETTES[rarity].accent[0];
      // Small symbol on cheek
      this.drawPixel(ctx, headX + headWidth - 20, headY + 30, tattooColor);
      this.drawPixel(ctx, headX + headWidth - 19, headY + 29, tattooColor);
      this.drawPixel(ctx, headX + headWidth - 19, headY + 31, tattooColor);
      this.drawPixel(ctx, headX + headWidth - 18, headY + 30, tattooColor);
    } else if (featureType === 6) { // Mole
      this.drawPixel(ctx, headX + 35, headY + 35, '#4B2F20');
      this.drawPixel(ctx, headX + 36, headY + 35, '#4B2F20');
      this.drawPixel(ctx, headX + 35, headY + 36, '#4B2F20');
      this.drawPixel(ctx, headX + 36, headY + 36, '#4B2F20');
    } else if (featureType === 7) { // Stubble
      for (let i = 0; i < 20; i++) {
        const stubbleX = headX + 20 + Math.floor(random() * (headWidth - 40));
        const stubbleY = headY + 45 + Math.floor(random() * 8);
        this.drawPixel(ctx, stubbleX, stubbleY, '#333');
      }
    }
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
    if (type === 0) { // Frown
      this.drawFrown(ctx, x, y);
    } else if (type === 1) { // Neutral
      this.drawNeutralMouth(ctx, x, y);
    } else if (type === 2) { // Ironic smile
      this.drawIronicSmile(ctx, x, y);
    } else if (type === 3) { // Open mouth
      for (let i = -5; i <= 5; i++) {
        for (let j = 0; j < 4; j++) {
          if (Math.abs(i) + j < 6) {
            this.drawPixel(ctx, x + i, y + j, '#000');
          }
        }
      }
      // Tongue
      for (let i = -2; i <= 2; i++) {
        this.drawPixel(ctx, x + i, y + 2, '#FF69B4');
        this.drawPixel(ctx, x + i, y + 3, '#FF69B4');
      }
    } else if (type === 4) { // Gritted teeth
      for (let i = -6; i <= 6; i++) {
        this.drawPixel(ctx, x + i, y, '#000');
        if (i % 2 === 0) {
          this.drawPixel(ctx, x + i, y + 1, '#FFF');
        }
        this.drawPixel(ctx, x + i, y + 2, '#000');
      }
    } else if (type === 5) { // Wavy mouth
      for (let i = -6; i <= 6; i++) {
        const yOffset = Math.sin(i * 0.5) * 2;
        this.drawPixel(ctx, x + i, y + Math.round(yOffset), '#000');
      }
    } else { // Drooling
      this.drawNeutralMouth(ctx, x, y);
      // Drool
      this.drawPixel(ctx, x + 5, y + 1, '#87CEEB');
      this.drawPixel(ctx, x + 5, y + 2, '#87CEEB');
      this.drawPixel(ctx, x + 5, y + 3, '#87CEEB');
      this.drawPixel(ctx, x + 5, y + 4, '#87CEEB');
    }
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
    const accessoryType = Math.floor(random() * 6);

    if (accessoryType === 0) { // Chain necklace
      const chainY = bodyY + 5;
      const chainColor = rarity === 'legendary' ? '#FFD700' : '#C0C0C0';
      for (let i = 10; i < bodyWidth - 10; i += 3) {
        this.drawPixel(ctx, bodyX + i, chainY, chainColor);
        this.drawPixel(ctx, bodyX + i, chainY + 1, chainColor);
        this.drawPixel(ctx, bodyX + i + 1, chainY + 1, chainColor);
        this.drawPixel(ctx, bodyX + i + 1, chainY + 2, chainColor);
      }
      // Pendant
      const pendantX = bodyX + bodyWidth / 2 - 3;
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          if (i + j > 2 && i + j < 9) {
            this.drawPixel(ctx, pendantX + i, chainY + 3 + j, chainColor);
          }
        }
      }
    } else if (accessoryType === 1) { // T-shirt with design
      const shirtColor = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF'][Math.floor(random() * 5)];
      for (let i = 5; i < bodyWidth - 5; i++) {
        for (let j = 10; j < 30; j++) {
          if (random() > 0.2) {
            this.drawPixel(ctx, bodyX + i, bodyY + j, shirtColor);
          }
        }
      }
      // Logo/text
      const logoX = bodyX + bodyWidth / 2 - 8;
      const logoY = bodyY + 18;
      for (let i = 0; i < 16; i++) {
        if (i % 2 === 0) {
          this.drawPixel(ctx, logoX + i, logoY, '#FFF');
          this.drawPixel(ctx, logoX + i, logoY + 4, '#FFF');
        }
      }
    } else if (accessoryType === 2) { // Bow tie
      const bowtieY = bodyY + 3;
      const bowtieColor = ['#FF0000', '#000000', '#FFD700', '#FF69B4'][Math.floor(random() * 4)];
      // Center knot
      for (let i = -2; i <= 2; i++) {
        for (let j = 0; j < 3; j++) {
          this.drawPixel(ctx, 50 + i, bowtieY + j, bowtieColor);
        }
      }
      // Left wing
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4 - Math.abs(i - 3); j++) {
          this.drawPixel(ctx, 50 - 3 - i, bowtieY + j, bowtieColor);
        }
      }
      // Right wing
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4 - Math.abs(i - 3); j++) {
          this.drawPixel(ctx, 50 + 3 + i, bowtieY + j, bowtieColor);
        }
      }
    } else if (accessoryType === 3 && (rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic')) { // Chest tattoo
      const tattooColor = PALETTES[rarity].accent[0];
      // Simple symbol in center of chest
      const centerX = bodyX + bodyWidth / 2;
      const centerY = bodyY + 15;
      // Draw a cool symbol
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const x = centerX + Math.cos(angle) * 8;
        const y = centerY + Math.sin(angle) * 8;
        this.drawPixel(ctx, Math.floor(x), Math.floor(y), tattooColor);
        this.drawPixel(ctx, Math.floor(x) + 1, Math.floor(y), tattooColor);
        this.drawPixel(ctx, Math.floor(x), Math.floor(y) + 1, tattooColor);
      }
    } else if (accessoryType === 4) { // Suspenders
      const suspenderColor = '#8B4513';
      // Left suspender
      for (let j = 0; j < 30; j++) {
        this.drawPixel(ctx, bodyX + 10, bodyY + j, suspenderColor);
        this.drawPixel(ctx, bodyX + 11, bodyY + j, suspenderColor);
      }
      // Right suspender
      for (let j = 0; j < 30; j++) {
        this.drawPixel(ctx, bodyX + bodyWidth - 11, bodyY + j, suspenderColor);
        this.drawPixel(ctx, bodyX + bodyWidth - 10, bodyY + j, suspenderColor);
      }
    } else { // Badge/pin
      const badgeX = bodyX + 8;
      const badgeY = bodyY + 8;
      const badgeColor = '#FFD700';
      // Star badge
      this.drawPixel(ctx, badgeX + 2, badgeY, badgeColor);
      for (let i = 0; i < 5; i++) {
        this.drawPixel(ctx, badgeX + i, badgeY + 1, badgeColor);
      }
      for (let i = 0; i < 5; i++) {
        this.drawPixel(ctx, badgeX + i, badgeY + 2, badgeColor);
      }
      this.drawPixel(ctx, badgeX, badgeY + 3, badgeColor);
      this.drawPixel(ctx, badgeX + 1, badgeY + 3, badgeColor);
      this.drawPixel(ctx, badgeX + 3, badgeY + 3, badgeColor);
      this.drawPixel(ctx, badgeX + 4, badgeY + 3, badgeColor);
    }
  }

  private addHeadAccessory(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, rarity: Rarity, random: () => number): void {
    const accessoryType = Math.floor(random() * 12);

    if (accessoryType === 0) { // Crown
      if (rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic') {
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
    } else if (accessoryType === 1) { // Horns
      const hornColor = rarity === 'mythic' ? '#FF00FF' : '#8B0000';
      // Left horn
      for (let i = 0; i < 6; i++) {
        this.drawPixel(ctx, headX + 10 - i / 2, headY - 2 - i, hornColor);
        this.drawPixel(ctx, headX + 11 - i / 2, headY - 2 - i, hornColor);
      }
      // Right horn
      for (let i = 0; i < 6; i++) {
        this.drawPixel(ctx, headX + headWidth - 11 + i / 2, headY - 2 - i, hornColor);
        this.drawPixel(ctx, headX + headWidth - 10 + i / 2, headY - 2 - i, hornColor);
      }
    } else if (accessoryType === 2) { // Halo
      if (rarity === 'legendary' || rarity === 'mythic') {
        const haloY = headY - 10;
        const haloColor = '#FFFF00';
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
          const hx = 50 + Math.cos(angle) * 15;
          const hy = haloY + Math.sin(angle) * 4;
          if (hx >= 0 && hx < 100 && hy >= 0 && hy < 100) {
            this.drawPixel(ctx, Math.floor(hx), Math.floor(hy), haloColor);
          }
        }
      }
    } else if (accessoryType === 3) { // Headphones
      const phoneColor = ['#FF0000', '#0000FF', '#00FF00', '#000000'][Math.floor(random() * 4)];
      // Band
      for (let i = headX + 5; i < headX + headWidth - 5; i++) {
        this.drawPixel(ctx, i, headY - 3, phoneColor);
        this.drawPixel(ctx, i, headY - 2, phoneColor);
      }
      // Ear cups
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 12; j++) {
          this.drawPixel(ctx, headX + 2 + i, headY + 15 + j, phoneColor);
          this.drawPixel(ctx, headX + headWidth - 10 + i, headY + 15 + j, phoneColor);
        }
      }
    } else if (accessoryType === 4) { // Bandana
      const bandanaColor = ['#FF0000', '#0000FF', '#000000', '#800080'][Math.floor(random() * 4)];
      for (let i = headX + 5; i < headX + headWidth - 5; i++) {
        for (let j = 0; j < 6; j++) {
          this.drawPixel(ctx, i, headY + j, bandanaColor);
        }
      }
      // Pattern
      for (let i = headX + 10; i < headX + headWidth - 10; i += 4) {
        for (let j = 1; j < 5; j += 2) {
          this.drawPixel(ctx, i, headY + j, '#FFF');
        }
      }
    } else if (accessoryType === 5) { // Beanie variations
      const beanieColor = ['#FF0000', '#0000FF', '#00FF00', '#FFB6C1', '#800080'][Math.floor(random() * 5)];
      for (let i = -14; i < 14; i++) {
        for (let j = -8; j < 5; j++) {
          if ((i * i) / 196 + ((j + 3) * (j + 3)) / 64 <= 1) {
            const color = (i + j) % 3 === 0 ? beanieColor : this.adjustColor(beanieColor, 0.8);
            this.drawPixel(ctx, 50 + i, headY + j - 2, color);
          }
        }
      }
      // Pom pom
      this.drawCircle(ctx, 50, headY - 8, 3, '#FFF');
    } else if (accessoryType === 6) { // Cap with logo
      const capColor = ['#FF0000', '#0000FF', '#000000', '#00FF00'][Math.floor(random() * 4)];
      // Cap
      for (let i = -14; i < 14; i++) {
        for (let j = -5; j < 2; j++) {
          if ((i * i) / 196 + (j * j) / 25 <= 1) {
            this.drawPixel(ctx, 50 + i, headY + j, capColor);
          }
        }
      }
      // Brim
      for (let i = -16; i < -5; i++) {
        this.drawPixel(ctx, 50 + i, headY + 1, this.adjustColor(capColor, 0.7));
        this.drawPixel(ctx, 50 + i, headY + 2, this.adjustColor(capColor, 0.7));
      }
      // Logo
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          this.drawPixel(ctx, 48 + i, headY - 2 + j, '#FFF');
        }
      }
    } else if (accessoryType === 7) { // Cigarette/Joint
      const mouthY = headY + 48;
      const smokeType = random() > 0.5 ? 'cigarette' : 'joint';
      const color = smokeType === 'cigarette' ? '#FFF' : '#F5DEB3';

      for (let i = 0; i < 10; i++) {
        this.drawPixel(ctx, 55 + i, mouthY, color);
      }
      this.drawPixel(ctx, 65, mouthY, '#FF6347');
      this.drawPixel(ctx, 66, mouthY, '#FF6347');

      // Smoke
      if (random() > 0.3) {
        for (let i = 0; i < 3; i++) {
          this.drawPixel(ctx, 67 + i, mouthY - 1 - i, '#999');
          this.drawPixel(ctx, 68 + i, mouthY - 2 - i, '#999');
        }
      }
    } else if (accessoryType === 8) { // Third eye
      if (rarity === 'mythic' || rarity === 'epic') {
        const thirdEyeX = 50;
        const thirdEyeY = headY + 10;
        // Eye shape
        for (let i = -3; i <= 3; i++) {
          for (let j = -1; j <= 1; j++) {
            if (Math.abs(i) + Math.abs(j) <= 3) {
              this.drawPixel(ctx, thirdEyeX + i, thirdEyeY + j, '#FFF');
            }
          }
        }
        // Pupil
        this.drawCircle(ctx, thirdEyeX, thirdEyeY, 1, PALETTES[rarity].accent[0]);
      }
    } else if (accessoryType === 9) { // Antennae
      if (rarity === 'mythic') {
        // Left antenna
        for (let i = 0; i < 8; i++) {
          this.drawPixel(ctx, headX + 20, headY - 2 - i, '#00FF00');
        }
        this.drawCircle(ctx, headX + 20, headY - 10, 2, '#00FF00');

        // Right antenna
        for (let i = 0; i < 8; i++) {
          this.drawPixel(ctx, headX + headWidth - 20, headY - 2 - i, '#00FF00');
        }
        this.drawCircle(ctx, headX + headWidth - 20, headY - 10, 2, '#00FF00');
      }
    } else if (accessoryType === 10) { // Mohawk
      const mohawkColor = ['#FF00FF', '#00FF00', '#FF0000', '#0000FF'][Math.floor(random() * 4)];
      for (let i = -3; i <= 3; i++) {
        for (let j = 0; j < 12; j++) {
          this.drawPixel(ctx, 50 + i, headY - 12 + j, mohawkColor);
        }
      }
    } else { // Flower crown
      if (rarity === 'rare' || rarity === 'epic') {
        const flowerColors = ['#FFB6C1', '#FF69B4', '#DDA0DD', '#FFF'];
        for (let i = 0; i < 5; i++) {
          const flowerX = headX + 10 + i * 12;
          const flowerY = headY - 2;
          const flowerColor = flowerColors[i % flowerColors.length];

          // Petals
          this.drawPixel(ctx, flowerX, flowerY - 1, flowerColor);
          this.drawPixel(ctx, flowerX - 1, flowerY, flowerColor);
          this.drawPixel(ctx, flowerX + 1, flowerY, flowerColor);
          this.drawPixel(ctx, flowerX, flowerY + 1, flowerColor);
          // Center
          this.drawPixel(ctx, flowerX, flowerY, '#FFFF00');
        }
      }
    }
  }

  private adjustColor(color: string, factor: number): string {
    // Simple color adjustment
    if (color === '#FF0000') return factor < 1 ? '#CC0000' : '#FF3333';
    if (color === '#0000FF') return factor < 1 ? '#0000CC' : '#3333FF';
    if (color === '#00FF00') return factor < 1 ? '#00CC00' : '#33FF33';
    if (color === '#000000') return factor < 1 ? '#000000' : '#333333';
    return color;
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
    const chainType = Math.floor(random() * 5);
    // Calculate exact chest position based on actual body dimensions
    const neckY = bodyY + 5; // Just below where body starts
    const chestCenterX = 50; // Center of the canvas
    const chestTopY = neckY + 8; // Upper chest area

    if (chainType === 0) { // Cuban link chain
      this.drawCubanChain(ctx, chestCenterX, chestTopY, bodyWidth, random);
    } else if (chainType === 1) { // Diamond tennis chain
      this.drawTennisChain(ctx, chestCenterX, chestTopY, bodyWidth, random);
    } else if (chainType === 2) { // Rope chain with $ pendant
      this.drawRopeChain(ctx, chestCenterX, chestTopY, bodyWidth, random);
    } else if (chainType === 3) { // Multi-layer chains
      this.drawMultiLayerChains(ctx, chestCenterX, chestTopY, bodyWidth, random);
    } else { // Iced out cross chain
      this.drawCrossChain(ctx, chestCenterX, chestTopY, bodyWidth, random);
    }
  }

  private drawRopeChain(ctx: CanvasRenderingContext2D, centerX: number, chestY: number, bodyWidth: number, random: () => number): void {
    const chainY = chestY;
    // Scale chain to body width
    const chainSpread = Math.min(bodyWidth * 0.75, 60);

    // Twisted rope pattern
    for (let i = -chainSpread / 2; i <= chainSpread / 2; i += 1) {
      const x = centerX + i;
      const twist = Math.sin(i * 0.8);
      const y1 = chainY + twist * 2;
      const y2 = chainY - twist * 2;

      this.drawPixel(ctx, x, y1, '#FFD700');
      this.drawPixel(ctx, x, y2, '#FFA500');

      // Iced out sections
      if (i % 10 === 0) {
        this.drawPixel(ctx, x, y1 - 1, '#FFFFFF');
        this.drawPixel(ctx, x, y2 + 1, '#FFFFFF');
      }
    }

    // Big $ pendant
    const pendantX = centerX - 4;
    const pendantY = chainY + 8;

    // $ background circle
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        if (i * i + j * j <= 25) {
          this.drawPixel(ctx, pendantX + 4 + i, pendantY + 5 + j, '#FFD700');
        }
      }
    }

    // $ symbol
    for (let i = 0; i < 7; i++) {
      this.drawPixel(ctx, pendantX + 4, pendantY + 2 + i, '#00FF00');
    }
    this.drawPixel(ctx, pendantX + 2, pendantY + 2, '#00FF00');
    this.drawPixel(ctx, pendantX + 3, pendantY + 2, '#00FF00');
    this.drawPixel(ctx, pendantX + 5, pendantY + 2, '#00FF00');
    this.drawPixel(ctx, pendantX + 6, pendantY + 2, '#00FF00');

    this.drawPixel(ctx, pendantX + 2, pendantY + 5, '#00FF00');
    this.drawPixel(ctx, pendantX + 3, pendantY + 5, '#00FF00');
    this.drawPixel(ctx, pendantX + 5, pendantY + 5, '#00FF00');
    this.drawPixel(ctx, pendantX + 6, pendantY + 5, '#00FF00');

    this.drawPixel(ctx, pendantX + 2, pendantY + 8, '#00FF00');
    this.drawPixel(ctx, pendantX + 3, pendantY + 8, '#00FF00');
    this.drawPixel(ctx, pendantX + 5, pendantY + 8, '#00FF00');
    this.drawPixel(ctx, pendantX + 6, pendantY + 8, '#00FF00');
  }

  private drawMultiLayerChains(ctx: CanvasRenderingContext2D, centerX: number, chestY: number, bodyWidth: number, random: () => number): void {
    // Three layers of chains
    const chainColors = ['#FFD700', '#C0C0C0', '#FF69B4'];

    for (let layer = 0; layer < 3; layer++) {
      const chainY = chestY + layer * 4;
      const chainColor = chainColors[layer];
      const amplitude = 3 - layer;
      // Scale chain spread to body width
      const chainSpread = Math.min(bodyWidth * (0.65 - layer * 0.08), 50 - layer * 4);

      for (let i = -chainSpread / 2; i <= chainSpread / 2; i += 2) {
        const x = centerX + i;
        const y = chainY + Math.sin(i * 0.3) * amplitude;

        this.drawPixel(ctx, x, y, chainColor);
        this.drawPixel(ctx, x + 1, y, chainColor);

        // Add ice to each layer
        if (i % 8 === 0) {
          const iceColors = ['#FFFFFF', '#00FFFF', '#E0E0E0'];
          this.drawPixel(ctx, x, y - 1, iceColors[layer]);
        }
      }
    }

    // Center charm on middle chain
    const charmX = centerX;
    const charmY = chestY + 4; // Adjusted for new chain position
    // Small crown charm
    for (let i = -3; i <= 3; i++) {
      this.drawPixel(ctx, charmX + i, charmY + 2, '#FFD700');
    }
    this.drawPixel(ctx, charmX - 3, charmY + 1, '#FFD700');
    this.drawPixel(ctx, charmX - 1, charmY + 1, '#FFD700');
    this.drawPixel(ctx, charmX + 1, charmY + 1, '#FFD700');
    this.drawPixel(ctx, charmX + 3, charmY + 1, '#FFD700');
    this.drawPixel(ctx, charmX - 2, charmY, '#FFD700');
    this.drawPixel(ctx, charmX, charmY, '#FFD700');
    this.drawPixel(ctx, charmX + 2, charmY, '#FFD700');
  }

  private drawCrossChain(ctx: CanvasRenderingContext2D, centerX: number, chestY: number, bodyWidth: number, random: () => number): void {
    const chainY = chestY;
    // Scale chain to body width
    const chainSpread = Math.min(bodyWidth * 0.7, 56);

    // Heavy chain
    for (let i = -chainSpread / 2; i <= chainSpread / 2; i += 3) {
      const x = centerX + i;
      const y = chainY + Math.sin(i * 0.2) * 1;

      // Chain links
      for (let dx = 0; dx < 2; dx++) {
        for (let dy = 0; dy < 2; dy++) {
          this.drawPixel(ctx, x + dx, y + dy, '#FFD700');
        }
      }
    }

    // Iced out cross pendant
    const crossX = centerX;
    const crossY = chainY + 7;

    // Cross outline in gold
    for (let i = -2; i <= 2; i++) {
      for (let j = -4; j <= 4; j++) {
        this.drawPixel(ctx, crossX + i, crossY + j, '#FFD700');
      }
    }
    for (let i = -5; i <= 5; i++) {
      for (let j = -1; j <= 1; j++) {
        this.drawPixel(ctx, crossX + i, crossY + j, '#FFD700');
      }
    }

    // Diamond center
    for (let i = -1; i <= 1; i++) {
      for (let j = -3; j <= 3; j++) {
        if (Math.abs(j) <= 2 || Math.abs(i) === 0) {
          this.drawPixel(ctx, crossX + i, crossY + j, '#00FFFF');
        }
      }
    }
    for (let i = -4; i <= 4; i++) {
      if (Math.abs(i) > 1) {
        this.drawPixel(ctx, crossX + i, crossY, '#00FFFF');
      }
    }

    // Extra sparkles around the cross
    this.drawPixel(ctx, crossX - 3, crossY - 3, '#FFFFFF');
    this.drawPixel(ctx, crossX + 3, crossY - 3, '#FFFFFF');
    this.drawPixel(ctx, crossX - 3, crossY + 3, '#FFFFFF');
    this.drawPixel(ctx, crossX + 3, crossY + 3, '#FFFFFF');
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
