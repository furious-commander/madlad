const { createParser, Command } = require('../../src')

const parser = createParser()
parser.addCommand(
  new Command('test', 'Test').withPositional({ key: 'amount', description: 'Test', type: 'decimal-string' }),
)

it('should parse integer as decimal string', async () => {
  const context = await parser.parse(['test', '42'])
  expect(context).toHaveProperty('arguments.amount', '42')
})

it('should parse decimal with fractional part', async () => {
  const context = await parser.parse(['test', '3.14159265358979'])
  expect(context).toHaveProperty('arguments.amount', '3.14159265358979')
})

it('should parse arbitrarily large integer as decimal string', async () => {
  const context = await parser.parse(['test', '99999999999999999999999999999'])
  expect(context).toHaveProperty('arguments.amount', '99999999999999999999999999999')
})

it('should parse arbitrarily large number with fractional part', async () => {
  const context = await parser.parse(['test', '99999999999999999999.99999999999999999999'])
  expect(context).toHaveProperty('arguments.amount', '99999999999999999999.99999999999999999999')
})

it('should strip underscore delimiters', async () => {
  const context = await parser.parse(['test', '1_000_000.50'])
  expect(context).toHaveProperty('arguments.amount', '1000000.50')
})

it('should strip underscore delimiters in fractional part', async () => {
  const context = await parser.parse(['test', '1.000_001'])
  expect(context).toHaveProperty('arguments.amount', '1.000001')
})

it('should raise error when argument is not a valid decimal string', async () => {
  const context = await parser.parse(['test', 'not-a-number'])
  expect(context).toBe('Expected decimal string for amount, got not-a-number')
})

it('should raise error on multiple decimal points', async () => {
  const context = await parser.parse(['test', '1.2.3'])
  expect(context).toBe('Expected decimal string for amount, got 1.2.3')
})

it('should raise error on trailing decimal point', async () => {
  const context = await parser.parse(['test', '42.'])
  expect(context).toBe('Expected decimal string for amount, got 42.')
})

it('should raise error on leading decimal point', async () => {
  const context = await parser.parse(['test', '.5'])
  expect(context).toBe('Expected decimal string for amount, got .5')
})
