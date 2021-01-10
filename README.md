# digital-ocean-dynamic-dns

Dynamically update Domain Records on Digital Ocean.

[![Build Status](https://travis-ci.org/philbot9/digital-ocean-dynamic-dns.svg?branch=master)](https://travis-ci.org/philbot9/digital-ocean-dynamic-dns)

## Installation

```
$ npm install -g digital-ocean-dynamic-dns
```

## Basic Usage

You can specify an address with the `-a` parameter, or don't and `dodd` will use your public IP instead.

```
$ dodd -t <DigitalOceanApiToken> -a <someIp> -d <yourDomain.tld> -r <domainRecordTitle>
```

```
$ dodd -t <DigitalOceanApiToken> -d <yourDomain.tld> -r <domainRecordTitle>
```

### Example with a specific IP

To change `home.example.com` to direct to `123.456.789.123`:

```
$ dodd -t abc123def456ghi789 -a 123.456.789.123 -d example.com -r home
```

### Example using the public IP

To change `home.example.com` to direct to whatever your public IP is:

```
$ dodd -t abc123def456ghi789 -d example.com -r home
```

### Create

If the `-c` or `--create` flag is set and the record does not exist under the given domain, it will be created.

```
$ dodd -t abc123def456ghi789 -d example.com -r home --create
```

### Config file

Using the `-f` or `--file` option, all parameters can be set from a JSON file. It's possible to specify multiple domains when the JSON file contains an array of domains. Any arguments passed on the command line will also be applied but will be overridden by the file contents.

```
$ dodd -t abc123def456ghi789 -f /path/to/file.json
```

`/path/to/file.json`

```
[
  {
    "domainName": "domain.tld",
    "recordName": "record"
  },
  {
    "token": "xyz987uvw654qrs321",
    "domainName": "other.tld",
    "recordName": "test"
  }
]
```

## Run automatically

On Linux you can run `dodd` at boot and then repeatedly at a certain interval using **systemd**. Set up the command in [`systemd/dodd.service`](systemd/dodd.service) and set a time interal in [`systemd/dodd.timer`](systemd/dodd.timer). Then copy both to `/etc/systemd/system/` and start them with

```
$ systemctl start dodd.service
$ systemctl start dodd.timer
```

To auto-start the service after boot run.

```
$ systemctl enable dodd.service
$ systemctl enable dodd.timer
```

The above will run `dodd` with the parameters defined in `dodd.service` after boot, as soon as the network is available. After that it will run the same command regularly as defined by the interval in the `dodd.timer` file (hourly by default).

You can veryify that the `dodd` timer is active by running `systemctl list-timers`.

## More Options

There are more optional parameters. Use `dodd --help` for details.

```
$ dodd --help

  Usage: dodd [options]

  Options:

    -h, --help                             output usage information
    -t, --token <token>                    Your Digital Ocean API token
    -a, --address <address>                The address the DNS record should direct to. Uses the public IP if none is provided.
    -d, --domainName <domainName>          The domain name itself (<domainName>.tld)
    -r, --recordName <recordName>          The name of the comain record (<recordName>.domain.tld)
    -y, --recordType <recordType>          The type of DNS record (A, CNAME, TXT, ...). Defaults to A.
    -l, --recordTtl <recordTtl>            The time to live for the record, in seconds. Deafults to 1800.
    -p, --recordPriority <recordPriority>  The priority of the host (SRV and MX records only).
    -o, --recordPort <recordPort>          The port that the service is accessible on (SRV records only).
    -w, --recordWeight <recordWeight>      The weight of records with the same priority (SRV records only).
    -c, --create                           Create a new domain record if none exists. Creates the domain RECORD, not a domain.

```
