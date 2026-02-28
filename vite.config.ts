import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = { ...process.env, ...loadEnv(mode, '.', '') };
    const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.GOOGLE_AI_API_KEY || env.VITE_GOOGLE_AI_API_KEY;
    if (mode === 'production' && !geminiKey && process.env.VERCEL === '1') {
      throw new Error(
        'Style analysis requires an API key. Set VITE_GEMINI_API_KEY or VITE_GOOGLE_AI_API_KEY in Vercel Environment Variables (Production scope), then redeploy with "Clear Build Cache".'
      );
    }
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: true,
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'process.env.GEMINI_BASE_URL': JSON.stringify(env.GEMINI_BASE_URL || env.VITE_GEMINI_BASE_URL || ''),
        'process.env.GOOGLE_AI_API_KEY': JSON.stringify(env.GOOGLE_AI_API_KEY || env.VITE_GOOGLE_AI_API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'process.env.GEMINI_ANALYSIS_MODEL': JSON.stringify(env.GEMINI_ANALYSIS_MODEL || env.VITE_GEMINI_ANALYSIS_MODEL || 'gemini-3.1-pro-preview'),
        'process.env.FAL_KEY': JSON.stringify(env.FAL_KEY || env.VITE_FAL_KEY || ''),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
