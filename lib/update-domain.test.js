const mockPublicIp = {
  v4: jest.fn(() => Promise.resolve())
}

const mockApi = {
  listDomainRecords: jest.fn(() => Promise.resolve()),
  createDomainRecord: jest.fn(() => Promise.resolve()),
  updateDomainRecord: jest.fn(() => Promise.resolve())
}

jest.setMock('public-ip', mockPublicIp)
jest.setMock('./do-api', mockApi)

const updateDomain = require('./update-domain')

describe('lib/update-domain', () => {
  it('rejects if invalid props are provided', () => {
    return expect(updateDomain({ invalid: 'opts' })).rejects.toBeDefined()
  })

  it('uses the public IP if no address is provided', () => {
    const opts = {
      token: '123abc',
      domainName: 'domain.test',
      recordName: 'test'
    }
    const ip = '123.456.789.123'

    mockPublicIp.v4.mockReturnValueOnce(ip)

    return updateDomain(opts).then(() => {
      expect(mockPublicApi).toHaveBeenCalledWith()
      expect()
    })
  })
})
