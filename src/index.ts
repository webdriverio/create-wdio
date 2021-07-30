import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import { Command } from 'commander'
import semver from 'semver'

import type { JSONSchemaForNPMPackageJsonFiles as PackageJSON } from '@schemastore/package'

import { exists, runProgram, shouldUseYarn, checkThatNpmCanReadCwd } from './utils'
import { ASCII_ROBOT, PROGRAM_TITLE, UNSUPPORTED_NODE_VERSION } from './constants'
import type { ProgramOpts } from './types'

const pkg = require(__dirname + '/../package.json')
let projectName: string | undefined
let useYarn: boolean | undefined

export function run () {
    /**
     * print program ASCII art
     */
    console.log(ASCII_ROBOT, PROGRAM_TITLE)

    const program = new Command('Create WebdriverIO')
        .version(pkg.version)
        .arguments('[project]')
        .usage(`${chalk.green('[project]')} [options]`)
        .action(name => {
            projectName = name
        })
        .option('--use-yarn')
        .option('--verbose', 'print additional logs')
        .option('--info', 'print environment debug info')
        .option('--dev', 'Install all packages as into devDependencies')

        .allowUnknownOption()
        .on('--help', () => {
            console.log()
        })
        .parse(process.argv)

    if (typeof projectName === 'undefined' && !fs.existsSync('package.json')) {
        console.error('There is no package.json in current directory')
        console.log(
            'To create WebdriverIO in a new project pass in a directory name:\n' +
            `  ${chalk.cyan(program.name())} ${chalk.green('/path/to/project/directory')}\n` +
            '\n' +
            'For example:\n' +
            `  ${chalk.cyan(program.name())} ${chalk.green('webdriverio-tests')}\n` +
            '\n' +
            'To update current project to include WebdriverIO packages, run this script in a directory with package.json\n' +
            `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
        )
        process.exit(1)
    }

    createWebdriverIO(program.opts())
}

async function createWebdriverIO(opts: ProgramOpts) {
    let pkgJson: PackageJSON = {}

    const unsupportedNodeVersion = !semver.satisfies(process.version, '>=12')
    if (unsupportedNodeVersion) {
        console.log(chalk.yellow(UNSUPPORTED_NODE_VERSION))
    }

    useYarn = opts.useYarn || await shouldUseYarn()

    let root = path.join(process.cwd(), projectName || '')
    if (!await exists(root)) {
        await fs.promises.mkdir(root, { recursive: true })
    }

    process.chdir(root)
    root = process.cwd()
    const currentDir = process.cwd()
    const pkgJsonPath = path.join(currentDir, 'package.json')
    if (!useYarn && !checkThatNpmCanReadCwd()) {
        process.exit(1)
    }

    console.log(`\nCreating WebdriverIO project in ${chalk.bold(root)}\n`)

    const deps = ['@wdio/cli']
    if (!await exists(pkgJsonPath)) {
        console.log('package.json file does not exist in current dir, creating it...')

        pkgJson = {
            name: 'webdriverio-tests',
            version: '0.1.0',
            private: true
        }
    } else {
        console.log('package.json found, adding WebdriverIO dependencies & scripts into it')
        pkgJson = require(pkgJsonPath)
    }

    if (!pkgJson.scripts) {
        pkgJson.scripts = {}
    }

    pkgJson.scripts['wdio'] = 'wdio run wdio.conf.js'
    await fs.promises.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 4))
    await install(deps.flat(), root, opts.verbose)

    console.log(
        '\nFinished installing packages.\n' +
        'Running WDIO CLI Wizard...'
    )

    await runProgram('npx', ['wdio', 'config', ...(useYarn ? ['--yarn'] : [])])

    console.log(`🤖 Successfully setup project at ${root} 🎉`)
    if (root != currentDir) {
        console.log(chalk.yellow('⚠'), 'Change directory to', chalk.yellow(root), 'to run these commands')
    }
}

function install (dependencies: string[], root: string, verbose: boolean) {
    const logLevel = verbose ? 'trace' : 'error'
    let command: string
    let args: string[]

    console.log(
        'Installing packages: ',
        chalk.green(dependencies.join(', ')),
        '\n'
    )

    if (useYarn) {
        command = 'yarnpkg'
        args = ['add', '-D', '--exact', ...dependencies]

        // Explicitly set cwd() to work around issues like
        // https://github.com/facebook/create-react-app/issues/3326.
        // Unfortunately we can only do this for Yarn because npm support for
        // equivalent --prefix flag doesn't help with this issue.
        // This is why for npm, we run checkThatNpmCanReadCwd() early instead.
        args.push('--cwd', root)
    } else {
        command = 'npm'
        args = ['install', '--save-dev', '--loglevel', logLevel, ...dependencies]
    }

    return runProgram(command, args)
}
