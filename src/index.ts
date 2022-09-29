import fs from 'node:fs/promises'
import path from 'node:path'

import chalk from 'chalk'
import semver from 'semver'
import { Command } from 'commander'

import { exists, runProgram, shouldUseYarn, getPackageVersion } from './utils.js'
import {
    ASCII_ROBOT, PROGRAM_TITLE, UNSUPPORTED_NODE_VERSION, DEFAULT_NPM_TAG,
    COMMUNITY_DISCLAIMER
} from './constants.js'
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

async function createWebdriverIO(opts: ProgramOpts) {
    const cwd = process.cwd()
    const useYarn = opts.useYarn && await shouldUseYarn()
    const npmTag = opts.npmTag.startsWith('@') ? opts.npmTag : `@${opts.npmTag}`

    const unsupportedNodeVersion = !semver.satisfies(process.version, '>=12')
    if (unsupportedNodeVersion) {
        console.log(chalk.yellow(UNSUPPORTED_NODE_VERSION))
    }

    const root = path.resolve(process.cwd(), projectDir || '')
    if (!await exists(root)) {
        await fs.mkdir(root, { recursive: true })
    }

    const pkgJsonPath = path.join(root, 'package.json')
    console.log(`\nCreating WebdriverIO project in ${chalk.bold(root)}\n`)

    if (!await exists(pkgJsonPath)) {
        console.log(`Creating a ${chalk.bold('package.json')} for the directory.`)
        const pkgJson = {
            name: 'webdriverio-tests',
            version: '0.1.0',
            description: '',
            private: true,
            keywords: [],
            author: '',
            license: 'ISC'
        }
        await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 4))
        console.log(chalk.green.bold('✔ Success!'))
    }

    console.log(`\nInstalling ${chalk.bold('@wdio/cli')} to initialize project.`)
    const logLevel = opts.verbose ? 'trace' : 'error'
    const command = useYarn ? 'yarnpkg' : 'npm'
    const args = useYarn
        ? ['add', ...(opts.dev ? ['-D'] : []), '--exact', '--cwd', root, `@wdio/cli${npmTag}`]
        : ['install', opts.dev ? '--save-dev' : '--save', '--loglevel', logLevel, `@wdio/cli${npmTag}`]
    await runProgram(command, args, { cwd: root, stdio: 'ignore' })
    console.log(chalk.green.bold('✔ Success!'))

    console.log('\nRunning WDIO CLI Wizard...')
    await runProgram('npx', [
        WDIO_COMMAND,
        'config',
        ...(useYarn ? ['--yarn'] : []),
        ...(opts.yes ? ['--yes'] : [])
    ], { cwd: root })

    if (await exists(pkgJsonPath)) {
        console.log(`Adding ${chalk.bold(`"${WDIO_COMMAND}"`)} script to package.json.`)
        const isUsingTypescript = await exists('test/wdio.conf.ts')
        const script = `wdio run ${isUsingTypescript ? 'test/wdio.conf.ts' : 'wdio.conf.js'}`
        await runProgram('npm', ['set-script', WDIO_COMMAND, script], { cwd: root })
        console.log(chalk.green.bold('✔ Success!'))
    }

    console.log(`\n🤖 Successfully setup project at ${root} 🎉\n`)
    console.log(COMMUNITY_DISCLAIMER)

    if (root != cwd) {
        console.log(`${chalk.bold.yellow('⚠')} First, change the directory via: ${chalk.cyan('$ cd')} ${chalk.green(root)}`)
    }

    console.log(`To start the test, run: ${chalk.cyan('$ npm run')} ${chalk.green(WDIO_COMMAND)}`)
}

