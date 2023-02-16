const publicIp = require('public-ip')
const R = require('ramda')

const api = require('./do-api')
const log = require('./log')

module.exports = function build () {
  let pendingIp

  return domain => {
    return ensureAddress(domain)
      .then(updateOrCreateDomainRecord)
      .catch(e => {
        log.error(e)
        throw e
      })
  }

  async function ensureAddress (opts) {
    if (opts.address) {
      log.info(`Using address: ${opts.address}`)
      return opts
    }

    if (!pendingIp) {
      log.info('Obtaining public IP address')
      pendingIp = publicIp.v4()
    }

    const ip = await pendingIp
    log.info(`Using public IP address: ${ip}`)

    return Object.assign({}, opts, { address: ip })
  }

  async function updateOrCreateDomainRecord (opts) {
    const domainRecord = await getExistingDomainRecord(opts)

    if (!domainRecord && opts.create) {
      return createDomainRecord(opts)
    } else if (domainRecord) {
      return updateDomainRecord(opts, domainRecord)
    } else {
      log.error(
        `Cannot find domain record "${opts.recordName}.${opts.domainName}". Set the --create flag if you want to create it.`
      )
      throw new Error('Domain record not found')
    }
  }

  async function getExistingDomainRecord (opts) {
    log.info("Fetch existing Domain records");
    const domainRecords = await api.listDomainRecords({
      token: opts.token,
      domainName: opts.domainName,
      type: opts.recordType,
      name:
        opts.recordName === "@"
          ? opts.domainName
          : `${opts.recordName}.${opts.domainName}`,
    });
    return (
      domainRecords.find((r) => r.name === opts.recordName) || false
    );
  }

  async function createDomainRecord (opts) {
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

    const newDomainRecord = await api.createDomainRecord({
      token: opts.token,
      domainName: opts.domainName,
      domainRecord
    })

    log.info(
      `Success creating domain record: ${JSON.stringify(newDomainRecord)}`
    )

    return opts
  }

  async function updateDomainRecord (opts, domainRecord) {
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

    const updatedRecord = await api.updateDomainRecord({
      token: opts.token,
      domainName: opts.domainName,
      domainRecordId: domainRecord.id,
      updateData
    })

    log.info(`Success updating domain record: ${JSON.stringify(updatedRecord)}`)

    return opts
  }
}
