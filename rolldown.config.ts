
import url from 'node:url'
import pkg from './package.json' with { type: 'json'}
import type { PackageJson } from 'type-fest'
import { defineConfig, type RolldownOptions } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'
import copy from 'rollup-plugin-copy'
import nodeExternals from 'rollup-plugin-node-externals'

import path from 'node:path'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const exports = (pkg.exports || {}) as PackageJson.ExportConditions
const exportedModules = Object.entries(exports).filter?.(([, exp]) => typeof exp === 'object' && !Array.isArray(exp)) as [string, PackageJson.ExportConditions][]

const input = {}
let outDir:string |undefined= undefined
for (const [target, exp] of exportedModules) {
    if (typeof exp.import === 'string') {
        const esmSource = (exp.importSource as string | undefined) || './src/index.ts'
        const name = path.relative('./src', esmSource).replace(/\.ts$/, '')
        input[name] = esmSource

        if ( target === '.') {
            const dirs = exp.import.split('/')
            outDir = [dirs[0], dirs[1]].join('/')
        }

    }
}
if (!outDir) {
    throw new Error('Could not detect the output.dir')
}

const esmConfig: RolldownOptions = {
    input,
    output: {
        dir: outDir,
        sourcemap: process.env.NODE_ENV !== 'production' ? 'inline' : false,
    },
    platform: 'node',
    cwd: __dirname,
    plugins:[
        dts(),
        nodeExternals(),
        copy({
            targets: [
                { src: 'src/templates/**/*.ejs', dest: 'build' },
                { src: 'src/templates/**/*.feature', dest: 'build' },
            ],
            flatten: false,
        }),
    ]
}
export default defineConfig(esmConfig)
