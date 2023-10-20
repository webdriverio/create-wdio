import fs from 'node:fs/promises'
import semver from 'semver'
import { detect } from 'detect-package-manager'
import { vi, test, expect, beforeEach, afterEach } from 'vitest'
import { Command } from 'commander'
import { readPackageUp } from 'read-pkg-up'

import { run, createWebdriverIO } from '../src'
import { runProgram } from '../src/utils'

vi.mock('node:fs/promises', () => ({
    default: {
        access: vi.fn().mockRejectedValue(new Error('not existing')),
        mkdir: vi.fn(),
        writeFile: vi.fn()
    }
}))
vi.mock('detect-package-manager', () => ({
    detect: vi.fn().mockReturnValue('pnpm')
}))
vi.mock('read-pkg-up')
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
    vi.mocked(detect).mockResolvedValue('yarn')
    vi.mocked(readPackageUp).mockResolvedValue({
        path: '/foo/bar/package.json',
        packageJson: { name: 'my-new-project' }
    })
    await createWebdriverIO({ npmTag: 'next', yes: true } as any)
    expect(readPackageUp).toBeCalledTimes(1)
    expect(runProgram).toBeCalledWith(
        'yarn',
        ['add', '--exact', '--cwd', expect.any(String), '@wdio/cli@next'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'npx',
        ['wdio', 'config', '--yes'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(2)
    expect(fs.mkdir).toBeCalledTimes(0)
})

test('createWebdriverIO with NPM', async () => {
    vi.mocked(detect).mockResolvedValue('npm')
    await createWebdriverIO({ npmTag: 'next', yes: true } as any)
    expect(runProgram).toBeCalledWith(
        'npm',
        ['install', '@wdio/cli@next'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'npx',
        ['wdio', 'config', '--yes'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(2)
    expect(fs.mkdir).toBeCalledTimes(0)
})

test('createWebdriverIO with pnpm', async () => {
    vi.mocked(detect).mockResolvedValue('pnpm')
    await createWebdriverIO({ npmTag: 'next', yes: true } as any)
    expect(runProgram).toBeCalledWith(
        'pnpm',
        ['add', '@wdio/cli@next'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'npx',
        ['wdio', 'config', '--yes'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledTimes(2)
    expect(fs.mkdir).toBeCalledTimes(0)
})

test('creates a directory if it does not exist', async () => {
    vi.mocked(readPackageUp).mockResolvedValue(undefined)
    vi.mocked(detect).mockResolvedValue('pnpm')
    await createWebdriverIO({ npmTag: 'next', yes: true, dev: true } as any)
    expect(runProgram).toBeCalledWith(
        'npm',
        ['install'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'pnpm',
        ['add', '--save-dev', '@wdio/cli@next'],
        expect.any(Object)
    )
    expect(runProgram).toBeCalledWith(
        'npx',
        ['wdio', 'config', '--yes'],
        expect.any(Object)
    )
    expect(fs.mkdir).toBeCalledTimes(1)
    expect(runProgram).toBeCalledTimes(3)
})

afterEach(() => {
    vi.mocked(fs.mkdir).mockClear()
    vi.mocked(runProgram).mockClear()
    console.log = consoleLog
})
