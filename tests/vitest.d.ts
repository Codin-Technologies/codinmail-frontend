import '@testing-library/jest-dom';
import type { Assertion } from 'vitest';

declare module 'vitest' {
  interface Assertion<T> {
    toBeInTheDocument(): void;
    toHaveTextContent(text: string | RegExp): void;
    toHaveAttribute(name: string, value?: string): void;
  }
}
