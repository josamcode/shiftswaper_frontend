// jest-dom adds custom matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// React Router 7 relies on these Web APIs, which jsdom doesn't provide.
Object.assign(global, { TextDecoder, TextEncoder });
