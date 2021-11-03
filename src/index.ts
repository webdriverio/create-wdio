import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import { Command } from 'commander'
import semver from 'semver'

import { exists, runProgram, shouldUseYarn, checkThatNpmCanReadCwd } from './utils'
import { ASCII_ROBOT, PROGRAM_TITLE, UNSUPPORTED_NODE_VERSION } from './constants'
import type { ProgramOpts } from './types'

let pkg = { version: 'unknown' }
try { pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString()) } catch (e: any) { /* ignore */ }

let projectName: string | undefined
let useYarn: boolean | undefined

export function run (operation = createWebdriverIO) {
    /**
     * print program ASCII art
     */
    if (!(process.argv.includes('--version') || process.argv.includes('-v'))) {
        console.log(ASCII_ROBOT, PROGRAM_TITLE)
    }

    const program = new Command('wdio')
        .version(`v${pkg.version}`, '-v, --version')
        .arguments('[project]')
        .usage(`${chalk.green('[project]')} [options]`)
        .action(name => (projectName = name))
        .option('--use-yarn', 'Use Yarn package manager to install packages', false)
        .option('--verbose', 'print additional logs')
        .option('--yes', 'will fill in all config defaults without prompting', false)
        .option('--dev', 'Install all packages as into devDependencies', true)

        .allowUnknownOption()
        .on('--help', () => console.log())
        .parse(process.argv)

    if (typeof projectName === 'undefined' && !fs.existsSync('package.json')) {
        console.error('There is no package.json in current directory!\n')
        console.log(
            'To create WebdriverIO in a new project pass in a directory name:\n' +
            `  npm init ${chalk.cyan(program.name())} ${chalk.green('/path/to/project/directory')}\n` +
            '\n' +
            'For example:\n' +
            `  npm init ${chalk.cyan(program.name())} ${chalk.green('./tests')}\n` +
            '\n' +
            'To update current project to include WebdriverIO packages, run this script in a directory with package.json\n' +
            `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
        )
        process.exit(1)
    }

    return operation(program.opts()).then(
        () => console.log(`To start the test, run: ${chalk.cyan('$ npm run')} ${chalk.green(program.name())}`))
}

async function createWebdriverIO(opts: ProgramOpts) {
    const ewd = process.cwd()

    const unsupportedNodeVersion = !semver.satisfies(process.version, '>=12')
    if (unsupportedNodeVersion) {
        console.log(chalk.yellow(UNSUPPORTED_NODE_VERSION))
    }

    useYarn = opts.useYarn && await shouldUseYarn()

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
    await install(deps.flat(), root, opts)
    console.log('\nFinished installing packages.')
        
    console.log('\nRunning WDIO CLI Wizard...')
    await runProgram('npx', ['wdio', 'config', ...(useYarn ? ['--yarn'] : []), ...(opts.yes ? ['--yes'] : [])])
    
    console.log('Adding scripts to package.json')
    const isUsingTypescript = await exists('wdio.conf.ts')
    const pkgJson = require(pkgJsonPath)
    if (!pkgJson.scripts) {
        pkgJson.scripts = {}
    }
    pkgJson.scripts['wdio'] = `wdio run wdio.conf.${isUsingTypescript ? 'ts' : 'js'}`
    await fs.promises.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 4))

    console.log(`\n🤖 Successfully setup project at ${root} 🎉`)
    if (root != ewd) {
        console.log(`\n${chalk.yellow('⚠')} First, change the directory via: ${chalk.cyan('$ cd')} ${chalk.green(root)}`)
    }
}

function install (dependencies: string[], root: string, opts: ProgramOpts) {
    const logLevel = opts.verbose ? 'trace' : 'error'
    let command: string
    let args: string[]

    console.log(
        'Installing packages: ',
        chalk.green(dependencies.join(', ')),
        '\n'
    )

    if (useYarn) {
        command = 'yarnpkg'
        args = ['add', ...(opts.dev ? ['-D'] : []), '--exact', ...dependencies]

        // Explicitly set cwd() to work around issues like
        // https://github.com/facebook/create-react-app/issues/3326.
        // Unfortunately we can only do this for Yarn because npm support for
        // equivalent --prefix flag doesn't help with this issue.
        // This is why for npm, we run checkThatNpmCanReadCwd() early instead.
        args.push('--cwd', root)
    } else {
        command = 'npm'
        args = ['install', opts.dev ? '--save-dev' : '--save', '--loglevel', logLevel, ...dependencies]
    }

    return runProgram(command, args)
}
