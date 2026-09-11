const fs = require('fs');

let code = fs.readFileSync('src/services/geminiService.ts', 'utf8');

code = code.replace(
  /export function getGeminiApiKey\(\): string \{[\s\S]*?return '';\n\}/,
  `export function getGeminiApiKey(): string {
  // 1. Check user custom key saved in localStorage
  const customKey = localStorage.getItem('rankify_custom_gemini_key');
  if (customKey && customKey.trim()) {
    return customKey.trim();
  }

  // 2. Check Vite defined import.meta.env
  try {
    const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (viteKey) return viteKey;
  } catch (e) {
    // ignore
  }

  // Fallback for non-Vite environments if needed
  try {
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // ignore
  }

  return '';
}`
);

fs.writeFileSync('src/services/geminiService.ts', code);
