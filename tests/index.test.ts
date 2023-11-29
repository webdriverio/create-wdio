import fs from 'node:fs/promises'
import semver from 'semver'
import { resolve } from 'import-meta-resolve'
import { vi, test, expect, beforeEach, afterEach } from 'vitest'
import { Command } from 'commander'

import { run, createWebdriverIO } from '../src'
import { runProgram } from '../src/utils'
import { ProgramOpts } from '../src/types'

vi.mock('node:fs/promises', () => ({
    default: {
        access: vi.fn().mockRejectedValue(new Error('not existing')),
        mkdir: vi.fn(),
        writeFile: vi.fn()
    }
}))
vi.mock('import-meta-resolve', () => ({
    resolve: vi.fn()
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
    vi.mocked(runProgram).mockClear()
    vi.mocked(resolve).mockImplementation(() => {
        throw new Error('foo')
    })
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

test('createWebdriverIO with Yarn', async () => {
    process.argv = ['', '~/.yarn/bin/create-wdio']
    await createWebdriverIO({ npmTag: 'latest' } as ProgramOpts)
    expect(runProgram).toBeCalledWith(
        'yarn',
        ['add', '--exact', '--cwd', expect.any(String), '@wdio/cli@latest'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'yarn',
        ['run wdio', 'config'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(2)
})

test('createWebdriverIO with NPM', async () => {
    process.argv = ['', '~/.npm/npx/...']
    await createWebdriverIO({ npmTag: 'latest' } as ProgramOpts)
    expect(runProgram).toBeCalledWith(
        'npm',
        ['install', '@wdio/cli@latest'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'npx',
        ['wdio', 'config'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(2)
})

test('createWebdriverIO with pnpm', async () => {
    process.argv = ['', '~/Library/pnpm/store/v3/...']
    await createWebdriverIO({ npmTag: 'latest' } as ProgramOpts)
    expect(runProgram).toBeCalledWith(
        'pnpm',
        ['add', '@wdio/cli@latest'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'pnpm',
        ['run wdio', 'config'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(2)
})

test('creates a directory if it does not exist', async () => {
    process.argv = ['', '~/.npm/npx/...']
    await createWebdriverIO({ npmTag: 'latest', dev: true } as ProgramOpts)
    expect(runProgram).toBeCalledWith(
        'npm',
        ['install', '--save-dev', '@wdio/cli@latest'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'npx',
        ['wdio', 'config'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(2)
})

test('does not install the @wdio/cli package when the @wdio/cli package is already installed', async () => {
    process.argv = ['', '~/.npm/npx/...']
    vi.mocked(resolve).mockReturnValue('/Users/user/dev/my-monorepo/package.json')
    await createWebdriverIO({ npmTag: 'latest' } as ProgramOpts)
    expect(runProgram).toBeCalledWith(
        'npx',
        ['wdio', 'config'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(1)
})

test('runs the wdio config command with --yes when the yes option is set to true', async () => {
    process.argv = ['', '~/.npm/npx/...']
    await createWebdriverIO({ npmTag: 'latest', yes: true } as ProgramOpts)
    expect(runProgram).toBeCalledWith(
        'npm',
        ['install', '@wdio/cli@latest'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'npx',
        ['wdio', 'config', '--yes'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(2)
})

test('installs the next version when the npmTag option is set to "next"', async () => {
    process.argv = ['', '~/.npm/npx/...']
    await createWebdriverIO({ npmTag: 'next' } as ProgramOpts)
    expect(runProgram).toBeCalledWith(
        'npm',
        ['install', '@wdio/cli@next'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'npx',
        ['wdio', 'config'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(2)
})

afterEach(() => {
    vi.mocked(fs.mkdir).mockClear()
    vi.mocked(runProgram).mockClear()
    vi.mocked(resolve).mockClear()
    console.log = consoleLog
})
