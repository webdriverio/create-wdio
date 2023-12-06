import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import chalk from 'chalk'
import semver from 'semver'
import { Command } from 'commander'
import { resolve } from 'import-meta-resolve'

import { runProgram, getPackageVersion } from './utils.js'
import {
    ASCII_ROBOT, PROGRAM_TITLE, UNSUPPORTED_NODE_VERSION, DEFAULT_NPM_TAG,
    INSTALL_COMMAND, DEV_FLAG, PMs
} from './constants.js'
import type { ProgramOpts } from './types'
import { execSync } from 'node:child_process'

const WDIO_COMMAND = 'wdio'
let projectDir: string | undefined

export async function run (operation = createWebdriverIO) {
    const version = await getPackageVersion()

    /**
     * print program ASCII art
     */
    if (!(process.argv.includes('--version') || process.argv.includes('-v'))) {
        console.log(ASCII_ROBOT, PROGRAM_TITLE)
    }

    /**
     * ensure right Node.js version is used
     */
    const unsupportedNodeVersion = !semver.satisfies(process.version, '>=16')
    if (unsupportedNodeVersion) {
        console.log(chalk.yellow(UNSUPPORTED_NODE_VERSION))
        return
    }

    const program = new Command(WDIO_COMMAND)
        .version(version, '-v, --version')
        .arguments('[project-path]')
        .usage(`${chalk.green('[project-path]')} [options]`)
        .action(name => (projectDir = name))

        .option('-t, --npm-tag <tag>', 'Which NPM version you like to install, e.g. @next', DEFAULT_NPM_TAG)
        .option('-y, --yes', 'will fill in all config defaults without prompting', false)
        .option('-d, --dev', 'Install all packages as into devDependencies', true)

        .allowUnknownOption()
        .on('--help', () => console.log())
        .parse(process.argv)

    return operation(program.opts())
}

export async function createWebdriverIO(opts: ProgramOpts) {
    const npmTag = opts.npmTag.startsWith('@') ? opts.npmTag : `@${opts.npmTag}`
    const root = path.resolve(process.cwd(), projectDir || '')

    /**
     * find package manager that was used to create project
     */
    const pm = PMs.find((pm) => (
        // for pnpm check for "~/Library/pnpm/store/v3/..."
        process.argv[1].includes(`${path.sep}${pm}${path.sep}`) ||
        // for NPM and Yarn check for "~/.npm/npx/..." or "~/.yarn/bin/create-wdio"
        process.argv[1].includes(`${path.sep}.${pm}${path.sep}`)
    )) || 'npm'

    const hasPackageJson = await fs.access(path.resolve(root, 'package.json')).then(() => true).catch(() => false)
    if (!hasPackageJson) {
        await fs.mkdir(root, { recursive: true })
        await fs.writeFile(path.resolve(root, 'package.json'), JSON.stringify({
            name: root.substring(root.lastIndexOf(path.sep) + 1),
            type: 'module'
        }, null, 2))
    }

    const cliInstalled = await isCLIInstalled(root)
    if (!cliInstalled) {
        console.log(`\nInstalling ${chalk.bold('@wdio/cli')} to initialize project...`)
        const args = [INSTALL_COMMAND[pm]]
        if (pm === 'yarn') {
            args.push('--exact', '--cwd', root)
        }
        if (opts.dev) {
            args.push(DEV_FLAG[pm])
        }
        args.push(`@wdio/cli${npmTag}`)
        await runProgram(pm, args, { cwd: root, stdio: 'ignore' })
        console.log(chalk.green.bold('✔ Success!'))
    }

    return runProgram(pm === 'npm' ? 'npx' : pm, [
        `${pm === 'npm' ? '' : 'run '}${WDIO_COMMAND}`,
        'config',
        ...(opts.yes ? ['--yes'] : [])
    ], { cwd: root })
}

async function isCLIInstalled(path: string) {
    try {
        // can be replaced with import.meta.resolve('@wdio/cli', new URL(`file:///${root}`).href) in the future
        // check if the cli is installed in the project
        resolve('@wdio/cli', pathToFileURL(path).href)
        return true
    } catch (error) {
        // check of the cli is installed globally
        const output = execSync('npm ls -g', { encoding: 'utf-8' })
        if (output.includes('@wdio/cli')) {
            return true
        }
        return false
    }
}