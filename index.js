const buildDomains = require('./lib/build-domains')
const updateDomain = require('./lib/update-domain')

module.exports = async args => {
  let domains
  try {
    domains = await buildDomains(args)
  } catch (e) {
    process.exit(1)
  }

  const updater = updateDomain()
  for (const domain of domains) {
    try {
      await updater(domain)
    } catch (e) {
      process.exit(1)
    }
  }

  process.exit(0)
}
