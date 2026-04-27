# madlad

A CLI argument parser for Node.js. Handles commands, subcommand groups, options, positional arguments, type validation, shell completion, and help text generation.

## Install

```bash
npm install madlad
```

## Basic usage

```js
import { createParser, Command, Group } from 'madlad'

const parser = createParser({
  application: { name: 'My App', command: 'myapp', version: '1.0.0', description: '...' }
})

parser.addCommand(
  new Command('greet', 'Say hello')
    .withOption({ key: 'name', type: 'string', required: true, description: 'Who to greet' })
)

const ctx = await parser.parse(process.argv.slice(2))

if (ctx.exitReason) process.exit(0)

// ctx.command.key === 'greet'
// ctx.options.name === 'Alice'
```

## Commands and groups

```js
parser.addGroup(
  new Group('users', 'Manage users')
    .withCommand(new Command('list', 'List all users'))
    .withCommand(new Command('add', 'Add a user'))
)

// myapp users list
// ctx.group.key === 'users', ctx.command.key === 'list'
```

## Argument types

`string`, `boolean`, `number`, `bigint`, `hex-string`, `decimal-string`

Numbers support unit suffixes (`1.5k` → 1500, `2m` → 2000000, `1b`, `1t`) and underscore separators (`1_000_000`).

```js
.withOption({ key: 'count', type: 'number', minimum: 1, maximum: 100 })
.withOption({ key: 'hash',  type: 'hex-string', length: 64 })
```

## Positional arguments

```js
new Command('copy', 'Copy a file')
  .withPositional({ key: 'src', type: 'string', required: true, description: 'Source' })
  .withPositional({ key: 'dst', type: 'string', required: true, description: 'Destination' })

// myapp copy file1.txt file2.txt
// ctx.arguments.src === 'file1.txt'
```

## Options

```js
.withOption({ key: 'verbose', type: 'boolean', alias: 'v', default: false, description: 'Verbose' })
.withOption({ key: 'tag', type: 'string', array: true, description: 'Tags (repeatable)' })
.withOption({ key: 'token', type: 'string', envKey: 'API_TOKEN', description: 'API token' })
.withOption({ key: 'output', required: { when: 'save' }, description: 'Required if --save is set' })
.withOption({ key: 'json', conflicts: 'yaml', description: 'Mutually exclusive with --yaml' })
```

## Global options

```js
parser.addGlobalOption({ key: 'config', type: 'string', global: true, description: 'Config file' })
```

## Sourcemap

Know where each value came from: `'explicit'`, `'env'`, or `'default'`.

```js
ctx.sourcemap.token // 'env' if it came from API_TOKEN, 'explicit' if passed on CLI
```

## Shell completion

```js
const suggestions = await parser.suggest(line, cursorOffset, trailingChar)
```

Use `autocompletePath: true` on an argument to get filesystem path suggestions.

Use `generateCompletion(command, shell)` (shells: `bash`, `zsh`, `fish`) to generate a completion script to source in the user's shell config.

## Custom printer

```js
createParser({
  printer: {
    print: (text) => process.stdout.write(text),
    printError: (text) => process.stderr.write(text),
    printHeading: (text) => console.log(`\n${text}`),
    formatDim: (text) => `\x1b[2m${text}\x1b[0m`,
    formatImportant: (text) => `\x1b[1m${text}\x1b[0m`,
  }
})
```

## License

MIT
