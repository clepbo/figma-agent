import { describe, it, expect } from 'vitest';
import { hexToRgba, rgbaToHex } from '../src/figma/types';

describe('Color Conversions', () => {
  it('converts 6-character hex to Figma RGBA color (0..1)', () => {
    const rgba = hexToRgba('#FF0000');
    expect(rgba.r).toBeCloseTo(1);
    expect(rgba.g).toBeCloseTo(0);
    expect(rgba.b).toBeCloseTo(0);
    expect(rgba.a).toBeCloseTo(1);
  });

  it('converts 3-character hex shorthand', () => {
    const rgba = hexToRgba('#0F0');
    expect(rgba.r).toBeCloseTo(0);
    expect(rgba.g).toBeCloseTo(1);
    expect(rgba.b).toBeCloseTo(0);
  });

  it('converts Figma RGBA back to Hex', () => {
    const hex = rgbaToHex({ r: 0, g: 0.5, b: 1 });
    expect(hex).toBe('#0080FF');
  });
});
