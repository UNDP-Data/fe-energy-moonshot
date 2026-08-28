import matchers from '@testing-library/jest-dom/matchers';
import { expect, vi } from 'vitest';

expect.extend(matchers);
(globalThis as any).jest = vi;
