// @ts-check
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    importPlugin.flatConfigs.errors,
    importPlugin.flatConfigs.warnings,
    {
        plugins: {
            unicorn: eslintPluginUnicorn,
        },
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es5,
                ...globals.jest,
            },
            ecmaVersion: 2019,
            sourceType: 'module',
        },
        rules: {
            semi: ['error', 'never'],
            quotes: ['error', 'single'],
            indent: [2, 4],

            'no-constant-condition': 0,
            // see https://stackoverflow.com/questions/55280555/typescript-eslint-eslint-plugin-error-route-is-defined-but-never-used-no-un
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'error',

            'import/no-unresolved': 0,
            'import/named': 2,
            'import/namespace': 2,
            'import/default': 2,
            'import/export': 2,

            'unicorn/prefer-node-protocol': 'error',
        },
        ignores: ['./build/*'],
    },
    {
        files: ['*.ts'],
        rules: {
            'no-undef': 'off',
        },
    },
)
