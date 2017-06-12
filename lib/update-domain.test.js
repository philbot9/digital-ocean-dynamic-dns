const mockPublicIp = {
  v4: jest.fn(() => Promise.resolve())
}

const mockApi = {
  listDomainRecords: jest.fn(() => Promise.resolve([])),
  createDomainRecord: jest.fn(() => Promise.resolve({})),
  updateDomainRecord: jest.fn(() => Promise.resolve({}))
}

const mockLog = {
  info: () => {},
  error: () => {}
}

jest.setMock('public-ip', mockPublicIp)
jest.setMock('./do-api', mockApi)
jest.setMock('./log', mockLog)

const updateDomain = require('./update-domain')

describe('lib/update-domain', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects if invalid props are provided', () => {
    return expect(updateDomain({ invalid: 'opts' })).rejects.toBeDefined()
  })

  it('uses a provided address', () => {
    const ip = '123.456.789.123'
    const opts = {
      token: '123abc',
      address: ip,
      domainName: 'domain.test',
      recordName: 'test'
    }

    mockApi.listDomainRecords.mockReturnValueOnce([
      {
        name: opts.recordName
      }
    ])

    return updateDomain(opts).then(() => {
      const updateOpts = mockApi.updateDomainRecord.mock.calls[0][0]
      expect(updateOpts.updateData.data).toEqual(ip)
    })
  })

  it('uses the public IP if no address is provided', () => {
    const opts = {
      token: '123abc',
      domainName: 'domain.test',
      recordName: 'test'
    }
    const ip = '123.456.789.123'

    mockPublicIp.v4.mockReturnValueOnce(Promise.resolve(ip))
    mockApi.listDomainRecords.mockReturnValueOnce([
      {
        name: opts.recordName
      }
    ])

    return updateDomain(opts).then(() => {
      expect(mockPublicIp.v4).toHaveBeenCalledWith()
      const updateOpts = mockApi.updateDomainRecord.mock.calls[0][0]
      expect(updateOpts.updateData.data).toEqual(ip)
    })
  })

  it('updates an existing domain record with minimum opts', () => {
    const ip = '123.456.789.123'
    const opts = {
      token: '123abc',
      address: ip,
      domainName: 'domain.test',
      recordName: 'testname'
    }

    const domainRecord = {
      id: '123domain',
      name: opts.recordName
    }

    mockApi.listDomainRecords.mockReturnValueOnce([domainRecord])

    return updateDomain(opts).then(() => {
      const updateOpts = mockApi.updateDomainRecord.mock.calls[0][0]
      expect(updateOpts.token).toEqual(opts.token)
      expect(updateOpts.domainName).toEqual(opts.domainName)
      expect(updateOpts.domainRecordId).toEqual(domainRecord.id)
      expect(updateOpts.updateData).toEqual({
        type: 'A',
        name: opts.recordName,
        data: ip
      })
    })
  })

  it('fully updates an existing domain record', () => {
    const ip = '123.456.789.123'
    const opts = {
      token: '123abc',
      address: ip,
      recordType: 'B',
      recordName: 'test',
      recordPriority: '3',
      recordPort: '123',
      recordTtl: '4200',
      recordWeight: '200',
      domainName: 'domain.test'
    }

    const domainRecord = {
      id: '123domain',
      name: opts.recordName
    }

    mockApi.listDomainRecords.mockReturnValueOnce([domainRecord])

    return updateDomain(opts).then(() => {
      const updateOpts = mockApi.updateDomainRecord.mock.calls[0][0]
      expect(updateOpts.token).toEqual(opts.token)
      expect(updateOpts.domainName).toEqual(opts.domainName)
      expect(updateOpts.domainRecordId).toEqual(domainRecord.id)
      expect(updateOpts.updateData).toEqual({
        type: opts.recordType,
        name: opts.recordName,
        data: ip,
        priority: opts.recordPriority,
        port: opts.recordPort,
        ttl: opts.recordTtl,
        weight: opts.recordWeight
      })
    })
  })

  it('creates a new domain record if none exists if create == true', () => {})
})
