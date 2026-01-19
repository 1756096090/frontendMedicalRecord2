import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('verdad básica', () => {
    expect(true).toBe(true);
  });

  it('suma simple', () => {
    expect(1 + 2).toBe(3);
  });
});