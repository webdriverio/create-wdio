import url from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import { spawn, type SpawnOptions } from 'node:child_process'
import chalk from 'chalk'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export const colorItBold = chalk.bold.rgb(234, 89, 6)
export const colorIt = chalk.rgb(234, 89, 6)

process.on('SIGINT', () => printAndExit(undefined, 'SIGINT'))

export function runProgram (command: string, args: string[], options: SpawnOptions) {
    const child = spawn(command, args, { stdio: 'inherit', shell: true, ...options })
    return new Promise<void>((resolve, rejects) => {
        let error: Error
        child.on('error', (e) => (error = e))
        child.on('close', (code, signal) => {
            if (code !== 0) {
                const errorMessage = (error && error.message) || `Error calling: ${command} ${args.join(' ')}`
                printAndExit(errorMessage, signal)
                return rejects(errorMessage)
            }
            resolve()
        })
    })
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

function printAndExit (error?: string, signal?: NodeJS.Signals | null) {
    if (signal === 'SIGINT') {
        console.log('\n\nGoodbye 👋')
    } else {
        console.log(`\n\n⚠️  Ups, something went wrong${error ? `: ${error}` : ''}!`)
    }

    process.exit(1)
}
