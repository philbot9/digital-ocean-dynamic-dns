const chalk = require('chalk')

module.exports.info = msg => console.log(chalk.green.bold(' [~]'), msg)

module.exports.error = msg =>
  console.error(chalk.red.bold(' [!]'), chalk.red(msg))
