import fs from 'node:fs/promises'
import path from 'node:path'

import chalk from 'chalk'
import semver from 'semver'
import { Command } from 'commander'

import { runProgram, shouldUseYarn, getPackageVersion } from './utils.js'
import { ASCII_ROBOT, PROGRAM_TITLE, UNSUPPORTED_NODE_VERSION, DEFAULT_NPM_TAG } from './constants.js'
import type { ProgramOpts } from './types'

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
        .option('-u, --use-yarn', 'Use Yarn package manager to install packages', false)
        .option('-v, --verbose', 'print additional logs')
        .option('-y, --yes', 'will fill in all config defaults without prompting', false)
        .option('-d, --dev', 'Install all packages as into devDependencies', true)

        .allowUnknownOption()
        .on('--help', () => console.log())
        .parse(process.argv)

    return operation(program.opts())
}

export async function createWebdriverIO(opts: ProgramOpts) {
    const useYarn = typeof opts.useYarn === 'boolean'
        ? opts.useYarn
        : await shouldUseYarn()
    const npmTag = opts.npmTag.startsWith('@') ? opts.npmTag : `@${opts.npmTag}`

    const root = path.resolve(process.cwd(), projectDir || '')
    const rootDirExists = await fs.access(root).then(() => true, () => false)
    if (!rootDirExists) {
        await fs.mkdir(root, { recursive: true })
    }

    console.log(`\nInstalling ${chalk.bold('@wdio/cli')} to initialize project...`)
    const logLevel = opts.verbose ? 'trace' : 'error'
    const command = useYarn ? 'yarnpkg' : 'npm'
    const args = useYarn
        ? ['add', ...(opts.dev ? ['-D'] : []), '--exact', '--cwd', root, `@wdio/cli${npmTag}`]
        : ['install', opts.dev ? '--save-dev' : '--save', '--loglevel', logLevel, `@wdio/cli${npmTag}`]

    await runProgram(command, args, { cwd: root, stdio: 'ignore' })
    console.log(chalk.green.bold('✔ Success!'))

    return runProgram('npx', [
        WDIO_COMMAND,
        'config',
        ...(useYarn ? ['--yarn'] : []),
        ...(opts.yes ? ['--yes'] : [])
    ], { cwd: root })
}

