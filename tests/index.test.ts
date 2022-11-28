import fs from 'node:fs/promises'
import { vi, test, expect, beforeEach, afterEach } from 'vitest'
import { Command } from 'commander'
import semver from 'semver'

import { run, createWebdriverIO } from '../src'
import { runProgram } from '../src/utils'

vi.mock('node:fs/promises', () => ({
    default: {
        access: vi.fn().mockRejectedValue(new Error('not existing')),
        mkdir: vi.fn()
    }
}))
vi.mock('commander')
vi.mock('semver', () => ({
    default: {
        satisfies: vi.fn().mockReturnValue(true)
    }
}))
vi.mock('../src/utils.js', () => ({
    runProgram: vi.fn(),
    colorItBold: vi.fn((log) => log),
    colorIt: vi.fn((log) => log),
    getPackageVersion: vi.fn().mockReturnValue('0.1.1'),
    shouldUseYarn: vi.fn().mockReturnValue(true)
}))

const consoleLog = console.log.bind(console)
beforeEach(() => {
    console.log = vi.fn()
})

test('run', async () => {
    const op = vi.fn().mockResolvedValue({})
    await run(op)

    expect(op).toBeCalledTimes(1)
    expect(op).toBeCalledWith('foobar')
    expect(new Command().arguments).toBeCalledWith('[project-path]')
    expect(console.log).toBeCalledTimes(1)
    expect(vi.mocked(console.log).mock.calls[0][0]).toContain('oooooooooooo')
    expect(vi.mocked(console.log).mock.calls[0][1]).toContain('Next-gen browser and mobile automation')
})

test('does not run if Node.js version is too low', async () => {
    vi.mocked(semver.satisfies).mockReturnValue(false)
    const op = vi.fn().mockResolvedValue({})
    await run(op)
    expect(op).toBeCalledTimes(0)
})

test('createWebdriverIO', async () => {
    await createWebdriverIO({ npmTag: 'next', verbose: true, yes: true } as any)
    expect(runProgram).toBeCalledWith(
        'yarnpkg',
        ['add', '--exact', '--cwd', expect.any(String), '@wdio/cli@next'],
        expect.any(Object)
    )
    expect(fs.mkdir).toBeCalledTimes(1)
})

test('createWebdriverIO', async () => {
    await createWebdriverIO({ useYarn: false, npmTag: 'next', verbose: true, yes: true } as any)
    expect(runProgram).toBeCalledWith(
        'npm',
        ['install', '--save', '--loglevel', 'trace', '@wdio/cli@next'],
        expect.any(Object)
    )
    expect(fs.mkdir).toBeCalledTimes(1)
})

afterEach(() => {
    vi.mocked(fs.mkdir).mockClear()
    vi.mocked(runProgram).mockClear()
    console.log = consoleLog
})
