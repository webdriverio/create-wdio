import { expect, test } from 'vitest'

import { formatConfigFilePaths, missingConfigurationPrompt, canAccessConfigPath } from '../../src/utils/index.js'

test('should export formatConfigFilePaths', async ()=>{
    expect(formatConfigFilePaths).toBeDefined()
})

test('should export missingConfigurationPrompt', async ()=>{
    expect(missingConfigurationPrompt).toBeDefined()
})

test('should export canAccessConfigPath', async ()=>{
    expect(canAccessConfigPath).toBeDefined()
})
