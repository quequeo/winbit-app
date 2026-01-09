import { describe, it, expect } from 'vitest';
import { formatName } from './formatName';

describe('formatName', () => {
  it('converts name to title case', () => {
    expect(formatName('luis matías avellaneda')).toBe('Luis Matías Avellaneda');
  });

  it('handles uppercase names', () => {
    expect(formatName('LUIS MATÍAS AVELLANEDA')).toBe('Luis Matías Avellaneda');
  });

  it('handles mixed case names', () => {
    expect(formatName('LuIs MaTíAs AvElLaNeDA')).toBe('Luis Matías Avellaneda');
  });

  it('handles single word names', () => {
    expect(formatName('luis')).toBe('Luis');
    expect(formatName('LUIS')).toBe('Luis');
  });

  it('handles names with extra spaces', () => {
    expect(formatName('  luis   matías   avellaneda  ')).toBe('Luis Matías Avellaneda');
  });

  it('handles empty or invalid input', () => {
    expect(formatName('')).toBe('');
    expect(formatName('   ')).toBe('');
    expect(formatName(null)).toBe('');
    expect(formatName(undefined)).toBe('');
    expect(formatName(123)).toBe('');
  });

  it('handles names with special characters', () => {
    expect(formatName('maría josé garcía-lópez')).toBe('María José García-López');
  });

  it('preserves hyphens and apostrophes', () => {
    expect(formatName("o'connor")).toBe("O'Connor");
    expect(formatName('jean-paul')).toBe('Jean-Paul');
  });
});
