const { createParser, Command } = require('../../src')

it('should pass through context when validation succeeds', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('send', 'Send').withOption({
      key: 'amount',
      description: 'Amount',
      type: 'number',
      validate: value => (value > 0 ? [] : ['Amount must be positive']),
    }),
  )
  const context = await parser.parse(['send', '--amount', '10'])
  expect(context).toHaveProperty('options')
  expect(context.options).toHaveProperty('amount', 10)
})

it('should return error when option validation fails', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('send', 'Send').withOption({
      key: 'amount',
      description: 'Amount',
      type: 'number',
      validate: value => (value > 0 ? [] : ['Amount must be positive']),
    }),
  )
  const context = await parser.parse(['send', '--amount', '-5'])
  expect(context).toBe('Amount must be positive')
})

it('should return multiple errors joined when validation returns multiple messages', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('send', 'Send').withOption({
      key: 'amount',
      description: 'Amount',
      type: 'number',
      validate: value => {
        const errors = []
        if (value <= 0) errors.push('Amount must be positive')
        if (value > 1000) errors.push('Amount must not exceed 1000')
        return errors
      },
    }),
  )
  const context = await parser.parse(['send', '--amount', '-5'])
  expect(context).toBe('Amount must be positive')
})

it('should pass full context to validator enabling cross-argument validation', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('send', 'Send')
      .withOption({
        key: 'unit',
        description: 'Unit (eth or wei)',
        type: 'string',
        default: 'eth',
      })
      .withOption({
        key: 'amount',
        description: 'Amount',
        type: 'string',
        validate: (value, context) => {
          if (context.options.unit === 'wei' && value.includes('.')) {
            return ['Amount in wei must be a whole number']
          }
          return []
        },
      }),
  )
  const context = await parser.parse(['send', '--unit', 'wei', '--amount', '0.5'])
  expect(context).toBe('Amount in wei must be a whole number')
})

it('should pass cross-argument validation when values are compatible', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('send', 'Send')
      .withOption({
        key: 'unit',
        description: 'Unit (eth or wei)',
        type: 'string',
        default: 'eth',
      })
      .withOption({
        key: 'amount',
        description: 'Amount',
        type: 'string',
        validate: (value, context) => {
          if (context.options.unit === 'wei' && value.includes('.')) {
            return ['Amount in wei must be a whole number']
          }
          return []
        },
      }),
  )
  const context = await parser.parse(['send', '--unit', 'wei', '--amount', '1000000'])
  expect(context).toHaveProperty('options')
  expect(context.options).toHaveProperty('amount', '1000000')
  expect(context.options).toHaveProperty('unit', 'wei')
})

it('should validate positional arguments', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('transfer', 'Transfer').withPositional({
      key: 'amount',
      description: 'Amount',
      type: 'number',
      validate: value => (value >= 0 ? [] : ['Amount must be non-negative']),
    }),
  )
  const context = await parser.parse(['transfer', '-1'])
  expect(context).toBe('Amount must be non-negative')
})

it('should pass positional validation when value is valid', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('transfer', 'Transfer').withPositional({
      key: 'amount',
      description: 'Amount',
      type: 'number',
      validate: value => (value >= 0 ? [] : ['Amount must be non-negative']),
    }),
  )
  const context = await parser.parse(['transfer', '42'])
  expect(context).toHaveProperty('arguments')
  expect(context.arguments).toHaveProperty('amount', 42)
})

it('should run validation after defaults are applied', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('send', 'Send').withOption({
      key: 'amount',
      description: 'Amount',
      type: 'number',
      default: -1,
      validate: value => (value > 0 ? [] : ['Amount must be positive']),
    }),
  )
  const context = await parser.parse(['send'])
  expect(context).toBe('Amount must be positive')
})

it('should allow positional argument validator to read option context', async () => {
  const parser = createParser()
  parser.addCommand(
    new Command('send', 'Send')
      .withOption({
        key: 'unit',
        description: 'Unit',
        type: 'string',
        default: 'eth',
      })
      .withPositional({
        key: 'amount',
        description: 'Amount',
        type: 'string',
        validate: (value, context) => {
          if (context.options.unit === 'wei' && value.includes('.')) {
            return ['Wei amount cannot have decimals']
          }
          return []
        },
      }),
  )
  const context = await parser.parse(['send', '--unit', 'wei', '1.5'])
  expect(context).toBe('Wei amount cannot have decimals')
})
