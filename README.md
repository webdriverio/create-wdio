WebdriverIO Starter Toolkit
===========================

One command to create a fresh WebdriverIO project or add WebdriverIO to an existing project. It is not required to use `wdio` on any project, you can install them on your own, but it is very easy to start from scratch.

<p align="center">
    <img src="https://raw.githubusercontent.com/webdriverio/wdio/main/.github/assets/demo.gif" alt="Example" />
</p>

## Usage
To install a WebdriverIO project, just run

```sh
# install in current directory
npx wdio .

# install in new directory
npx wdio /path/to/new/project
```

## Supported Options

You can pass the following command line flags to modify the bootstrap mechanism:

* `--dev` - Install all packages as `devDependencies` (default: `true`)
* `--yes` - Will fill in all config defaults without prompting (default: `false`)
* `--use-yarn` - yes, we support yarn too! (default: `true`)
* `--verbose` - print additional logs (default: `false`)

----

For more information on WebdriverIO see the [homepage](https://webdriver.io).
