import fs from 'fs'
import chalk from 'chalk'
import spawn from 'cross-spawn'
import { SpawnOptions } from 'child_process'

export function exists (path: string) {
    return fs.promises.access(path).then(
        () => true,
        () => false
    )
}

export function runProgram (command: string, args: string[], options: SpawnOptions = { stdio: 'inherit' }) {
    const child = spawn(command, args, options)
    return new Promise<void>((resolve, reject) => {
        let error: Error
        child.on('error', (e) => (error = e))
        child.on('close', code => {
            if (code !== 0) {
                return reject(new Error(
                    (error && error.message) ||
                    `Error calling: ${command} ${args.join(' ')}`
                ))
            }
            resolve()
        })
    })
}

export function shouldUseYarn() {
    return runProgram('yarnpkg', ['--version'], { stdio: 'ignore' }).then(
        () => true,
        () => false
    )
}

export function checkThatNpmCanReadCwd() {
    const cwd = process.cwd()
    let childOutput = null
    try {
        // Note: intentionally using spawn over exec since
        // the problem doesn't reproduce otherwise.
        // `npm config list` is the only reliable way I could find
        // to reproduce the wrong path. Just printing process.cwd()
        // in a Node process was not enough.
        childOutput = spawn.sync('npm', ['config', 'list']).output.join('')
    } catch (err) {
        // Something went wrong spawning node.
        // Not great, but it means we can't do this check.
        // We might fail later on, but let's continue.
        return true
    }

    if (typeof childOutput !== 'string') {
        return true
    }

    const lines = childOutput.split('\n')
    // `npm config list` output includes the following line:
    // "; cwd = C:\path\to\current\dir" (unquoted)
    // I couldn't find an easier way to get it.
    const prefix = '; cwd = '
    const line = lines.find(line => line.indexOf(prefix) === 0)
    if (typeof line !== 'string') {
        // Fail gracefully. They could remove it.
        return true
    }
    const npmCWD = line.substring(prefix.length)
    if (npmCWD === cwd) {
        return true
    }

    console.error(
        chalk.red(
            'Could not start an npm process in the right directory.\n\n' +
            `The current directory is: ${chalk.bold(cwd)}\n` +
            `However, a newly started npm process runs in: ${chalk.bold(npmCWD)}\n\n` +
            'This is probably caused by a misconfigured system terminal shell.'
        )
    )

    if (process.platform === 'win32') {
        console.error(
            chalk.red('On Windows, this can usually be fixed by running:\n\n') +
            `  ${chalk.cyan('reg')} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
            `  ${chalk.cyan('reg')} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
            chalk.red('Try to run the above two lines in the terminal.\n') +
            chalk.red('To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/')
        )
    }
    return false
}
