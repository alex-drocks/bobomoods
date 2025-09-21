import { Injectable } from '@angular/core';
import { Rarity, PALETTES } from '../models/types';

// Add new types for enhanced features
interface BearTraits {
  bodyType: 'normal' | 'chubby' | 'tall' | 'athletic' | 'baby';
  pose: 'front' | 'threequarter' | 'crossed' | 'waving' | 'sitting' | 'dancing';
  furPattern: 'solid' | 'stripes' | 'spots' | 'camo' | 'gradient' | 'rainbow';
  backgroundType: 'pattern' | 'scene' | 'abstract' | 'weather' | 'time';
  specialTrait?: 'glitch' | 'holographic' | 'ghost' | 'multiarms' | 'floating' | 'laser' | 'invisible' | 'pixelshift';
  accessories: string[];
  size: 'normal' | 'zoomed' | 'fullbody' | 'mini' | 'closeup';
  props: string[];
}

@Injectable({ providedIn: 'root' })
export class PixelBoboService {
  private readonly pixelSize = 9;
  private static readonly CANVAS_SIZE = 100;
  private static readonly BACKGROUND_PATTERN_SIZE = 10;
  private static readonly BACKGROUND_THRESHOLD = 0.7;
  private static readonly STAR_COUNT = 20;
  private static readonly AURA_INNER_RADIUS = 30;
  private static readonly AURA_OUTER_RADIUS = 45;

  // Animation frame counter for dynamic elements
  private animationFrame = 0;

  generateBobo(canvas: HTMLCanvasElement, seed: number, rarity: Rarity): void {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    this.setupCanvasRendering(ctx);
    const random = this.seededRandom(seed);
    this.clear(ctx, canvas);
    const palette = PALETTES[rarity];

    // Generate bear traits based on rarity
    const traits = this.generateTraits(rarity, random);

    // Draw enhanced background
    this.drawEnhancedBackground(ctx, canvas, palette, rarity, traits.backgroundType, random);

    // Draw bear based on traits
    this.drawBearWithTraits(ctx, canvas, palette, rarity, traits, random);

    // Add environmental props
    if (traits.props.length > 0) {
      this.drawProps(ctx, traits.props, palette, random);
    }

    // Apply special effects
    if (traits.specialTrait) {
      this.applySpecialTrait(ctx, canvas, traits.specialTrait, palette, random);
    }
  }

  private generateTraits(rarity: Rarity, random: () => number): BearTraits {
    const traits: BearTraits = {
      bodyType: this.selectBodyType(random),
      pose: this.selectPose(rarity, random),
      furPattern: this.selectFurPattern(rarity, random),
      backgroundType: this.selectBackgroundType(rarity, random),
      accessories: this.selectAccessories(rarity, random),
      size: this.selectSize(rarity, random),
      props: this.selectProps(rarity, random)
    };

    // Special traits for rare bears
    if (rarity === 'mythic' && random() < 0.3) {
      traits.specialTrait = this.selectSpecialTrait(random);
    } else if (rarity === 'legendary' && random() < 0.2) {
      traits.specialTrait = ['holographic', 'ghost', 'floating'][Math.floor(random() * 3)] as any;
    }

    // One-of-one traits (0.1% chance)
    if (random() < 0.001) {
      traits.specialTrait = ['laser', 'invisible', 'pixelshift'][Math.floor(random() * 3)] as any;
    }

    // Apply personality-based trait synergies
    this.applyPersonalitySynergies(traits, rarity, random);

    return traits;
  }

  private applyPersonalitySynergies(traits: BearTraits, rarity: Rarity, random: () => number): void {
    // Cool personality: sunglasses + crossed arms
    if (traits.accessories.includes('sunglasses') && random() < 0.5) {
      traits.pose = 'crossed';
    }

    // Athletic personality: athletic body + waving/dancing
    if (traits.bodyType === 'athletic' && random() < 0.6) {
      traits.pose = random() < 0.5 ? 'waving' : 'dancing';
    }

    // Baby personality: baby body + sitting pose
    if (traits.bodyType === 'baby' && random() < 0.7) {
      traits.pose = 'sitting';
      // Babies don't smoke
      traits.accessories = traits.accessories.filter(a => a !== 'cigarette');
    }

    // Scholar personality: glasses + neutral pose
    if (traits.accessories.includes('glasses') && random() < 0.5) {
      traits.pose = 'front';
      if (!traits.accessories.includes('bowtie') && random() < 0.5) {
        traits.accessories.push('bowtie');
      }
    }

    // Party personality: dancing + rainbow/gradient
    if (traits.pose === 'dancing' && rarity !== 'common') {
      if (random() < 0.4) {
        traits.furPattern = random() < 0.5 ? 'rainbow' : 'gradient';
      }
      // Add party props
      if (!traits.props.includes('stars') && random() < 0.5) {
        traits.props.push('stars');
      }
    }

    // Royal personality: crown + sitting
    if (traits.accessories.includes('crown') && random() < 0.5) {
      traits.pose = 'sitting';
      traits.backgroundType = 'abstract'; // Royal abstract patterns
    }

    // Mystic personality: third-eye + floating
    if (traits.accessories.includes('third-eye') && rarity === 'mythic') {
      traits.specialTrait = 'floating';
      traits.backgroundType = 'abstract';
    }
  }

  private selectBodyType(random: () => number): BearTraits['bodyType'] {
    const rand = random();
    if (rand < 0.2) return 'chubby';
    if (rand < 0.35) return 'tall';
    if (rand < 0.45) return 'athletic';
    if (rand < 0.5) return 'baby';
    return 'normal';
  }

  private selectPose(rarity: Rarity, random: () => number): BearTraits['pose'] {
    if (rarity === 'mythic' && random() < 0.3) {
      return ['sitting', 'dancing'][Math.floor(random() * 2)] as any;
    }
    const rand = random();
    if (rand < 0.15) return 'threequarter';
    if (rand < 0.25) return 'crossed';
    if (rand < 0.35) return 'waving';
    return 'front';
  }

  private selectFurPattern(rarity: Rarity, random: () => number): BearTraits['furPattern'] {
    if (rarity === 'mythic' && random() < 0.4) {
      return ['gradient', 'rainbow'][Math.floor(random() * 2)] as any;
    }
    const rand = random();
    if (rand < 0.15) return 'stripes';
    if (rand < 0.25) return 'spots';
    if (rand < 0.35) return 'camo';
    if (rand < 0.45) return 'gradient';
    return 'solid';
  }

  private selectBackgroundType(rarity: Rarity, random: () => number): BearTraits['backgroundType'] {
    if (rarity === 'mythic' || rarity === 'legendary') {
      return ['scene', 'abstract', 'weather', 'time'][Math.floor(random() * 4)] as any;
    }
    return random() < 0.5 ? 'pattern' : 'scene';
  }

  private selectSize(rarity: Rarity, random: () => number): BearTraits['size'] {
    const rand = random();
    if (rand < 0.1) return 'zoomed';
    if (rand < 0.15) return 'fullbody';
    if (rand < 0.18 && rarity === 'mythic') return 'mini';
    if (rand < 0.23) return 'closeup';
    return 'normal';
  }

  private selectAccessories(rarity: Rarity, random: () => number): string[] {
    const accessories: string[] = [];
    const availableAccessories = this.getAvailableAccessories(rarity);

    // Multiple accessories for higher rarities
    const maxAccessories = rarity === 'mythic' ? 4 : rarity === 'legendary' ? 3 : 2;
    const accessoryCount = rarity === 'common' ? (random() < 0.3 ? 1 : 0) : 1 + Math.floor(random() * maxAccessories);

    for (let i = 0; i < accessoryCount; i++) {
      const accessory = availableAccessories[Math.floor(random() * availableAccessories.length)];
      if (!accessories.includes(accessory) && !this.hasConflict(accessory, accessories)) {
        accessories.push(accessory);
      }
    }

    // Check for trait combinations
    this.applyTraitCombos(accessories, random);

    return accessories;
  }

  private hasConflict(newAccessory: string, existing: string[]): boolean {
    const conflicts: {[key: string]: string[]} = {
      'sunglasses': ['glasses', 'monocle', 'third-eye'],
      'glasses': ['sunglasses', 'monocle'],
      'monocle': ['sunglasses', 'glasses'],
      'crown': ['hat', 'beanie', 'cap', 'bandana'],
      'hat': ['crown', 'beanie', 'cap', 'bandana', 'halo'],
      'beanie': ['crown', 'hat', 'cap', 'bandana', 'halo'],
      'cap': ['crown', 'hat', 'beanie', 'bandana', 'halo'],
      'bandana': ['crown', 'hat', 'beanie', 'cap'],
      'headphones': ['earrings'],
      'earrings': ['headphones']
    };

    const conflictList = conflicts[newAccessory] || [];
    return existing.some(acc => conflictList.includes(acc));
  }

  private getAvailableAccessories(rarity: Rarity): string[] {
    const common = ['glasses', 'hat', 'bowtie', 'chain'];
    const rare = [...common, 'crown', 'headphones', 'bandana', 'sunglasses'];
    const epic = [...rare, 'horns', 'monocle', 'cigarette', 'tattoo'];
    const legendary = [...epic, 'halo', 'aura', 'wings', 'flames'];
    const mythic = [...legendary, 'third-eye', 'antennae', 'bling-chain', 'laser-eyes'];

    switch (rarity) {
      case 'mythic': return mythic;
      case 'legendary': return legendary;
      case 'epic': return epic;
      case 'rare': return rare;
      default: return common;
    }
  }

