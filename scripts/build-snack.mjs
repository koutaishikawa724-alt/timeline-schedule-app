// Expo Snack 用の1ファイル版（snack/App.js）を作る。実行: npx esbuild を入れてから node scripts/build-snack.mjs snack/App.js
import { build } from 'esbuild';
const ext = ['react', 'react-native', 'expo-*', 'react-native-svg', '@react-native-async-storage/async-storage', 'react-native-safe-area-context', 'react/jsx-runtime'];
await build({
  entryPoints: [new URL('../App.tsx', import.meta.url).pathname],
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  target: 'es2020',
  external: ext,
  outfile: process.argv[2],
  charset: 'utf8',
  legalComments: 'none',
  define: { 'process.env.EXPO_PUBLIC_BRIEFING_API_URL': 'undefined', 'process.env.EXPO_PUBLIC_BRIEFING_APP_TOKEN': 'undefined' },
  plugins: [{ name: 'wav', setup(b) { b.onResolve({ filter: /\.wav$/ }, a => ({ path: a.path, namespace: 'wav' })); b.onLoad({ filter: /.*/, namespace: 'wav' }, () => ({ contents: 'module.exports = null', loader: 'js' })); } }],
  banner: { js: '// Timeline（スケジュールアプリ）Expo Snack 用 1ファイル版\n// snack.expo.dev の App.js をすべて消して、これを貼り付けてください。\n' },
});
