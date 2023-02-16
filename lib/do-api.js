const fetch = require('node-fetch')


module.exports.listDomainRecords = ({ token, domainName, ...rest }) =>
  jsonFetch(`https://api.digitalocean.com/v2/domains/${domainName}/records${appendQuery(rest)}`, {
    token,
    method: 'GET'
  }).then(res => res.domain_records)

module.exports.createDomainRecord = ({ token, domainName, domainRecord }) =>
  jsonFetch(`https://api.digitalocean.com/v2/domains/${domainName}/records`, {
    token,
    method: 'POST',
    body: domainRecord
  }).then(res => res.domain_record)

module.exports.updateDomainRecord = ({
  token,
  domainName,
  domainRecordId,
  updateData
}) =>
  jsonFetch(
    `https://api.digitalocean.com/v2/domains/${domainName}/records/${domainRecordId}`,
    {
      token,
      method: 'PUT',
      body: updateData
    }
  ).then(res => res.domain_record)

async function jsonFetch (url, { method, token, body }) {
  const fetchOpts = {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    }
  }

  if (body) {
    fetchOpts.body = JSON.stringify(body)
  }

  const res = await fetch(url, fetchOpts)
  if (!res.ok) {
    const result = await res.text()
    throw new Error(
      'DigitalOcean API request failed with status ' +
        res.status +
        ': ' +
        result
    )
  }

  return res.json()
}


function appendQuery(queryVariables) {
  const queryString = new URLSearchParams(queryVariables).toString();
  return queryString === '' ? '' : `?${queryString};`
}