  private applyTraitCombos(accessories: string[], random: () => number): void {
    // Cool bear combo
    if (accessories.includes('sunglasses') && random() < 0.5) {
      accessories.push('cigarette');
    }
    // Royal bear combo
    if (accessories.includes('crown') && random() < 0.5) {
      accessories.push('scepter');
    }
    // Rapper bear combo
    if (accessories.includes('chain') && random() < 0.5) {
      accessories.push('headphones');
    }
    // Professor bear combo
    if (accessories.includes('glasses') && random() < 0.5) {
      accessories.push('bowtie');
    }
  }

  private selectProps(rarity: Rarity, random: () => number): string[] {
    const props: string[] = [];
    if (rarity === 'common') return props;

    const availableProps = ['money', 'hearts', 'stars', 'butterflies', 'sword', 'phone', 'flower', 'bird'];
    const propCount = rarity === 'mythic' ? 2 : rarity === 'legendary' ? 1 : (random() < 0.3 ? 1 : 0);

    for (let i = 0; i < propCount; i++) {
      props.push(availableProps[Math.floor(random() * availableProps.length)]);
    }

    return props;
  }

  private selectSpecialTrait(random: () => number): BearTraits['specialTrait'] {
    const traits: BearTraits['specialTrait'][] = ['glitch', 'holographic', 'ghost', 'multiarms', 'floating'];
    return traits[Math.floor(random() * traits.length)];
  }

  private drawBearWithTraits(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, palette: any, rarity: Rarity, traits: BearTraits, random: () => number): void {
    // Calculate dimensions based on body type and size
    const dimensions = this.calculateDimensions(traits, random);

    // Apply pose transformations
    if (traits.pose === 'threequarter') {
      this.drawThreeQuarterBear(ctx, dimensions, palette, rarity, traits, random);
    } else if (traits.pose === 'sitting') {
      this.drawSittingBear(ctx, dimensions, palette, rarity, traits, random);
    } else if (traits.pose === 'dancing') {
      this.drawDancingBear(ctx, dimensions, palette, rarity, traits, random);
    } else {
      this.drawStandardBear(ctx, dimensions, palette, rarity, traits, random);
    }
  }

  private calculateDimensions(traits: BearTraits, random: () => number): any {
    let baseHeadWidth = 65;
    let baseHeadHeight = 55;
    let baseBodyWidth = 60;
    let baseBodyHeight = 48;

    // Adjust for body type
    switch (traits.bodyType) {
      case 'chubby':
        baseHeadWidth *= 1.2;
        baseHeadHeight *= 1.1;
        baseBodyWidth *= 1.3;
        baseBodyHeight *= 1.2;
        break;
      case 'tall':
        baseHeadHeight *= 0.9;
        baseBodyWidth *= 0.85;
        baseBodyHeight *= 1.3;
        break;
      case 'athletic':
        baseBodyWidth *= 1.1;
        baseBodyHeight *= 1.1;
        break;
      case 'baby':
        baseHeadWidth *= 0.8;
        baseHeadHeight *= 0.85;
        baseBodyWidth *= 0.7;
        baseBodyHeight *= 0.7;
        break;
    }

    // Adjust for size variation
    let scale = 1;
    let offsetY = 0;
    switch (traits.size) {
      case 'zoomed':
        scale = 1.3;
        offsetY = 10;
        break;
      case 'fullbody':
        scale = 0.8;
        offsetY = -10;
        break;
      case 'mini':
        scale = 0.4;
        break;
      case 'closeup':
        scale = 1.5;
        offsetY = 20;
        break;
    }

    return {
      headWidth: Math.floor(baseHeadWidth * scale + random() * 20),
      headHeight: Math.floor(baseHeadHeight * scale + random() * 15),
      bodyWidth: Math.floor(baseBodyWidth * scale),
      bodyHeight: Math.floor(baseBodyHeight * scale),
      scale,
      offsetY,
      centerX: 50,
      centerY: 50
    };
  }

  private drawStandardBear(ctx: CanvasRenderingContext2D, dims: any, palette: any, rarity: Rarity, traits: BearTraits, random: () => number): void {
    const bearColor = this.getBearColor(palette, traits.furPattern, random);

    const headX = dims.centerX - dims.headWidth / 2;
    const headY = 18 + dims.offsetY;
    const bodyY = headY + dims.headHeight - 10;

    // Draw body with fur pattern
    this.drawBodyWithPattern(ctx, dims.centerX - dims.bodyWidth / 2, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor, traits.furPattern, palette, random);

    // Draw arms based on pose
    if (traits.pose === 'crossed') {
      this.drawCrossedArms(ctx, dims.centerX, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor);
    } else if (traits.pose === 'waving') {
      this.drawWavingArm(ctx, dims.centerX, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor, random);
    } else if (traits.specialTrait === 'multiarms') {
      this.drawMultipleArms(ctx, dims.centerX, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor);
    } else {
      this.drawArms(ctx, dims.centerX, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor, Math.floor(random() * 3));
    }

    // Draw feet
    if (traits.size === 'fullbody') {
      this.drawFullLegs(ctx, dims.centerX, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor, random);
    } else {
      this.drawFeet(ctx, dims.centerX, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor, rarity, random);
    }

    // Draw head with pattern
    this.drawHeadWithPattern(ctx, headX, headY, dims.headWidth, dims.headHeight, bearColor, traits.furPattern, palette, random);

    // Always draw ears
    this.drawEars(ctx, headX, headY, dims.headWidth, dims.headHeight, bearColor, palette, random);

    // Draw face
    this.drawEnhancedFace(ctx, headX, headY, dims.headWidth, dims.headHeight, rarity, palette, traits, random);

    // Apply accessories
    this.applyAllAccessories(ctx, headX, headY, dims.headWidth, dims.headHeight, bodyY, dims.bodyWidth, dims.bodyHeight, traits.accessories, rarity, palette, random);
  }

  private drawThreeQuarterBear(ctx: CanvasRenderingContext2D, dims: any, palette: any, rarity: Rarity, traits: BearTraits, random: () => number): void {
    const bearColor = this.getBearColor(palette, traits.furPattern, random);
    const headX = dims.centerX - dims.headWidth / 2 - 5;
    const headY = 18 + dims.offsetY;
    const bodyY = headY + dims.headHeight - 10;

    // Body at angle
    this.drawAngledBody(ctx, dims.centerX - dims.bodyWidth / 2, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor, traits.furPattern, palette, random);

    // One visible arm
    this.drawSingleArm(ctx, dims.centerX - dims.bodyWidth / 2, bodyY + 10, 15, 25, bearColor);

    // Angled head
    this.drawAngledHead(ctx, headX, headY, dims.headWidth, dims.headHeight, bearColor, traits.furPattern, palette, random);

    // Ears (one slightly behind)
    this.drawAngledEars(ctx, headX, headY, dims.headWidth, dims.headHeight, bearColor, palette, random);

    // Angled face
    this.drawAngledFace(ctx, headX, headY, dims.headWidth, dims.headHeight, rarity, palette, traits, random);

    // Apply accessories
    this.applyAllAccessories(ctx, headX, headY, dims.headWidth, dims.headHeight, bodyY, dims.bodyWidth, dims.bodyHeight, traits.accessories, rarity, palette, random);
  }

  private drawSittingBear(ctx: CanvasRenderingContext2D, dims: any, palette: any, rarity: Rarity, traits: BearTraits, random: () => number): void {
    const bearColor = this.getBearColor(palette, traits.furPattern, random);
    const headX = dims.centerX - dims.headWidth / 2;
    const headY = 15 + dims.offsetY;
    const bodyY = headY + dims.headHeight - 15;

    // Sitting body (wider, shorter)
    const sittingBodyWidth = dims.bodyWidth * 1.2;
    const sittingBodyHeight = dims.bodyHeight * 0.7;
    this.drawBodyWithPattern(ctx, dims.centerX - sittingBodyWidth / 2, bodyY, sittingBodyWidth, sittingBodyHeight, bearColor, traits.furPattern, palette, random);

    // Sitting legs (visible from front)
    this.drawSittingLegs(ctx, dims.centerX, bodyY + sittingBodyHeight - 10, sittingBodyWidth, bearColor, random);

    // Arms resting on legs
    this.drawRestingArms(ctx, dims.centerX, bodyY, sittingBodyWidth, sittingBodyHeight, bearColor);

    // Draw head
    this.drawHeadWithPattern(ctx, headX, headY, dims.headWidth, dims.headHeight, bearColor, traits.furPattern, palette, random);
    this.drawEars(ctx, headX, headY, dims.headWidth, dims.headHeight, bearColor, palette, random);
    this.drawEnhancedFace(ctx, headX, headY, dims.headWidth, dims.headHeight, rarity, palette, traits, random);

    // Apply accessories
    this.applyAllAccessories(ctx, headX, headY, dims.headWidth, dims.headHeight, bodyY, sittingBodyWidth, sittingBodyHeight, traits.accessories, rarity, palette, random);
  }

