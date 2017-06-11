const publicIp = require('public-ip')
const R = require('ramda')
const check = require('check')
const co = require('co')

const api = require('./do-api')
const log = require('./log')

module.exports = function (opts) {
  return validateOpts(opts)
    .then(ensureAddress)
    .then(updateOrCreateDomainRecord)
    .catch(e => {
      log.error(e)
      process.exit(1)
    })
}

function validateOpts (opts) {
  const completeOpts = {
    token: opts.token,
    address: opts.address,
    domainName: opts.domainName,
    recordName: opts.recordName,
    recordType: R.propOr('A', 'recordType', opts),
    recordTtl: R.propOr(null, 'recordTtl', opts),
    recordPriority: R.propOr(null, 'recordPriority', opts),
    recordPort: R.propOr(null, 'recordPort', opts),
    recordWeight: R.propOr(null, 'recordWeight', opts),
    create: R.propOr(false, 'create', opts)
  }

  const errors = check(completeOpts)
    .hasString('token')
    .hasString('domainName')
    .hasString('recordName')
    .errors()

  if (errors.length) {
    errors.forEach(log.error)
    return Promise.reject('Missing or invalid arguments.')
  }

  return Promise.resolve(completeOpts)
}

function ensureAddress (opts) {
  return co(function * () {
    if (opts.address) {
      log.info(`Using address: ${opts.address}`)
      return opts
    }

    log.info('Obtain public IP address')
    const ip = yield publicIp.v4()
    log.info(`Public IP: ${ip}`)

    return Object.assign({}, opts, { address: ip })
  })
}

function updateOrCreateDomainRecord (opts) {
  return co(function * () {
    const domainRecord = yield getExistingDomainRecord(opts)

    if (!domainRecord && opts.create) {
      return createDomainRecord(opts)
    } else if (domainRecord) {
      return updateDomainRecord(opts, domainRecord)
    } else {
      throw new Error(
        `Cannot find domain record "${opts.recordName}.${opts.domainName}". Set the --create flag if you want to create it.`
      )
    }
  })
}

function getExistingDomainRecord (opts) {
  return co(function * () {
    log.info('Fetch existing Domain records')
    const domainRecords = yield api.listDomainRecords({
      token: opts.token,
      domainName: opts.domainName
    })
    return domainRecords.find(r => r.name === opts.recordName) || false
  })
}

function createDomainRecord (opts) {
  return co(function * () {
    const domainRecord = {
      type: opts.recordType,
      name: opts.recordName,
      data: opts.address,
      priority: opts.recordPriority,
      port: opts.recordPort,
      ttl: opts.recordTtl,
      weight: opts.recordWeight
    }

    log.info(
      `Create new domain record "${domainRecord.name}.${opts.domainName}", type ${domainRecord.type}.`
    )

    const newDomainRecord = yield api.createDomainRecord({
      token: opts.token,
      domainName: opts.domainName,
      domainRecord
    })

    log.info(
      `Success creating domain record: ${JSON.stringify(newDomainRecord)}`
    )
  })
}

function updateDomainRecord (opts, domainRecord) {
  co(function * () {
    if (opts.address === domainRecord.data) {
      log.info(
        `Domain record "${opts.recordName}.${opts.domainName}" already directs to ${opts.address}. No update required.`
      )
      return
    }

    log.info(
      `Update "${opts.recordName}.${opts.domainName}" to direct to ${opts.address}.`
    )

    const updateData = R.filter(Boolean, {
      type: opts.recordType,
      name: opts.recordName,
      data: opts.address,
      priority: opts.recordPriority,
      port: opts.recordPort,
      ttl: opts.recordTtl,
      weight: opts.recordWeight
    })

    const updatedRecord = yield api.updateDomainRecord({
      token: opts.token,
      domainName: opts.domainName,
      domainRecordId: domainRecord.id,
      updateData
    })

    log.info(`Success updating domain record: ${JSON.stringify(updatedRecord)}`)
  })
}
