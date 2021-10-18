import { exists, runProgram, shouldUseYarn } from '../src/utils'

test('exists', async () => {
    expect(await exists(__dirname)).toBe(true)
    expect(await exists(`${__dirname}/foo`)).toBe(false)
})

test('runProgram', async () => {
    expect(await runProgram('echo', ['123'])).toBe(undefined)

    const err = await runProgram('node', ['-e', 'throw new Error(\'ups\')'])
        .catch((e) => e)
    expect(err.message).toBe('Error calling: node -e throw new Error(\'ups\')')

    const err2 = await runProgram('foobarloo', []).catch((e) => e)
    expect(err2.message).toBe('spawn foobarloo ENOENT')
})
