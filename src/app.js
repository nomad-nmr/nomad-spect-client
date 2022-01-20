const yargs = require('yargs')

const tracker = require('./tracker')
const submitter = require('./submitter')
const uploader = require('./uploader')
const getSocket = require('./getSocket')
const config = require('./config')

yargs.command({
  command: 'config',
  describe: 'Client configuration',
  builder: {
    list: {
      alias: 'l',
      describe: 'List configuration file',
      type: 'boolean'
    }
  },
  handler(argv) {
    config.setConfig(argv.list)
  }
})

yargs.command({
  command: 'run',
  describe: 'Start client',
  builder: {
    verbose: {
      alias: 'v',
      describe: 'Client running with console logs',
      type: 'boolean'
    },
    save: {
      alias: 's',
      describe: 'Client saving status files',
      type: 'boolean'
    }
  },
  handler(argv) {
    tracker(argv.verbose, argv.save)
    const socket = getSocket()
    submitter(socket)
    uploader(socket, argv.verbose)
  }
})

yargs.parse()
