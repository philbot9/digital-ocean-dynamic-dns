const mockRequest = jest.fn(() => Promise.resolve())
jest.setMock('request-promise', mockRequest)

const api = require('./do-api')

describe('lib/do-api', () => {
  afterEach(() => jest.clearAllMocks())

  describe('listDomainRecords()', () => {
    it('fetches a list of domain records', () => {
      const token = 'abc123'
      const domainName = 'domain.test'
      const domainRecords = [{ record: 1 }, { record: 2 }]
      mockRequest.mockReturnValueOnce(
        Promise.resolve({ domain_records: domainRecords })
      )

      return api.listDomainRecords({ token, domainName }).then(result => {
        const reqOpts = mockRequest.mock.calls[0][0]
        expect(reqOpts.method).toBe('GET')
        expect(reqOpts.url).toContain(domainName)
        expect(reqOpts.headers['content-type']).toBe('application/json')
        expect(reqOpts.headers.authorization).toBe(`Bearer ${token}`)
        expect(result).toEqual(domainRecords)
      })
    })
  })

  describe('createDomainRecord()', () => {
    it('creates a domain record', () => {
      const token = 'abc123'
      const domainName = 'domain.test'
      const updatedData = { record: 'data' }
      const domainRecord = { updatedRecord: 1 }
      mockRequest.mockReturnValueOnce(
        Promise.resolve({ domain_record: domainRecord })
      )

      return api
        .createDomainRecord({ token, domainName, domainRecord })
        .then(result => {
          const reqOpts = mockRequest.mock.calls[0][0]
          expect(reqOpts.method).toBe('POST')
          expect(reqOpts.url).toContain(domainName)
          expect(reqOpts.headers['content-type']).toBe('application/json')
          expect(reqOpts.headers.authorization).toBe(`Bearer ${token}`)
          expect(reqOpts.body).toEqual(domainRecord)
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
      mockRequest.mockReturnValueOnce(
        Promise.resolve({ domain_record: domainRecord })
      )

      return api
        .updateDomainRecord({ token, domainName, domainRecordId, updateData })
        .then(result => {
          const reqOpts = mockRequest.mock.calls[0][0]
          expect(reqOpts.method).toBe('PUT')
          expect(reqOpts.url).toContain(domainName)
          expect(reqOpts.url).toContain(domainRecordId)
          expect(reqOpts.headers['content-type']).toBe('application/json')
          expect(reqOpts.headers.authorization).toBe(`Bearer ${token}`)
          expect(reqOpts.body).toEqual(updateData)
          expect(result).toEqual(domainRecord)
        })
    })
  })
})
