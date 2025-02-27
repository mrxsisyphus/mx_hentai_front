import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'node:path';

export default defineConfig({
  source: {
    define: {
      'process.env.IS_TAURI': process.env.IS_TAURI
        ? JSON.stringify(process.env.IS_TAURI === '1')
        : false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [pluginReact()],
});
