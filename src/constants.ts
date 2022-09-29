import { colorItBold, colorIt } from './utils.js'

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
    `You are using Node ${process.version} so the project will be bootstrapped with an old unsupported version of tools.\n\n` +
    'Please update to Node 12 or higher for a better, fully supported experience.\n'
)

export const COMMUNITY_DISCLAIMER = (
    'Join our Gitter community and instantly find answers to your issues or queries. Or just join and say hi 👋!\n' +
    '  🔗 https://gitter.im/webdriverio/webdriverio\n' +
    '\n' +
    'Visit the project on GitHub to report bugs 🐛 or raise feature requests 💡:\n' +
    '  🔗 https://github.com/webdriverio/webdriverio\n'
)
