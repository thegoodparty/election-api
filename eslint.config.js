const { defineConfig, globalIgnores } = require('eslint/config')

const dotenv = require('dotenv')
dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('Please set DATABASE_URL in your .env')
}

const tsParser = require('@typescript-eslint/parser')
const typescriptEslintEslintPlugin = require('@typescript-eslint/eslint-plugin')
const unusedImports = require('eslint-plugin-unused-imports')
const globals = require('globals')
const js = require('@eslint/js')

const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

module.exports = defineConfig([
  {
    // Preserve the v8 eslintrc default: unused eslint-disable directives are
    // not reported (flat config defaults this to 'warn').
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },

    languageOptions: {
      parser: tsParser,
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },

      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
      'unused-imports': unusedImports,
    },

    extends: compat.extends(
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ),

    rules: {
      semi: 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  globalIgnores(['eslint.config.js', '**/generated/', '**/dist/']),
])
