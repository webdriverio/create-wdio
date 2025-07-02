import fg from 'fast-glob'
import path from 'node:path'
import url from 'node:url'
import shell from 'shelljs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const rootDir = path.resolve(__dirname, '..')

type CopyData ={
    from:{
        dir:string,
        pattern:string,
    },
    to:string
}

type CopyOptions ={
    resolveFrom: string,
    assets: CopyData[]
}

async function copy(options:CopyOptions) {
    console.log(`==== ${options.resolveFrom}`)
    for (const asset of options.assets) {
        const files = await fg(path.resolve(asset.from.dir, asset.from.pattern), { cwd: options.resolveFrom })
        for (const file of files) {
            console.log(file)
            const to = path.resolve(asset.to, path.relative(asset.from.dir, file))
            shell.mkdir('-p', path.dirname(to))
            shell.cp(file, path.dirname(to))
        }
    }
}

copy({
    resolveFrom: rootDir,
    assets: [{
        from: {
            dir: path.resolve(rootDir, 'src', 'templates' ),
            pattern: path.resolve('**', '*.ejs')
        },
        to: path.resolve(rootDir, 'build', 'templates')
    }, {
        from: {
            dir: path.resolve(rootDir, 'src', 'templates' ),
            pattern: path.resolve('**', '*.feature')
        },
        to: path.resolve(rootDir, 'build', 'templates')
    }]
})
