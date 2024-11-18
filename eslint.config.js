import wdioEslint from '@wdio/eslint'

export default wdioEslint.config([
    {
        ignores: ['build']
    },
    /**
     * custom test configuration
     */
    {
        files: ['tests/**/*'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
])
