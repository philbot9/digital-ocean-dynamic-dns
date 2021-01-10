const fs = require('fs-extra')
const check = require('check')
const R = require('ramda')

const log = require('./log')
const buildDomains = require('./build-domains')

module.exports = async args => {
  let domains
  if (args.file) {
    domains = await buildDomainsFromFile(args)
  } else {
    domains = [buildDomain(args)]
  }
  return domains
}

function buildDomain (data) {
  const completeDomain = {
    token: data.token,
    address: data.address,
    domainName: data.domainName,
    recordName: data.recordName,
    recordType: R.propOr('A', 'recordType', data),
    recordTtl: R.propOr(null, 'recordTtl', data),
    recordPriority: R.propOr(null, 'recordPriority', data),
    recordPort: R.propOr(null, 'recordPort', data),
    recordWeight: R.propOr(null, 'recordWeight', data),
    create: R.propOr(false, 'create', data)
  }

  const errors = check(completeDomain)
    .hasString('token')
    .hasString('domainName')
    .hasString('recordName')
    .errors()

  if (errors.length) {
    errors.forEach(log.error)
    throw new Error('Missing or invalid arguments.')
  }

  return completeDomain
}

async function buildDomainsFromFile (args) {
  log.info('Reading config file ' + args.file)
  let configFile
  try {
    configFile = await readConfigFile(args.file)
  } catch (e) {
    log.error('Failed to read config file: ' + e.message)
    throw e
  }

  const domains = Array.isArray(configFile) ? configFile : [configFile]
  return domains.map(d => buildDomain(mergeArgsAndDomain(d, args)))
}

function readConfigFile (filepath) {
  return fs.readJSON(filepath)
}

function mergeArgsAndDomain (args, domain) {
  return Object.assign({}, args, domain)
}