  private drawDancingBear(ctx: CanvasRenderingContext2D, dims: any, palette: any, rarity: Rarity, traits: BearTraits, random: () => number): void {
    const bearColor = this.getBearColor(palette, traits.furPattern, random);

    // Tilted positioning for dance
    const tilt = Math.sin(this.animationFrame * 0.1) * 5;
    const headX = dims.centerX - dims.headWidth / 2 + tilt;
    const headY = 18 + dims.offsetY + Math.abs(Math.sin(this.animationFrame * 0.15) * 3);
    const bodyY = headY + dims.headHeight - 10;

    // Dancing body (slight sway)
    this.drawBodyWithPattern(ctx, dims.centerX - dims.bodyWidth / 2 + tilt / 2, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor, traits.furPattern, palette, random);

    // Dancing arms (raised)
    this.drawDancingArms(ctx, dims.centerX + tilt / 2, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor, this.animationFrame);

    // Dancing feet
    this.drawDancingFeet(ctx, dims.centerX, bodyY, dims.bodyWidth, dims.bodyHeight, bearColor, this.animationFrame, random);

    // Head with movement
    this.drawHeadWithPattern(ctx, headX, headY, dims.headWidth, dims.headHeight, bearColor, traits.furPattern, palette, random);
    this.drawEars(ctx, headX, headY, dims.headWidth, dims.headHeight, bearColor, palette, random);
    this.drawEnhancedFace(ctx, headX, headY, dims.headWidth, dims.headHeight, rarity, palette, traits, random);

    // Musical notes around dancing bear
    this.drawMusicNotes(ctx, dims.centerX, headY, palette, random);

    // Apply accessories
    this.applyAllAccessories(ctx, headX, headY, dims.headWidth, dims.headHeight, bodyY, dims.bodyWidth, dims.bodyHeight, traits.accessories, rarity, palette, random);
  }

  private getBearColor(palette: any, pattern: BearTraits['furPattern'], random: () => number): string {
    if (pattern === 'rainbow') {
      const rainbowColors = ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
      return rainbowColors[Math.floor(random() * rainbowColors.length)];
    } else if (pattern === 'gradient') {
      return palette.bear[0]; // Base color, gradient applied in drawing
    }

    // Enhanced color selection with better harmony
    const colorChoice = random();
    if (colorChoice < 0.7) {
      // Primary bear color
      return palette.bear[0];
    } else if (colorChoice < 0.9 && palette.bear.length > 1) {
      // Secondary bear color
      return palette.bear[1];
    } else if (palette.bear.length > 2) {
      // Tertiary bear color (rare)
      return palette.bear[2];
    }

    return palette.bear[Math.floor(random() * palette.bear.length)];
  }

  private drawBodyWithPattern(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, baseColor: string, pattern: BearTraits['furPattern'], palette: any, random: () => number): void {
    // Draw base body
    this.drawEllipse(ctx, x, y, width, height, baseColor);

    // Apply pattern
    switch (pattern) {
      case 'stripes':
        this.drawStripes(ctx, x, y, width, height, palette, random);
        break;
      case 'spots':
        this.drawSpots(ctx, x, y, width, height, palette, random);
        break;
      case 'camo':
        this.drawCamo(ctx, x, y, width, height, palette, random);
        break;
      case 'gradient':
        this.drawGradient(ctx, x, y, width, height, palette, random);
        break;
      case 'rainbow':
        this.drawRainbowPattern(ctx, x, y, width, height);
        break;
    }
  }

  private drawHeadWithPattern(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, baseColor: string, pattern: BearTraits['furPattern'], palette: any, random: () => number): void {
    // Draw base head
    this.drawEllipse(ctx, x, y, width, height, baseColor);

    // Apply same pattern as body
    switch (pattern) {
      case 'stripes':
        this.drawStripes(ctx, x, y, width, height, palette, random);
        break;
      case 'spots':
        this.drawSpots(ctx, x, y, width, height, palette, random);
        break;
      case 'camo':
        this.drawCamo(ctx, x, y, width, height, palette, random);
        break;
      case 'gradient':
        this.drawGradient(ctx, x, y, width, height, palette, random);
        break;
      case 'rainbow':
        this.drawRainbowPattern(ctx, x, y, width, height);
        break;
    }
  }

  // Pattern drawing methods
  private drawStripes(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, palette: any, random: () => number): void {
    const stripeColor = palette.bear[1] || this.adjustColor(palette.bear[0], 0.7);
    const stripeWidth = 4 + Math.floor(random() * 3);

    for (let i = 0; i < width; i += stripeWidth * 2) {
      for (let j = 0; j < height; j++) {
        for (let k = 0; k < stripeWidth; k++) {
          if (i + k < width) {
            const dx = (i + k - width / 2) / (width / 2);
            const dy = (j - height / 2) / (height / 2);
            if (dx * dx + dy * dy <= 1) {
              this.drawPixel(ctx, x + i + k, y + j, stripeColor);
            }
          }
        }
      }
    }
  }

  private drawSpots(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, palette: any, random: () => number): void {
    const spotColor = palette.bear[1] || this.adjustColor(palette.bear[0], 0.6);
    const spotCount = 8 + Math.floor(random() * 8);

    for (let i = 0; i < spotCount; i++) {
      const spotX = x + Math.floor(random() * width);
      const spotY = y + Math.floor(random() * height);
      const spotSize = 3 + Math.floor(random() * 4);

      this.drawCircle(ctx, spotX, spotY, spotSize, spotColor);
    }
  }

  private drawCamo(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, palette: any, random: () => number): void {
    const camoColors = ['#4B5320', '#6B8E23', '#8B7355', '#696969'];

    for (let i = 0; i < 15; i++) {
      const blobX = x + Math.floor(random() * width);
      const blobY = y + Math.floor(random() * height);
      const blobSize = 8 + Math.floor(random() * 12);
      const blobColor = camoColors[Math.floor(random() * camoColors.length)];

      for (let bx = -blobSize / 2; bx < blobSize / 2; bx++) {
        for (let by = -blobSize / 2; by < blobSize / 2; by++) {
          if (bx * bx + by * by <= (blobSize / 2) * (blobSize / 2)) {
            const dx = ((blobX + bx - x) - width / 2) / (width / 2);
            const dy = ((blobY + by - y) - height / 2) / (height / 2);
            if (dx * dx + dy * dy <= 1 && random() > 0.2) {
              this.drawPixel(ctx, blobX + bx, blobY + by, blobColor);
            }
          }
        }
      }
    }
  }

  private drawGradient(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, palette: any, random: () => number): void {
    const color1 = palette.bear[0];
    const color2 = palette.bear[1] || palette.accent[0];

    for (let j = 0; j < height; j++) {
      const gradientFactor = j / height;
      const gradientColor = this.interpolateColor(color1, color2, gradientFactor);

      for (let i = 0; i < width; i++) {
        const dx = (i - width / 2) / (width / 2);
        const dy = (j - height / 2) / (height / 2);
        if (dx * dx + dy * dy <= 1) {
          this.drawPixel(ctx, x + i, y + j, gradientColor);
        }
      }
    }
  }

  private drawRainbowPattern(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    const rainbowColors = ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    const stripeHeight = Math.floor(height / rainbowColors.length);

    for (let c = 0; c < rainbowColors.length; c++) {
      for (let j = c * stripeHeight; j < (c + 1) * stripeHeight && j < height; j++) {
        for (let i = 0; i < width; i++) {
          const dx = (i - width / 2) / (width / 2);
          const dy = (j - height / 2) / (height / 2);
          if (dx * dx + dy * dy <= 1) {
            this.drawPixel(ctx, x + i, y + j, rainbowColors[c]);
          }
        }
      }
    }
  }

