jest.mock('node-fetch')
const mockFetch = require('node-fetch')

const api = require('./do-api')

describe('lib/do-api', () => {
  afterEach(() => jest.resetAllMocks())

  function createResponse (status, data) {
    return {
      status,
      ok: status >= 200 && status < 300,
      text: () => Promise.resolve(JSON.stringify(data)),
      json: () => Promise.resolve(data)
    }
  }

  describe('listDomainRecords()', () => {
    it('fetches a list of domain records', () => {
      const token = 'abc123'
      const domainName = 'domain.test'
      const domainRecords = [{ record: 1 }, { record: 2 }]
      mockFetch.mockReturnValue(
        Promise.resolve(createResponse(200, { domain_records: domainRecords }))
      )

      return api.listDomainRecords({ token, domainName }).then(result => {
        const reqUrl = mockFetch.mock.calls[0][0]
        const reqOpts = mockFetch.mock.calls[0][1]
        expect(reqUrl).toContain(domainName)
        expect(reqOpts.method).toBe('GET')
        expect(reqOpts.headers['content-type']).toBe('application/json')
        expect(reqOpts.headers.authorization).toBe(`Bearer ${token}`)
        expect(result).toEqual(domainRecords)
      })
    })

    it('rejects if request fails', async () => {
      const token = 'abc123'
      const domainName = 'domain.test'
      const domainRecords = [{ record: 1 }, { record: 2 }]
      mockFetch.mockReturnValue(
        Promise.resolve(createResponse(501, { some: 'error' }))
      )

      const result = await await expect(
        api.listDomainRecords({ token, domainName })
      ).rejects.toThrow(/501/)
    })
  })

  describe('createDomainRecord()', () => {
    it('creates a domain record', () => {
      const token = 'abc123'
      const domainName = 'domain.test'
      const updatedData = { record: 'data' }
      const domainRecord = { updatedRecord: 1 }
      mockFetch.mockReturnValue(
        Promise.resolve(createResponse(200, { domain_record: domainRecord }))
      )

      return api
        .createDomainRecord({ token, domainName, domainRecord })
        .then(result => {
          const reqUrl = mockFetch.mock.calls[0][0]
          const reqOpts = mockFetch.mock.calls[0][1]
          expect(reqUrl).toContain(domainName)
          expect(reqOpts.method).toBe('POST')
          expect(reqOpts.headers['content-type']).toBe('application/json')
          expect(reqOpts.headers.authorization).toBe(`Bearer ${token}`)
          expect(reqOpts.body).toEqual(JSON.stringify(domainRecord))
          expect(result).toEqual(domainRecord)
        })
    })
  })

  describe('updateDomainRecord()', () => {
    it('updates a domain record', () => {
      const token = 'abc123'
      const domainName = 'domain.test'
      const domainRecordId = 1234
      const updateData = { record: 'data' }
      const domainRecord = { updatedRecord: 1 }
      mockFetch.mockReturnValue(
        Promise.resolve(createResponse(200, { domain_record: domainRecord }))
      )

      return api
        .updateDomainRecord({ token, domainName, domainRecordId, updateData })
        .then(result => {
          const reqUrl = mockFetch.mock.calls[0][0]
          const reqOpts = mockFetch.mock.calls[0][1]
          expect(reqUrl).toContain(domainName)
          expect(reqUrl).toContain(domainRecordId)
          expect(reqOpts.method).toBe('PUT')
          expect(reqOpts.headers['content-type']).toBe('application/json')
          expect(reqOpts.headers.authorization).toBe(`Bearer ${token}`)
          expect(reqOpts.body).toEqual(JSON.stringify(updateData))
          expect(result).toEqual(domainRecord)
        })
    })
  })
})
