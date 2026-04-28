const { createParser, Command } = require('../../src')

it('should accept a valid enum value for an option', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('paint', 'Paint').withOption({
      key: 'color',
      description: 'Color',
      type: 'enum',
      enum: ['red', 'green', 'blue'],
    }),
  )
  const context = await parser.parse(['paint', '--color', 'red'])
  expect(context).toHaveProperty('options')
  expect(context.options).toHaveProperty('color', 'red')
})

it('should reject an invalid enum value for an option', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('paint', 'Paint').withOption({
      key: 'color',
      description: 'Color',
      type: 'enum',
      enum: ['red', 'green', 'blue'],
    }),
  )
  const context = await parser.parse(['paint', '--color', 'purple'])
  expect(context).toBe('[color] must be one of: red, green, blue')
})

it('should accept a valid enum value for a positional argument', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('paint', 'Paint').withPositional({
      key: 'color',
      description: 'Color',
      type: 'enum',
      enum: ['red', 'green', 'blue'],
    }),
  )
  const context = await parser.parse(['paint', 'green'])
  expect(context).toHaveProperty('arguments')
  expect(context.arguments).toHaveProperty('color', 'green')
})

it('should reject an invalid enum value for a positional argument', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('paint', 'Paint').withPositional({
      key: 'color',
      description: 'Color',
      type: 'enum',
      enum: ['red', 'green', 'blue'],
    }),
  )
  const context = await parser.parse(['paint', 'yellow'])
  expect(context).toBe('[color] must be one of: red, green, blue')
})

it('should reject an invalid enum value for an option that has a default', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('paint', 'Paint').withOption({
      key: 'color',
      description: 'Color',
      type: 'enum',
      enum: ['red', 'green', 'blue'],
      default: 'blue',
    }),
  )
  const context = await parser.parse(['paint', '--color', 'purple'])
  expect(context).toBe('[color] must be one of: red, green, blue')
})

it('should use the default enum value when no value is provided', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('paint', 'Paint').withOption({
      key: 'color',
      description: 'Color',
      type: 'enum',
      enum: ['red', 'green', 'blue'],
      default: 'blue',
    }),
  )
  const context = await parser.parse(['paint'])
  expect(context).toHaveProperty('options')
  expect(context.options).toHaveProperty('color', 'blue')
})
