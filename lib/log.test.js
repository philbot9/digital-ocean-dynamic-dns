const chalk = require('chalk')

global.console.log = jest.fn()
global.console.error = jest.fn()
const log = require('./log')

describe('lib/log', () => {
  afterEach(() => jest.clearAllMocks())

  it('logs info to stdout', () => {
    const msg = 'test info message'
    log.info(msg)
    const logParam = global.console.log.mock.calls[0][1]
    expect(logParam).toEqual(msg)
  })

  it('logs error to stderr', () => {
    const msg = 'test error message'
    log.error(msg)
    const logParam = global.console.error.mock.calls[0][1]
    expect(logParam).toEqual(chalk.red(msg))
  })
})
