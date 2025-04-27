// See https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

// Explicitly extend Vitest's expect with jest-dom matchers
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
expect.extend(matchers);