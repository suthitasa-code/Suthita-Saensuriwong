import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // ปิดกฎนี้: มันเตือนแม้แต่โค้ดรูปแบบมาตรฐาน (fetch ข้อมูลตอน mount แล้ว setLoading/setState)
      // ที่ใช้อยู่ทั่วทั้งโปรเจกต์และทำงานถูกต้องอยู่แล้ว ไม่ใช่บั๊ก
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
