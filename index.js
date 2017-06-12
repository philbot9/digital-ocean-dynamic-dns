const updateDomain = require('./lib/update-domain')

module.exports = opts => updateDomain(opts).catch(e => process.exit(1))
