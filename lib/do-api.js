const request = require('request-promise')

module.exports.listDomainRecords = ({ token, domainName }) =>
  request({
    method: 'GET',
    url: `https://api.digitalocean.com/v2/domains/${domainName}/records`,
    json: true,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    }
  }).then(res => res.domain_records)

module.exports.createDomainRecord = ({ token, domainName, domainRecord }) => {
  console.log(JSON.stringify(domainRecord))
  return request({
    method: 'POST',
    url: `https://api.digitalocean.com/v2/domains/${domainName}/records`,
    json: true,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: domainRecord
  }).then(res => res.domain_record)
}

module.exports.updateDomainRecord = ({
  token,
  domainName,
  domainRecordId,
  updateData
}) =>
  request({
    method: 'PUT',
    url: `https://api.digitalocean.com/v2/domains/${domainName}/records/${domainRecordId}`,
    json: true,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: updateData
  }).then(res => res.domain_record)