  private interpolateColor(color1: string, color2: string, factor: number): string {
    // Simple color interpolation (works with hex colors)
    if (!color1.startsWith('#') || !color2.startsWith('#')) return color1;

    const r1 = parseInt(color1.substr(1, 2), 16);
    const g1 = parseInt(color1.substr(3, 2), 16);
    const b1 = parseInt(color1.substr(5, 2), 16);

    const r2 = parseInt(color2.substr(1, 2), 16);
    const g2 = parseInt(color2.substr(3, 2), 16);
    const b2 = parseInt(color2.substr(5, 2), 16);

    const r = Math.floor(r1 + (r2 - r1) * factor);
    const g = Math.floor(g1 + (g2 - g1) * factor);
    const b = Math.floor(b1 + (b2 - b1) * factor);

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // New arm variations
  private drawCrossedArms(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bodyHeight: number, bearColor: string): void {
    // Left arm crossing to right
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 5; j++) {
        this.drawPixel(ctx, centerX - bodyWidth / 3 + i, bodyY + 15 + j, bearColor);
      }
    }
    // Right arm crossing to left
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 5; j++) {
        this.drawPixel(ctx, centerX + bodyWidth / 3 - i, bodyY + 18 + j, bearColor);
      }
    }
  }

  private drawWavingArm(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bodyHeight: number, bearColor: string, random: () => number): void {
    // Regular arm
    this.drawArms(ctx, centerX, bodyY, bodyWidth, bodyHeight, bearColor, 1);

    // Waving arm (raised)
    const waveHeight = -10 - Math.floor(random() * 5);
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 20; j++) {
        this.drawPixel(ctx, centerX + bodyWidth / 2 + i - 4, bodyY + waveHeight + j, bearColor);
      }
    }
    // Hand at top
    this.drawCircle(ctx, centerX + bodyWidth / 2, bodyY + waveHeight, 5, bearColor);
  }

  private drawMultipleArms(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bodyHeight: number, bearColor: string): void {
    // 4-6 arms for mythic multi-arm trait
    const armCount = 4 + Math.floor(Math.random() * 3);

    for (let a = 0; a < armCount; a++) {
      const angle = (Math.PI * 2 * a) / armCount;
      const armX = centerX + Math.cos(angle) * (bodyWidth / 2);
      const armY = bodyY + bodyHeight / 3 + Math.sin(angle) * 10;

      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 5; j++) {
          const x = armX + Math.cos(angle) * i;
          const y = armY + j;
          this.drawPixel(ctx, Math.floor(x), Math.floor(y), bearColor);
        }
      }
    }
  }

  private drawSingleArm(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, bearColor: string): void {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (i < width * 0.7) { // Tapered arm
          this.drawPixel(ctx, x - i / 2, y + j, bearColor);
        }
      }
    }
  }

  private drawRestingArms(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bodyHeight: number, bearColor: string): void {
    // Arms resting on lap
    const armY = bodyY + bodyHeight * 0.6;

    // Left arm
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 8; j++) {
        this.drawPixel(ctx, centerX - bodyWidth / 3 + i, armY + j, bearColor);
      }
    }

    // Right arm
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 8; j++) {
        this.drawPixel(ctx, centerX + bodyWidth / 3 - 12 + i, armY + j, bearColor);
      }
    }
  }

  private drawDancingArms(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bodyHeight: number, bearColor: string, frame: number): void {
    const leftArmAngle = Math.sin(frame * 0.1) * 0.3 - 0.5;
    const rightArmAngle = -Math.sin(frame * 0.1) * 0.3 + 0.5;

    // Left arm
    for (let i = 0; i < 20; i++) {
      const x = centerX - bodyWidth / 2 + Math.cos(leftArmAngle) * i;
      const y = bodyY + 10 + Math.sin(leftArmAngle) * i;
      for (let j = 0; j < 6; j++) {
        this.drawPixel(ctx, Math.floor(x) - j/2, Math.floor(y) + j, bearColor);
      }
    }

    // Right arm
    for (let i = 0; i < 20; i++) {
      const x = centerX + bodyWidth / 2 + Math.cos(rightArmAngle) * i;
      const y = bodyY + 10 + Math.sin(rightArmAngle) * i;
      for (let j = 0; j < 6; j++) {
        this.drawPixel(ctx, Math.floor(x) + j/2, Math.floor(y) + j, bearColor);
      }
    }
  }

  // New leg/feet variations
  private drawFullLegs(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bodyHeight: number, bearColor: string, random: () => number): void {
    const legWidth = 12;
    const legHeight = 20;

    // Left leg
    this.drawEllipse(ctx, centerX - bodyWidth / 4 - legWidth / 2, bodyY + bodyHeight - 5, legWidth, legHeight, bearColor);

    // Right leg
    this.drawEllipse(ctx, centerX + bodyWidth / 4 - legWidth / 2, bodyY + bodyHeight - 5, legWidth, legHeight, bearColor);

    // Feet
    const footWidth = 14;
    const footHeight = 8;

    // Left foot
    this.drawEllipse(ctx, centerX - bodyWidth / 4 - footWidth / 2, bodyY + bodyHeight + legHeight - 8, footWidth, footHeight, bearColor);

    // Right foot
    this.drawEllipse(ctx, centerX + bodyWidth / 4 - footWidth / 2, bodyY + bodyHeight + legHeight - 8, footWidth, footHeight, bearColor);
  }

  private drawSittingLegs(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bearColor: string, random: () => number): void {
    // Legs stretched forward
    const legLength = 25;
    const legHeight = 12;

    // Left leg
    for (let i = 0; i < legLength; i++) {
      for (let j = 0; j < legHeight; j++) {
        this.drawPixel(ctx, centerX - bodyWidth / 4 - legHeight / 2 + j, bodyY + i, bearColor);
      }
    }

    // Right leg
    for (let i = 0; i < legLength; i++) {
      for (let j = 0; j < legHeight; j++) {
        this.drawPixel(ctx, centerX + bodyWidth / 4 - legHeight / 2 + j, bodyY + i, bearColor);
      }
    }

    // Feet at end
    this.drawCircle(ctx, centerX - bodyWidth / 4, bodyY + legLength, 6, bearColor);
    this.drawCircle(ctx, centerX + bodyWidth / 4, bodyY + legLength, 6, bearColor);
  }

  private drawDancingFeet(ctx: CanvasRenderingContext2D, centerX: number, bodyY: number, bodyWidth: number, bodyHeight: number, bearColor: string, frame: number, random: () => number): void {
    const leftLift = Math.abs(Math.sin(frame * 0.2)) * 5;
    const rightLift = Math.abs(Math.cos(frame * 0.2)) * 5;

    const feetY = bodyY + bodyHeight - 8;

    // Left foot (with lift)
    this.drawEllipse(ctx, centerX - bodyWidth / 4 - 5, feetY - leftLift, 12, 10, bearColor);

    // Right foot (with lift)
    this.drawEllipse(ctx, centerX + bodyWidth / 4 - 5, feetY - rightLift, 12, 10, bearColor);

    // Motion lines
    if (leftLift > 2) {
      for (let i = 0; i < 3; i++) {
        this.drawPixel(ctx, centerX - bodyWidth / 4, feetY + i, '#999');
      }
    }
    if (rightLift > 2) {
      for (let i = 0; i < 3; i++) {
        this.drawPixel(ctx, centerX + bodyWidth / 4, feetY + i, '#999');
      }
    }
  }

  // Angled drawing methods for 3/4 view
  private drawAngledBody(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, bearColor: string, pattern: BearTraits['furPattern'], palette: any, random: () => number): void {
    // Slightly skewed ellipse for 3/4 view
    for (let i = 0; i < width * 0.9; i++) {
      for (let j = 0; j < height; j++) {
        const dx = (i - width * 0.45) / (width * 0.45);
        const dy = (j - height / 2) / (height / 2);
        if (dx * dx + dy * dy <= 1) {
          this.drawPixel(ctx, x + i + j * 0.05, y + j, bearColor);
        }
      }
    }

    // Apply pattern if needed
    if (pattern !== 'solid') {
      this.drawBodyWithPattern(ctx, x, y, width * 0.9, height, bearColor, pattern, palette, random);
    }
  }

  private drawAngledHead(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, bearColor: string, pattern: BearTraits['furPattern'], palette: any, random: () => number): void {
    // Slightly skewed head for 3/4 view
    for (let i = 0; i < width * 0.85; i++) {
      for (let j = 0; j < height; j++) {
        const dx = (i - width * 0.425) / (width * 0.425);
        const dy = (j - height / 2) / (height / 2);
        if (dx * dx + dy * dy <= 1) {
          this.drawPixel(ctx, x + i + j * 0.03, y + j, bearColor);
        }
      }
    }
  }

  private drawAngledEars(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, bearColor: string, palette: any, random: () => number): void {
    const earSize = 11 + Math.floor(random() * 5);

    // Back ear (smaller, partially hidden)
    this.drawCircle(ctx, headX + 10, headY + 6, earSize * 0.7, bearColor);

    // Front ear (full size)
    this.drawCircle(ctx, headX + headWidth - 20, headY + 4, earSize, bearColor);

    // Inner ear details
    this.drawCircle(ctx, headX + headWidth - 20, headY + 4, earSize - 4, '#D2B48C');
  }

  private drawAngledFace(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, rarity: Rarity, palette: any, traits: BearTraits, random: () => number): void {
    // Adjusted positions for 3/4 view
    const eyeOffset = -5;

    // Far eye (smaller)
    this.drawCircle(ctx, headX + 15 + eyeOffset, headY + 22, 3, '#FFF');
    this.drawCircle(ctx, headX + 15 + eyeOffset, headY + 22, 2, '#000');

    // Near eye (normal size)
    this.drawCircle(ctx, headX + headWidth - 30 + eyeOffset, headY + 22, 4, '#FFF');
    this.drawCircle(ctx, headX + headWidth - 30 + eyeOffset, headY + 22, 2, '#000');

    // Snout (offset)
    const snoutWidth = 20;
    const snoutHeight = 14;
    this.drawEllipse(ctx, headX + headWidth / 2 - 15, headY + 38, snoutWidth, snoutHeight, '#6B5637');

    // Nose
    this.drawNose(ctx, headX + headWidth / 2 - 5, headY + 42, 0);

    // Mouth (angled)
    for (let i = -4; i <= 3; i++) {
      this.drawPixel(ctx, headX + headWidth / 2 - 5 + i, headY + 48, '#000');
    }
  }

  private drawMusicNotes(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, palette: any, random: () => number): void {
    const notePositions = [
      { x: centerX - 30, y: centerY - 10 },
      { x: centerX + 25, y: centerY - 15 },
      { x: centerX - 20, y: centerY + 30 },
      { x: centerX + 30, y: centerY + 25 }
    ];

    notePositions.forEach(pos => {
      // Note stem
      for (let i = 0; i < 6; i++) {
        this.drawPixel(ctx, pos.x + 3, pos.y - i, '#000');
      }
      // Note head
      this.drawCircle(ctx, pos.x, pos.y, 2, '#000');
      // Flag
      this.drawPixel(ctx, pos.x + 3, pos.y - 6, '#000');
      this.drawPixel(ctx, pos.x + 4, pos.y - 5, '#000');
      this.drawPixel(ctx, pos.x + 5, pos.y - 4, '#000');
    });
  }

  private drawEnhancedFace(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, rarity: Rarity, palette: any, traits: BearTraits, random: () => number): void {
    // Enhanced facial features with more variety
    this.drawFacialFeatures(ctx, headX, headY, headWidth, headHeight, rarity, palette, random);

    // Special eyes for special traits
    if (traits.specialTrait === 'laser') {
      this.drawLaserEyes(ctx, headX, headY, headWidth, headHeight);
    }
  }

  private drawLaserEyes(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number): void {
    const eyeY = headY + 22;

    // Glowing red eyes
    this.drawCircle(ctx, headX + 20, eyeY, 4, '#FF0000');
    this.drawCircle(ctx, headX + headWidth - 20, eyeY, 4, '#FF0000');

    // Laser beams
    for (let i = 0; i < 30; i++) {
      this.drawPixel(ctx, headX + 20, eyeY + i, '#FF000066');
      this.drawPixel(ctx, headX + 21, eyeY + i, '#FF000066');
      this.drawPixel(ctx, headX + headWidth - 20, eyeY + i, '#FF000066');
      this.drawPixel(ctx, headX + headWidth - 19, eyeY + i, '#FF000066');
    }
  }

  private applyAllAccessories(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, bodyY: number, bodyWidth: number, bodyHeight: number, accessories: string[], rarity: Rarity, palette: any, random: () => number): void {
    accessories.forEach(accessory => {
      switch (accessory) {
        case 'crown':
          this.drawCrown(ctx, headX, headY, headWidth, rarity);
          break;
        case 'sunglasses':
          this.drawSunglasses(ctx, headX, headY, headWidth, headHeight);
          break;
        case 'chain':
        case 'bling-chain':
          if (rarity === 'mythic') {
            this.addMythicBlingChain(ctx, headX, headY, headWidth, headHeight, bodyY, bodyWidth, bodyHeight, random);
          } else {
            this.drawBasicChain(ctx, bodyY, bodyWidth, rarity);
          }
          break;
        case 'headphones':
          this.drawHeadphones(ctx, headX, headY, headWidth, headHeight, random);
          break;
        case 'wings':
          this.drawWings(ctx, headX - 20, bodyY, palette);
          break;
        case 'halo':
          this.drawHalo(ctx, headX + headWidth / 2, headY - 10);
          break;
        case 'third-eye':
          this.drawThirdEye(ctx, headX + headWidth / 2, headY + 10, palette);
          break;
        // Add more accessories as needed
      }
    });
  }

  private drawCrown(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, rarity: Rarity): void {
    const crownColor = rarity === 'legendary' ? '#FFD700' : (rarity === 'mythic' ? '#00FFFF' : '#C77DFF');
    const centerX = headX + headWidth / 2;

    // Base of crown
    for (let i = -headWidth / 3; i < headWidth / 3; i++) {
      this.drawPixel(ctx, centerX + i, headY - 3, crownColor);
      this.drawPixel(ctx, centerX + i, headY - 2, crownColor);
    }

    // Crown peaks with jewels
    for (let p = 0; p < 5; p++) {
      const peakX = centerX - headWidth / 4 + p * (headWidth / 8);
      for (let j = 0; j < 8; j++) {
        this.drawPixel(ctx, peakX, headY - 3 - j, crownColor);
        this.drawPixel(ctx, peakX + 1, headY - 3 - j, crownColor);
      }
      // Jewel
      this.drawPixel(ctx, peakX, headY - 8, '#FF0000');
      this.drawPixel(ctx, peakX + 1, headY - 8, '#FF0000');
    }
  }

  private drawSunglasses(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number): void {
    const glassY = headY + 22;

    // Lenses
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 6; j++) {
        this.drawPixel(ctx, headX + 15 + i, glassY + j, '#000');
        this.drawPixel(ctx, headX + headWidth - 27 + i, glassY + j, '#000');
      }
    }

    // Bridge
    for (let i = 27; i < headWidth - 27; i++) {
      this.drawPixel(ctx, headX + i, glassY + 2, '#000');
    }
  }

  private drawBasicChain(ctx: CanvasRenderingContext2D, bodyY: number, bodyWidth: number, rarity: Rarity): void {
    const chainY = bodyY + 5;
    const chainColor = rarity === 'legendary' ? '#FFD700' : '#C0C0C0';

    for (let i = 10; i < bodyWidth - 10; i += 3) {
      this.drawPixel(ctx, 50 - bodyWidth / 2 + i, chainY, chainColor);
      this.drawPixel(ctx, 50 - bodyWidth / 2 + i, chainY + 1, chainColor);
    }
  }

  private drawHeadphones(ctx: CanvasRenderingContext2D, headX: number, headY: number, headWidth: number, headHeight: number, random: () => number): void {
    const phoneColor = ['#FF0000', '#0000FF', '#00FF00', '#000000', '#FFFFFF'][Math.floor(random() * 5)];

    // Headband
    for (let i = headX + 8; i < headX + headWidth - 8; i++) {
      this.drawPixel(ctx, i, headY - 4, phoneColor);
      this.drawPixel(ctx, i, headY - 3, phoneColor);
      this.drawPixel(ctx, i, headY - 2, phoneColor);
    }

    // Ear cups
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 14; j++) {
        this.drawPixel(ctx, headX + 3 + i, headY + 18 + j, phoneColor);
        this.drawPixel(ctx, headX + headWidth - 13 + i, headY + 18 + j, phoneColor);
      }
    }

    // Speaker mesh detail
    for (let i = 2; i < 8; i += 2) {
      for (let j = 2; j < 10; j += 2) {
        this.drawPixel(ctx, headX + 3 + i, headY + 18 + j, '#333');
        this.drawPixel(ctx, headX + headWidth - 13 + i, headY + 18 + j, '#333');
      }
    }
  }

  private drawWings(ctx: CanvasRenderingContext2D, x: number, y: number, palette: any): void {
    const wingColor = '#FFFFFF';

    // Left wing
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 30; j++) {
        if (i < 15 - Math.abs(j - 15) / 2) {
          this.drawPixel(ctx, x - i, y + j, wingColor + '99');
        }
      }
    }

    // Right wing
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 30; j++) {
        if (i < 15 - Math.abs(j - 15) / 2) {
          this.drawPixel(ctx, x + 100 + i, y + j, wingColor + '99');
        }
      }
    }

    // Wing details (feathers)
    for (let f = 0; f < 5; f++) {
      this.drawPixel(ctx, x - 10, y + 5 + f * 5, '#E0E0E0');
      this.drawPixel(ctx, x + 110, y + 5 + f * 5, '#E0E0E0');
    }
  }

  private drawHalo(ctx: CanvasRenderingContext2D, centerX: number, y: number): void {
    const haloColor = '#FFFF00';

    // Elliptical halo
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const hx = centerX + Math.cos(angle) * 20;
      const hy = y + Math.sin(angle) * 5;
      this.drawPixel(ctx, Math.floor(hx), Math.floor(hy), haloColor);
      this.drawPixel(ctx, Math.floor(hx) + 1, Math.floor(hy), haloColor);
    }

    // Glow effect
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
      const hx = centerX + Math.cos(angle) * 22;
      const hy = y + Math.sin(angle) * 6;
      this.drawPixel(ctx, Math.floor(hx), Math.floor(hy), haloColor + '66');
    }
  }

  private drawThirdEye(ctx: CanvasRenderingContext2D, centerX: number, y: number, palette: any): void {
    // Eye outline
    for (let i = -4; i <= 4; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.abs(i) + Math.abs(j) <= 4) {
          this.drawPixel(ctx, centerX + i, y + j, '#FFF');
        }
      }
    }

    // Mystical pupil
    this.drawCircle(ctx, centerX, y, 2, palette.accent[0]);

    // Inner glow
    this.drawPixel(ctx, centerX, y, '#FFFFFF');
  }

  private drawProps(ctx: CanvasRenderingContext2D, props: string[], palette: any, random: () => number): void {
    props.forEach(prop => {
      switch (prop) {
        case 'money':
          this.drawFloatingMoney(ctx, random);
          break;
        case 'hearts':
          this.drawFloatingHearts(ctx, palette, random);
          break;
        case 'stars':
          this.drawFloatingStars(ctx, palette, random);
          break;
        case 'butterflies':
          this.drawButterflies(ctx, random);
          break;
        case 'sword':
          this.drawSword(ctx, random);
          break;
        case 'phone':
          this.drawPhone(ctx, random);
          break;
        case 'flower':
          this.drawFlower(ctx, random);
          break;
        case 'bird':
          this.drawBird(ctx, palette, random);
          break;
      }
    });
  }

  private drawFloatingMoney(ctx: CanvasRenderingContext2D, random: () => number): void {
    for (let m = 0; m < 8; m++) {
      const x = 10 + Math.floor(random() * 80);
      const y = 10 + Math.floor(random() * 80);

      // Dollar bill shape
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 4; j++) {
          this.drawPixel(ctx, x + i, y + j, '#00FF00');
        }
      }

      // $ symbol
      this.drawPixel(ctx, x + 3, y + 1, '#006600');
      this.drawPixel(ctx, x + 4, y + 1, '#006600');
      this.drawPixel(ctx, x + 3, y + 2, '#006600');
      this.drawPixel(ctx, x + 4, y + 2, '#006600');
    }
  }

  private drawFloatingHearts(ctx: CanvasRenderingContext2D, palette: any, random: () => number): void {
    const heartColors = ['#FF1493', '#FF69B4', '#FFB6C1'];

    for (let h = 0; h < 6; h++) {
      const x = 10 + Math.floor(random() * 80);
      const y = 10 + Math.floor(random() * 80);
      const color = heartColors[Math.floor(random() * heartColors.length)];

      // Heart shape
      this.drawPixel(ctx, x + 1, y, color);
      this.drawPixel(ctx, x + 2, y, color);
      this.drawPixel(ctx, x + 4, y, color);
      this.drawPixel(ctx, x + 5, y, color);

      for (let i = 0; i < 6; i++) {
        this.drawPixel(ctx, x + i, y + 1, color);
      }
      for (let i = 1; i < 5; i++) {
        this.drawPixel(ctx, x + i, y + 2, color);
      }
      this.drawPixel(ctx, x + 2, y + 3, color);
      this.drawPixel(ctx, x + 3, y + 3, color);
    }
  }

  private drawFloatingStars(ctx: CanvasRenderingContext2D, palette: any, random: () => number): void {
    for (let s = 0; s < 10; s++) {
      const x = Math.floor(random() * 100);
      const y = Math.floor(random() * 100);
      const size = 2 + Math.floor(random() * 3);
      const color = palette.accent[Math.floor(random() * palette.accent.length)];

      this.drawStar(ctx, x, y, size, color);
    }
  }

  private drawButterflies(ctx: CanvasRenderingContext2D, random: () => number): void {
    const butterflyColors = ['#FF69B4', '#87CEEB', '#FFD700', '#E6E6FA'];

    for (let b = 0; b < 3; b++) {
      const x = 10 + Math.floor(random() * 80);
      const y = 10 + Math.floor(random() * 80);
      const color = butterflyColors[Math.floor(random() * butterflyColors.length)];

      // Body
      this.drawPixel(ctx, x, y, '#000');
      this.drawPixel(ctx, x, y + 1, '#000');
      this.drawPixel(ctx, x, y + 2, '#000');

      // Wings
      // Left wing
      for (let i = 1; i <= 3; i++) {
        for (let j = 0; j < 3; j++) {
          this.drawPixel(ctx, x - i, y + j, color);
        }
      }

      // Right wing
      for (let i = 1; i <= 3; i++) {
        for (let j = 0; j < 3; j++) {
          this.drawPixel(ctx, x + i, y + j, color);
        }
      }
    }
  }

  private drawSword(ctx: CanvasRenderingContext2D, random: () => number): void {
    const x = 80;
    const y = 30;

    // Blade
    for (let i = 0; i < 20; i++) {
      this.drawPixel(ctx, x, y + i, '#C0C0C0');
      this.drawPixel(ctx, x + 1, y + i, '#C0C0C0');
    }

    // Point
    this.drawPixel(ctx, x, y - 1, '#C0C0C0');

    // Guard
    for (let i = -3; i <= 4; i++) {
      this.drawPixel(ctx, x + i, y + 20, '#8B4513');
    }

    // Handle
    for (let i = 0; i < 6; i++) {
      this.drawPixel(ctx, x, y + 21 + i, '#4B2F20');
      this.drawPixel(ctx, x + 1, y + 21 + i, '#4B2F20');
    }
  }

  private drawPhone(ctx: CanvasRenderingContext2D, random: () => number): void {
    const x = 15;
    const y = 60;

    // Phone body
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 14; j++) {
        this.drawPixel(ctx, x + i, y + j, '#000');
      }
    }

    // Screen
    for (let i = 1; i < 7; i++) {
      for (let j = 2; j < 11; j++) {
        this.drawPixel(ctx, x + i, y + j, '#4169E1');
      }
    }

    // Home button
    this.drawPixel(ctx, x + 3, y + 12, '#333');
    this.drawPixel(ctx, x + 4, y + 12, '#333');
  }

  private drawFlower(ctx: CanvasRenderingContext2D, random: () => number): void {
    const x = 85;
    const y = 70;

    // Stem
    for (let i = 0; i < 10; i++) {
      this.drawPixel(ctx, x, y + 5 + i, '#228B22');
    }

    // Leaves
    this.drawPixel(ctx, x - 1, y + 8, '#228B22');
    this.drawPixel(ctx, x - 2, y + 8, '#228B22');
    this.drawPixel(ctx, x + 1, y + 10, '#228B22');
    this.drawPixel(ctx, x + 2, y + 10, '#228B22');

    // Petals
    const petalColor = ['#FFB6C1', '#FF69B4', '#FF1493'][Math.floor(random() * 3)];

    // Center
    this.drawPixel(ctx, x, y + 2, '#FFFF00');

    // Petals around center
    this.drawPixel(ctx, x, y + 1, petalColor);
    this.drawPixel(ctx, x - 1, y + 2, petalColor);
    this.drawPixel(ctx, x + 1, y + 2, petalColor);
    this.drawPixel(ctx, x, y + 3, petalColor);

    this.drawPixel(ctx, x - 1, y + 1, petalColor);
    this.drawPixel(ctx, x + 1, y + 1, petalColor);
    this.drawPixel(ctx, x - 1, y + 3, petalColor);
    this.drawPixel(ctx, x + 1, y + 3, petalColor);
  }

  private drawBird(ctx: CanvasRenderingContext2D, palette: any, random: () => number): void {
    const x = 70 + Math.floor(random() * 20);
    const y = 15 + Math.floor(random() * 10);

    // Body
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        this.drawPixel(ctx, x + i, y + j, '#1E90FF');
      }
    }

    // Head
    this.drawPixel(ctx, x + 4, y + 1, '#1E90FF');
    this.drawPixel(ctx, x + 5, y + 1, '#1E90FF');

    // Beak
    this.drawPixel(ctx, x + 6, y + 1, '#FFA500');

    // Wing
    this.drawPixel(ctx, x + 1, y - 1, '#4169E1');
    this.drawPixel(ctx, x + 2, y - 1, '#4169E1');

    // Eye
    this.drawPixel(ctx, x + 4, y + 1, '#000');
  }

  private drawEnhancedBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, palette: any, rarity: Rarity, backgroundType: BearTraits['backgroundType'], random: () => number): void {
    switch (backgroundType) {
      case 'scene':
        this.drawSceneBackground(ctx, canvas, random);
        break;
      case 'abstract':
        this.drawAbstractBackground(ctx, canvas, palette, random);
        break;
      case 'weather':
        this.drawWeatherBackground(ctx, canvas, rarity, random);
        break;
      case 'time':
        this.drawTimeBackground(ctx, canvas, random);
        break;
      default:
        this.drawBackground(ctx, canvas, palette, rarity, random);
    }
  }

  private drawSceneBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, random: () => number): void {
    const sceneType = Math.floor(random() * 4);

    if (sceneType === 0) { // City skyline
      // Sky
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Buildings
      for (let b = 0; b < 8; b++) {
        const buildingX = b * 110;
        const buildingHeight = 200 + Math.floor(random() * 300);
        const buildingWidth = 80 + Math.floor(random() * 40);

        ctx.fillStyle = '#2a2a3e';
        ctx.fillRect(buildingX, canvas.height - buildingHeight, buildingWidth, buildingHeight);

        // Windows
        for (let w = 0; w < 4; w++) {
          for (let h = 0; h < buildingHeight / 40; h++) {
            if (random() > 0.3) {
              ctx.fillStyle = '#FFFF00';
              ctx.fillRect(buildingX + 10 + w * 20, canvas.height - buildingHeight + 20 + h * 40, 10, 10);
            }
          }
        }
      }
    } else if (sceneType === 1) { // Forest
      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#98FB98');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Trees
      for (let t = 0; t < 12; t++) {
        const treeX = Math.floor(random() * 100);
        const treeY = 50 + Math.floor(random() * 30);
        const treeSize = 15 + Math.floor(random() * 10);

        // Tree trunk
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 15; j++) {
            this.drawPixel(ctx, treeX + i + treeSize / 2 - 2, treeY + treeSize + j, '#8B4513');
          }
        }

        // Tree crown
        this.drawCircle(ctx, treeX + treeSize / 2, treeY + treeSize / 2, treeSize, '#228B22');
      }
    } else if (sceneType === 2) { // Space
      // Black space
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (let s = 0; s < 100; s++) {
        const x = Math.floor(random() * 100);
        const y = Math.floor(random() * 100);
        const brightness = Math.floor(random() * 3);
        const color = brightness === 0 ? '#FFFFFF' : brightness === 1 ? '#FFFFAA' : '#AAAAFF';
        this.drawPixel(ctx, x, y, color);
      }

      // Planets
      if (random() > 0.5) {
        const planetX = 20 + Math.floor(random() * 60);
        const planetY = 20 + Math.floor(random() * 60);
        this.drawCircle(ctx, planetX, planetY, 8, '#FF6B35');
        // Rings
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const rx = planetX + Math.cos(angle) * 12;
          const ry = planetY + Math.sin(angle) * 4;
          this.drawPixel(ctx, Math.floor(rx), Math.floor(ry), '#FFD700');
        }
      }
    } else { // Underwater
      // Water gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#006994');
      gradient.addColorStop(1, '#00334d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bubbles
      for (let b = 0; b < 20; b++) {
        const bubbleX = Math.floor(random() * 100);
        const bubbleY = Math.floor(random() * 100);
        const bubbleSize = 2 + Math.floor(random() * 4);

        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
          const bx = bubbleX + Math.cos(angle) * bubbleSize;
          const by = bubbleY + Math.sin(angle) * bubbleSize;
          this.drawPixel(ctx, Math.floor(bx), Math.floor(by), '#87CEEB66');
        }
      }

      // Fish instead of seaweed
      for (let f = 0; f < 3; f++) {
        const fishX = 10 + Math.floor(random() * 80);
        const fishY = 50 + Math.floor(random() * 40);
        const fishColor = ['#FF6B35', '#FFD700', '#FF69B4'][f % 3];

        // Fish body
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 3; j++) {
            this.drawPixel(ctx, fishX + i, fishY + j, fishColor);
          }
        }
        // Fish tail
        this.drawPixel(ctx, fishX - 1, fishY, fishColor);
        this.drawPixel(ctx, fishX - 2, fishY + 1, fishColor);
        this.drawPixel(ctx, fishX - 1, fishY + 2, fishColor);
        // Fish eye
        this.drawPixel(ctx, fishX + 4, fishY + 1, '#000');
      }
    }
  }

  private drawAbstractBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, palette: any, random: () => number): void {
    const patternType = Math.floor(random() * 4);

    if (patternType === 0) { // Spiral
      const centerX = 50;
      const centerY = 50;

      for (let angle = 0; angle < Math.PI * 20; angle += 0.1) {
        const radius = angle * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (x >= 0 && x < 100 && y >= 0 && y < 100) {
          const color = palette.accent[Math.floor((angle / Math.PI) % palette.accent.length)];
          this.drawPixel(ctx, Math.floor(x), Math.floor(y), color);
          this.drawPixel(ctx, Math.floor(x) + 1, Math.floor(y), color);
          this.drawPixel(ctx, Math.floor(x), Math.floor(y) + 1, color);
        }
      }
    } else if (patternType === 1) { // Fractal-like
      for (let i = 0; i < 100; i += 5) {
        for (let j = 0; j < 100; j += 5) {
          const value = Math.sin(i * 0.1) * Math.cos(j * 0.1);
          const color = value > 0 ? palette.accent[0] : palette.accent[1];

          for (let di = 0; di < 5; di++) {
            for (let dj = 0; dj < 5; dj++) {
              if (Math.abs(value) > 0.5) {
                this.drawPixel(ctx, i + di, j + dj, color);
              }
            }
          }
        }
      }
    } else if (patternType === 2) { // Waves
      for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
          const wave1 = Math.sin(x * 0.1 + y * 0.05) * 0.5 + 0.5;
          const wave2 = Math.sin(x * 0.05 + y * 0.1) * 0.5 + 0.5;
          const combined = (wave1 + wave2) / 2;

          if (combined > 0.6) {
            const color = palette.accent[Math.floor(combined * palette.accent.length)];
            this.drawPixel(ctx, x, y, color);
          }
        }
      }
    } else { // Geometric
      // Triangles
      for (let i = 0; i < 8; i++) {
        const x1 = Math.floor(random() * 100);
        const y1 = Math.floor(random() * 100);
        const size = 10 + Math.floor(random() * 20);
        const color = palette.accent[i % palette.accent.length];

        // Draw triangle
        for (let y = 0; y < size; y++) {
          for (let x = -y; x <= y; x++) {
            if (x1 + x >= 0 && x1 + x < 100 && y1 + y >= 0 && y1 + y < 100) {
              this.drawPixel(ctx, x1 + x, y1 + y, color + '66');
            }
          }
        }
      }
    }
  }

  private drawWeatherBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, rarity: Rarity, random: () => number): void {
    const weatherType = Math.floor(random() * 4);

    // Base sky
    ctx.fillStyle = weatherType === 0 ? '#87CEEB' : weatherType === 1 ? '#696969' : weatherType === 2 ? '#4B0082' : '#FFA500';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (weatherType === 0) { // Sunny
      // Sun
      this.drawCircle(ctx, 80, 20, 10, '#FFD700');

      // Sun rays
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        const x1 = 80 + Math.cos(angle) * 12;
        const y1 = 20 + Math.sin(angle) * 12;
        const x2 = 80 + Math.cos(angle) * 20;
        const y2 = 20 + Math.sin(angle) * 20;

        for (let i = 0; i < 8; i++) {
          const x = x1 + (x2 - x1) * i / 8;
          const y = y1 + (y2 - y1) * i / 8;
          this.drawPixel(ctx, Math.floor(x), Math.floor(y), '#FFD700');
        }
      }
    } else if (weatherType === 1) { // Rainy
      // Rain drops
      for (let r = 0; r < 100; r++) {
        const x = Math.floor(random() * 100);
        const y = Math.floor(random() * 100);

        for (let i = 0; i < 4; i++) {
          this.drawPixel(ctx, x, y + i, '#4169E1');
        }
      }

      // Clouds
      for (let c = 0; c < 3; c++) {
        const cloudX = 10 + c * 30;
        const cloudY = 10 + Math.floor(random() * 10);

        this.drawCircle(ctx, cloudX, cloudY, 8, '#A9A9A9');
        this.drawCircle(ctx, cloudX + 8, cloudY, 8, '#A9A9A9');
        this.drawCircle(ctx, cloudX + 4, cloudY - 4, 6, '#A9A9A9');
      }
    } else if (weatherType === 2) { // Lightning
      // Dark clouds
      for (let y = 0; y < 30; y++) {
        for (let x = 0; x < 100; x++) {
          if (random() > 0.3) {
            this.drawPixel(ctx, x, y, '#2F2F4F');
          }
        }
      }

      // Lightning bolt
      const lightningX = 40 + Math.floor(random() * 20);
      const points = [
        { x: lightningX, y: 10 },
        { x: lightningX - 5, y: 25 },
        { x: lightningX + 2, y: 30 },
        { x: lightningX - 3, y: 50 },
        { x: lightningX + 5, y: 55 },
        { x: lightningX - 2, y: 80 }
      ];

      for (let i = 0; i < points.length - 1; i++) {
        const steps = 20;
        for (let s = 0; s < steps; s++) {
          const x = points[i].x + (points[i + 1].x - points[i].x) * s / steps;
          const y = points[i].y + (points[i + 1].y - points[i].y) * s / steps;
          this.drawPixel(ctx, Math.floor(x), Math.floor(y), '#FFFF00');
          this.drawPixel(ctx, Math.floor(x) + 1, Math.floor(y), '#FFFFFF');
        }
      }
    } else { // Sunset/sunrise
      // Gradient sky
      for (let y = 0; y < 100; y++) {
        const factor = y / 100;
        const r = Math.floor(255 * (1 - factor) + 100 * factor);
        const g = Math.floor(165 * (1 - factor) + 50 * factor);
        const b = Math.floor(0 * (1 - factor) + 150 * factor);
        const color = `rgb(${r}, ${g}, ${b})`;

        for (let x = 0; x < 100; x++) {
          ctx.fillStyle = color;
          ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
        }
      }

      // Setting/rising sun
      this.drawCircle(ctx, 50, 70, 15, '#FFD700');
    }
  }

  private drawTimeBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, random: () => number): void {
    const timeType = Math.floor(random() * 4); // morning, day, evening, night

    if (timeType === 0) { // Morning
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#FFE4B5');
      gradient.addColorStop(0.5, '#FFB6C1');
      gradient.addColorStop(1, '#87CEEB');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Morning sun
      this.drawCircle(ctx, 20, 30, 8, '#FFD700');
    } else if (timeType === 1) { // Day
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clouds
      for (let c = 0; c < 4; c++) {
        const cloudX = Math.floor(random() * 80);
        const cloudY = 10 + Math.floor(random() * 20);

        this.drawCircle(ctx, cloudX, cloudY, 6, '#FFFFFF');
        this.drawCircle(ctx, cloudX + 6, cloudY, 6, '#FFFFFF');
        this.drawCircle(ctx, cloudX + 3, cloudY - 3, 5, '#FFFFFF');
      }
    } else if (timeType === 2) { // Evening
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#FF6347');
      gradient.addColorStop(0.5, '#FF8C00');
      gradient.addColorStop(1, '#4B0082');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Setting sun
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
          if (i * i / 400 + j * j / 100 <= 1) {
            this.drawPixel(ctx, 70 + i - 10, 60 + j, '#FF4500');
          }
        }
      }
    } else { // Night
      ctx.fillStyle = '#000033';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (let s = 0; s < 50; s++) {
        const x = Math.floor(random() * 100);
        const y = Math.floor(random() * 100);
        this.drawPixel(ctx, x, y, '#FFFFFF');

        if (random() > 0.8) {
          // Twinkling effect
          this.drawPixel(ctx, x - 1, y, '#FFFFFF66');
          this.drawPixel(ctx, x + 1, y, '#FFFFFF66');
          this.drawPixel(ctx, x, y - 1, '#FFFFFF66');
          this.drawPixel(ctx, x, y + 1, '#FFFFFF66');
        }
      }

      // Moon
      this.drawCircle(ctx, 75, 20, 8, '#F0E68C');
      // Moon craters
      this.drawCircle(ctx, 73, 18, 2, '#D3D3A0');
      this.drawCircle(ctx, 77, 22, 1, '#D3D3A0');
    }
  }

  private applySpecialTrait(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, trait: BearTraits['specialTrait'], palette: any, random: () => number): void {
    switch (trait) {
      case 'glitch':
        this.addGlitchEffect(ctx, random);
        break;
      case 'holographic':
        this.addHolographicEffect(ctx, canvas);
        break;
      case 'ghost':
        this.addGhostEffect(ctx, canvas);
        break;
      case 'floating':
        this.addFloatingEffect(ctx, canvas);
        break;
      case 'pixelshift':
        this.addPixelShiftEffect(ctx, canvas, random);
        break;
      case 'invisible':
        this.addInvisibleEffect(ctx, canvas);
        break;
    }
  }

  private addHolographicEffect(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Add iridescent overlay
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // If pixel is not transparent
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);

        // Create rainbow shift based on position
        const hueShift = (x + y) * 2;

        // Add holographic shimmer
        data[i] = Math.min(255, data[i] + Math.sin(hueShift * 0.1) * 30);
        data[i + 1] = Math.min(255, data[i + 1] + Math.cos(hueShift * 0.1) * 30);
        data[i + 2] = Math.min(255, data[i + 2] + Math.sin(hueShift * 0.1 + Math.PI) * 30);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private addGhostEffect(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Make bear semi-transparent
    ctx.globalAlpha = 0.6;

    // Add ghostly aura
    const centerX = 50;
    const centerY = 50;

    for (let r = 30; r < 45; r += 2) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (x >= 0 && x < 100 && y >= 0 && y < 100) {
          this.drawPixel(ctx, Math.floor(x), Math.floor(y), '#E0E0FF33');
        }
      }
    }

    ctx.globalAlpha = 1.0;
  }

  private addFloatingEffect(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Add shadow beneath floating bear
    const shadowY = 85;
    const shadowWidth = 40;
    const shadowHeight = 6;

    for (let i = 0; i < shadowWidth; i++) {
      for (let j = 0; j < shadowHeight; j++) {
        const dx = (i - shadowWidth / 2) / (shadowWidth / 2);
        const dy = j / shadowHeight;
        const alpha = (1 - Math.sqrt(dx * dx + dy * dy)) * 0.3;

        if (alpha > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
          ctx.fillRect((50 - shadowWidth / 2 + i) * this.pixelSize, (shadowY + j) * this.pixelSize, this.pixelSize, this.pixelSize);
        }
      }
    }

    // Motion lines
    for (let i = 0; i < 5; i++) {
      const x = 35 + i * 8;
      this.drawPixel(ctx, x, 60, '#FFFFFF66');
      this.drawPixel(ctx, x + 1, 61, '#FFFFFF66');
      this.drawPixel(ctx, x - 1, 62, '#FFFFFF66');
    }
  }

  private addPixelShiftEffect(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, random: () => number): void {
    // Randomly shift some pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
      if (random() < 0.1) { // 10% chance to shift
        const offset = (Math.floor(random() * 5) - 2) * 4;
        const newIndex = i + offset;

        if (newIndex >= 0 && newIndex < data.length - 3) {
          data[i] = tempData[newIndex];
          data[i + 1] = tempData[newIndex + 1];
          data[i + 2] = tempData[newIndex + 2];
          data[i + 3] = tempData[newIndex + 3];
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private addInvisibleEffect(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Show only outline and accessories
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);

    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw only edges
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4;

        // Check if this pixel is on an edge
        let isEdge = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const neighborIdx = ((y + dy) * canvas.width + (x + dx)) * 4;
            if (data[idx + 3] > 0 && data[neighborIdx + 3] === 0) {
              isEdge = true;
              break;
            }
          }
        }

        if (isEdge) {
          ctx.fillStyle = `rgba(${data[idx]}, ${data[idx + 1]}, ${data[idx + 2]}, 0.5)`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  // Helper methods from original code
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

    // Eyes with more variations (now 12 types)
    const eyeType = Math.floor(random() * 12);
    const eyeY = headY + 22;
    this.drawEyes(ctx, headX + 20, eyeY, headX + headWidth - 20, eyeY, eyeType);

    // Add eye accessories (glasses, monocle, etc.)
    if (random() > 0.7) {
      this.addEyeAccessory(ctx, headX, headY, headWidth, headHeight, random);
    }

    // Snout with variations
    const snoutWidth = 24 + Math.floor(random() * 8);
    const snoutHeight = 16 + Math.floor(random() * 5);
    const snoutColor = random() > 0.8 ? palette.bear[1] || '#6B5637' : '#6B5637';
    this.drawEllipse(ctx, 50 - snoutWidth / 2, headY + 38, snoutWidth, snoutHeight, snoutColor);

    // Nose variations
    this.drawNose(ctx, 50, headY + 42, Math.floor(random() * 4));

    // Enhanced mouth expressions (now 10 types)
    const mouthType = Math.floor(random() * 10);
    this.drawMouth(ctx, 50, headY + 48, mouthType);

    // Additional facial features
    if (random() > 0.6) {
      this.addFacialFeature(ctx, headX, headY, headWidth, headHeight, rarity, random);
    }
  }

  // Include all the other methods from original code...
  // (addEyeAccessory, addFacialFeature, drawEyebrows, drawEyes, various eye types, drawNose, drawMouth, etc.)
  // These are already in your original code, so I'll keep them as-is

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
      () => this.drawWinkingEyes(ctx, x1, y1, x2, y2),
      () => this.drawStarEyes(ctx, x1, y1, x2, y2),
      () => this.drawAngryEyes(ctx, x1, y1, x2, y2),
      () => this.drawCryingEyes(ctx, x1, y1, x2, y2),
      () => this.drawRollingEyes(ctx, x1, y1, x2, y2)
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

  private drawStarEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    const starColor = '#FFD700';
    [x1, x2].forEach((x, index) => {
      const y = index === 0 ? y1 : y2;
      // Star shape
      this.drawPixel(ctx, x + 3, y, starColor);
      this.drawPixel(ctx, x + 1, y + 1, starColor);
      this.drawPixel(ctx, x + 3, y + 1, starColor);
      this.drawPixel(ctx, x + 5, y + 1, starColor);
      for (let i = 0; i < 7; i++) {
        this.drawPixel(ctx, x + i, y + 2, starColor);
      }
      this.drawPixel(ctx, x + 1, y + 3, starColor);
      this.drawPixel(ctx, x + 3, y + 3, starColor);
      this.drawPixel(ctx, x + 5, y + 3, starColor);
      this.drawPixel(ctx, x + 3, y + 4, starColor);
    });
  }

  private drawAngryEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    // Narrowed eyes with red tint
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 2; j++) {
        this.drawPixel(ctx, x1 + i, y1 + j + 1, '#FF0000');
      }
      for (let j = 0; j < 2; j++) {
        this.drawPixel(ctx, x2 + i, y2 + j + 1, '#FF0000');
      }
    }
    // Black pupils
    this.drawCircle(ctx, x1 + 4, y1 + 2, 1, '#000');
    this.drawCircle(ctx, x2 + 4, y2 + 2, 1, '#000');
  }

  private drawCryingEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    // Regular eyes
    this.drawCircle(ctx, x1 + 4, y1 + 1, 4, '#FFF');
    this.drawCircle(ctx, x2 + 4, y2 + 1, 4, '#FFF');
    this.drawCircle(ctx, x1 + 4, y1 + 1, 2, '#000');
    this.drawCircle(ctx, x2 + 4, y2 + 1, 2, '#000');

    // Tears streaming down
    for (let i = 0; i < 8; i++) {
      this.drawPixel(ctx, x1 + 4, y1 + 5 + i, '#87CEEB');
      this.drawPixel(ctx, x1 + 5, y1 + 5 + i, '#87CEEBBCC');
      this.drawPixel(ctx, x2 + 4, y2 + 5 + i, '#87CEEB');
      this.drawPixel(ctx, x2 + 3, y2 + 5 + i, '#87CEEBCC');
    }
  }

  private drawRollingEyes(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    // Eyes looking up
    this.drawCircle(ctx, x1 + 4, y1 + 1, 4, '#FFF');
    this.drawCircle(ctx, x2 + 4, y2 + 1, 4, '#FFF');
    // Pupils at top
    this.drawCircle(ctx, x1 + 4, y1 - 1, 2, '#000');
    this.drawCircle(ctx, x2 + 4, y2 - 1, 2, '#000');
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
    } else if (type === 2) { // Smile
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
    } else if (type === 6) { // Drooling
      this.drawNeutralMouth(ctx, x, y);
      // Drool
      this.drawPixel(ctx, x + 5, y + 1, '#87CEEB');
      this.drawPixel(ctx, x + 5, y + 2, '#87CEEB');
      this.drawPixel(ctx, x + 5, y + 3, '#87CEEB');
      this.drawPixel(ctx, x + 5, y + 4, '#87CEEB');
    } else if (type === 7) { // Big grin
      for (let i = -8; i <= 8; i++) {
        this.drawPixel(ctx, x + i, y - Math.abs(i) / 3, '#000');
        if (i % 3 === 0 && Math.abs(i) < 7) {
          // Teeth
          this.drawPixel(ctx, x + i, y - Math.abs(i) / 3 + 1, '#FFF');
        }
      }
    } else if (type === 8) { // Whistle
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          if (Math.abs(i) + Math.abs(j) <= 2) {
            this.drawPixel(ctx, x + i, y + j, '#000');
          }
        }
      }
    } else { // Surprised 'O'
      for (let i = -3; i <= 3; i++) {
        for (let j = -3; j <= 3; j++) {
          if (Math.abs(i) + Math.abs(j) === 3 || (Math.abs(i) + Math.abs(j) === 4 && Math.abs(i) < 3 && Math.abs(j) < 3)) {
            this.drawPixel(ctx, x + i, y + j, '#000');
          }
        }
      }
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

  // Remaining helper methods
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

  private adjustColor(color: string, factor: number): string {
    // Simple color adjustment
    if (color === '#FF0000') return factor < 1 ? '#CC0000' : '#FF3333';
    if (color === '#0000FF') return factor < 1 ? '#0000CC' : '#3333FF';
    if (color === '#00FF00') return factor < 1 ? '#00CC00' : '#33FF33';
    if (color === '#000000') return factor < 1 ? '#000000' : '#333333';
    return color;
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

  // Method to update animation frame for dynamic elements
  public updateAnimation(): void {
    this.animationFrame++;
  }
}
