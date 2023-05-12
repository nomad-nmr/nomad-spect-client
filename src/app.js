import yargs from 'yargs'

import tracker from './tracker.js'
import submitter from './submitter.js'
import uploader from './uploader.js'
import getSocket from './getSocket.js'
import claimManual from './claimManual/index.js'
import { setConfig } from './config.js'

yargs(process.argv.slice(2))
  .command({
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
      setConfig(argv.list)
    }
  })
  .command({
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
      claimManual(socket)
    }
  })
  .help()
  .parse()
