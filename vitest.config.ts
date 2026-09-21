const path = require('path');

/** @type {import('vitest/config').UserConfig} */
module.exports = {
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
};