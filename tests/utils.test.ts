import { vi, test, expect, beforeEach, afterEach } from 'vitest'
import { runProgram, getPackageVersion } from '../src/utils'

const consoleLog = console.log.bind(console)
const processExit = process.exit.bind(process)
beforeEach(() => {
    process.exit = vi.fn()
    console.log = vi.fn()
})
afterEach(() => {
    process.exit = processExit
    console.log = consoleLog
})

test('runProgram', async () => {
    expect(await runProgram('echo', ['123'], {})).toBe(undefined)

    await runProgram('node', ['-e', 'throw new Error(\'ups\')'], {}).catch((e) => e)
    expect(vi.mocked(console.log).mock.calls[0][0]).toMatch(/Error calling: node -e throw new Error/)
    expect(process.exit).toBeCalledTimes(1)

    await runProgram('foobarloo', [], {}).catch((e) => e)
    expect(vi.mocked(console.log).mock.calls[1][0]).toMatch(/spawn foobarloo ENOENT/)
    expect(process.exit).toBeCalledTimes(2)
})

test('getPackageVersion', async () => {
    expect(await getPackageVersion()).toEqual(expect.any(String))
})
