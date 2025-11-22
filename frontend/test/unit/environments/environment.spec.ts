import { describe, expect, test } from 'vitest';
import { environment } from '@src/environments/environment';

describe('environment configuration', () => {
  test('enables development mode by default', () => {
    expect(environment.production).toBe(false);
  });
});
