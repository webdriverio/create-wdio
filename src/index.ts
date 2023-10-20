import fs from 'node:fs/promises'
import path from 'node:path'

import chalk from 'chalk'
import semver from 'semver'
import { detect } from 'detect-package-manager'
import { readPackageUp } from 'read-pkg-up'
import { Command } from 'commander'

import { runProgram, getPackageVersion } from './utils.js'
import {
    ASCII_ROBOT, PROGRAM_TITLE, UNSUPPORTED_NODE_VERSION, DEFAULT_NPM_TAG,
    INSTALL_COMMAND, DEV_FLAG, PMs
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
     * check if a package.json exists and if not create one
     */
    const project = await readPackageUp({ cwd: root })
    if (!project) {
        await fs.mkdir(root, { recursive: true })
        await fs.writeFile(
            path.resolve(root, 'package.json'),
            JSON.stringify({
                name: 'my-new-project',
                type: 'module'
            }, null, 2)
        )

        /**
         * create a package-lock.json so that `detect-package-manager`
         * doesn't mark it as a Yarn project
         * @see https://github.com/egoist/detect-package-manager/issues/11
         */
        const cmd = PMs.includes(process.argv0) ? process.argv0 : 'npm'
        await runProgram(cmd, ['install'], { cwd: root, stdio: 'ignore' })
    }

    console.log(`\nInstalling ${chalk.bold('@wdio/cli')} to initialize project...`)
    const pm = await detect({ cwd: root })
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

    return runProgram('npx', [
        WDIO_COMMAND,
        'config',
        ...(opts.yes ? ['--yes'] : [])
    ], { cwd: root })
}

