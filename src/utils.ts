import url from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import type { SpawnOptions } from 'node:child_process'

import spawn from 'cross-spawn'
import chalk from 'chalk'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export const colorItBold = chalk.bold.rgb(234, 89, 6)
export const colorIt = chalk.rgb(234, 89, 6)

export function runProgram (command: string, args: string[], options: SpawnOptions) {
    const child = spawn(command, args, { stdio: 'inherit', ...options })
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

export async function getPackageVersion() {
    try {
        const pkgJsonPath = path.join(__dirname, '..', 'package.json')
        const pkg = JSON.parse((await fs.readFile(pkgJsonPath)).toString())
        return `v${pkg.version}`
    } catch (e: any) {
        /* ignore */
    }
    return 'unknown'
}
