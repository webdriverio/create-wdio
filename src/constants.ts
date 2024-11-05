import { colorItBold, colorIt } from './utils.js'

type PM = 'npm' | 'pnpm' | 'yarn' | 'bun';

export const DEFAULT_NPM_TAG = 'latest'
export const ASCII_ROBOT = `
                 -:...........................-:.
                 +                              +
              \`\` +      \`...\`        \`...\`      + \`
            ./+/ +    .:://:::\`    \`::///::\`  \` + ++/.
           .+oo+ +    /:+ooo+-/    /-+ooo+-/ ./ + +oo+.
           -ooo+ +    /-+ooo+-/    /-+ooo+-/ .: + +ooo.
            -+o+ +    \`::///:-\`    \`::///::\`    + +o+-
             \`\`. /.     \`\`\`\`\`        \`\`\`\`\`     .: .\`\`
                  .----------------------------.
           \`-::::::::::::::::::::::::::::::::::::::::-\`
          .+oooo/:------------------------------:/oooo+.
      \`.--/oooo-                                  :oooo/--.\`
    .::-\`\`:oooo\`                                  .oooo-\`\`-::.
  ./-\`    -oooo\`--.: :.--                         .oooo-    \`-/.
 -/\`    \`-/oooo////////////////////////////////////oooo/.\`    \`/-
\`+\`   \`/+oooooooooooooooooooooooooooooooooooooooooooooooo+:\`   .+\`
-/    +o/.:oooooooooooooooooooooooooooooooooooooooooooo:-/o/    +.
-/   .o+  -oooosoooososssssooooo------------------:oooo- \`oo\`   +.
-/   .o+  -oooodooohyyssosshoooo\`                 .oooo-  oo.   +.
-/   .o+  -oooodooysdooooooyyooo\` \`.--.\`\`     .:::-oooo-  oo.   +.
-/   .o+  -oooodoyyodsoooooyyooo.//-..-:/:.\`.//.\`./oooo-  oo.   +.
-/   .o+  -oooohsyoooyysssysoooo+-\`     \`-:::.    .oooo-  oo.   +.
-/   .o+  -ooooosooooooosooooooo+//////////////////oooo-  oo.   +.
-/   .o+  -oooooooooooooooooooooooooooooooooooooooooooo-  oo.   +.
-/   .o+  -oooooooooooooooooooooooooooooooooooooooooooo-  oo.   +.
-+////o+\` -oooo---:///:----://::------------------:oooo- \`oo////+-
+ooooooo/\`-oooo\`\`:-\`\`\`.:\`.:.\`.+/-    .::::::::::\` .oooo-\`+ooooooo+
oooooooo+\`-oooo\`-- \`/\` .:+  -/-\`/\`   .::::::::::  .oooo-.+oooooooo
+-/+://-/ -oooo-\`:\`.o-\`:.:-\`\`\`\`.:    .///:\`\`\`\`\`\`  -oooo-\`/-//:+:-+
: :..--:-:.+ooo+/://o+/-.-:////:-....-::::-....--/+ooo+.:.:--.-- /
- /./\`-:-\` .:///+/ooooo/+///////////////+++ooooo/+///:. .-:.\`+./ :
:-:/.           :\`ooooo\`/\`              .:.ooooo :           ./---
                :\`ooooo\`/\`              .:.ooooo :
                :\`ooooo./\`              .:-ooooo :
                :\`ooooo./\`              .:-ooooo :
            \`...:-+++++:/.              ./:+++++-:...\`
           :-.\`\`\`\`\`\`\`\`/../              /.-:\`\`\`\`\`\`\`\`.:-
          -/::::::::://:/+             \`+/:+::::::::::+.
          :oooooooooooo++/              +++oooooooooooo-
`

export const PROGRAM_TITLE = `
                           ${colorItBold('Webdriver.IO')}
              ${colorIt('Next-gen browser and mobile automation')}
                    ${colorIt('test framework for Node.js')}
`

export const UNSUPPORTED_NODE_VERSION = (
    '⚠️  Unsupported Node.js Version Error ⚠️\n' +
    `You are using Node.js ${process.version} which is too old to be used with WebdriverIO.\n` +
    'Please update to Node.js v20 to continue.\n'
)

export const INSTALL_COMMAND: Record<PM, string> = {
    npm: 'install',
    pnpm: 'add',
    yarn: 'add',
    bun: 'install'
} as const

export const EXECUTER: Record<PM, string> = {
    npm: 'npx',
    pnpm: 'pnpm',
    yarn: 'yarn',
    bun: 'bunx'
} as const

export const EXECUTE_COMMAND: Record<PM, string> = {
    npm: '',
    pnpm: 'exec',
    yarn: 'exec',
    bun: ''
} as const

export const DEV_FLAG: Record<PM, string> = {
    npm: '--save-dev',
    pnpm: '--save-dev',
    yarn: '--dev',
    bun: '--dev'
} as const

export const PMs = Object.keys(INSTALL_COMMAND) as PM[]
