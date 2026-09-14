import { ColorRGBA } from './pluginProtocol';

/**
 * Converts Hex string (#RRGGBB or #RRGGBBAA) to Figma RGBA color object (components 0..1).
 */
export function hexToRgba(hex: string): ColorRGBA {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length === 6) {
    cleanHex += 'FF';
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  return {
    r: ((num >> 24) & 0xFF) / 255,
    g: ((num >> 16) & 0xFF) / 255,
    b: ((num >> 8) & 0xFF) / 255,
    a: (num & 0xFF) / 255
  };
}

/**
 * Converts Figma RGBA (0..1) to Hex string.
 */
export function rgbaToHex(color: ColorRGBA): string {
  const r = Math.round((color.r ?? 0) * 255).toString(16).padStart(2, '0');
  const g = Math.round((color.g ?? 0) * 255).toString(16).padStart(2, '0');
  const b = Math.round((color.b ?? 0) * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

/**
 * Figma REST API Response types
 */
export interface FigmaRestFileResponse {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaRestNode;
  components: Record<string, any>;
  componentSets: Record<string, any>;
  schemaVersion: number;
  styles: Record<string, any>;
}

export interface FigmaRestNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaRestNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: any[];
  strokes?: any[];
  strokeWeight?: number;
  cornerRadius?: number;
  characters?: string;
  style?: Record<string, any>;
}
