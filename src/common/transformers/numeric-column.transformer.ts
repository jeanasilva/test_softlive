import { ValueTransformer } from 'typeorm';

/**
 * Converts numeric columns stored as text/strings in SQLite into numbers in JavaScript.
 */
export class NumericColumnTransformer implements ValueTransformer {
  to(value?: number | null): number | null | undefined {
    return value === null || value === undefined ? value : Number(value);
  }

  from(value?: string | number | null): number | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'number') {
      return value;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}
