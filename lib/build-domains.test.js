const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const buildDomains = require('./build-domains')

describe('index', () => {
  const testfilepath = path.join(
    os.tmpdir(),
    'dodd-test-' + Date.now() + '.json'
  )
  afterEach(async () => {
    try {
      await fs.unlink(testfilepath)
    } catch (e) {}
  })

  it('works with cli args', async () => {
    const args = {
      token: 'token',
      domainName: 'domain.com',
      recordName: 'test'
    }
    await expect(buildDomains(args)).resolves.toMatchObject([args])
  })

  it('creates a new domain record with default values', async () => {
    const args = {
      token: '123abc',
      address: '123.456.789.123',
      recordName: 'test',
      domainName: 'domain.test',
      create: true
    }

    const domains = await buildDomains(args)
    expect(domains.length).toBe(1)
    expect(domains[0]).toMatchObject(args)
    expect(domains[0].recordType).toBe('A')
  })

  it('rejects if domain info is incomplete', async () => {
    const args = {
      token: '123abc'
    }

    await expect(buildDomains(args)).rejects.toThrow(/Missing/)
  })

  describe('config file', () => {
    it('works with single domain', async () => {
      const domain = {
        token: 'mytoken',
        domainName: 'domain.com',
        recordName: 'test'
      }
      await fs.writeJSON(testfilepath, domain)

      const results = await buildDomains({ file: testfilepath })
      expect(results.length).toBe(1)
      expect(results[0]).toMatchObject(domain)
    })

    it('works with multiple domains', async () => {
      const domains = [
        { domainName: 'test1.com', recordName: 'rec1' },
        { domainName: 'test2.com', recordName: 'rec2' },
        { domainName: 'test3.com', recordName: 'rec3' }
      ]

      await fs.writeJSON(testfilepath, domains)

      const results = await buildDomains({
        file: testfilepath,
        token: 'some-token'
      })

      expect(results.length).toBe(domains.length)

      results.forEach((domain, index) => {
        expect(domain).toMatchObject(domains[index])
        expect(domain.token).toEqual('some-token')
      })
    })

    it('rejects on file i/o error', async () => {
      await expect(
        buildDomains({ file: '/invalid/path' })
      ).rejects.toBeDefined()
    })
  })
})
