import { constants, readFileSync, copyFileSync, existsSync, watchFile, mkdirSync } from 'fs'
import { Tabletojson as tableToJSON } from 'tabletojson'
import chalk from 'chalk'
import axios from 'axios'

import { readConfig } from './config.js'
const { COPYFILE_EXCL } = constants

const configFile = readConfig()
const { instrumentId, statusPath, historyPath } = configFile
let { serverAddress } = configFile

if (process.env.NODE_ENV !== 'dev' && process.env.NODE_ENV !== 'docker-dev') {
  serverAddress += '/api'
}

const statusFileHandler = verbose => {
  if (verbose) {
    console.log(chalk.blue('Parsing status file'))
  }
  try {
    let statusHTML = readFileSync(statusPath).toString()
    if (statusPath !== historyPath) {
      statusHTML = statusHTML + readFileSync(historyPath).toString()
    }
    const statusObj = {
      instrumentId,
      data: tableToJSON.convert(statusHTML)
    }

    axios
      .patch(serverAddress + '/tracker/status', statusObj)
      .then(res => {
        if (verbose) {
          if (res.status === 201) {
            console.log(
              chalk.greenBright('Status on server was updated'),
              chalk.yellow(` [${new Date().toLocaleString()}]`)
            )
          }
        }
      })
      .catch(err => {
        console.log(chalk.red('[Server Error]', err))
      })

    if (process.env.TEST_URL && process.env.TEST_INSTR_ID) {
      const testStatusObj = { ...statusObj, instrumentId: process.env.TEST_INSTR_ID }
      patch(process.env.TEST_URL + '/api/tracker/status', testStatusObj)
        .then(res => {
          if (res.status === 201) {
            console.log(chalk.greenBright('Test server was updated'))
          }
        })
        .catch(err => {
          console.log(chalk.red('[Test Server Error]', err))
        })
    }
  } catch (err) {
    console.log(err)
  }
}

//helper functions for dev purposes triggered  by parameter -s
let statusFileCount = 1
let historyFileCount = 1
const saveStatusHandler = () => {
  console.log(`Saving status file number ${statusFileCount}`)
  copyFileSync(statusPath, `./status-save/status-${statusFileCount}.html`, COPYFILE_EXCL)
  statusFileCount++
}
const saveHistoryHandler = () => {
  console.log(`Saving history file number ${historyFileCount}`)
  copyFileSync(historyPath, `./status-save/history-${historyFileCount}.html`, COPYFILE_EXCL)
  historyFileCount++
}

const tracker = (verbose, save) => {
  axios
    .get(serverAddress + '/tracker/ping/' + instrumentId)
    .then(res => {
      if (res.status === 200) {
        console.log(chalk.greenBright(`Instrument ${res.data.name} is connected to the server`))
        statusFileHandler(verbose)
      }
    })
    .catch(err => {
      console.log(
        chalk.red(
          '[Server Error]',
          err,
          'Connection refused by the server. Double check server URL and instrument ID in the client configuration'
        )
      )
    })

  if (existsSync(statusPath)) {
    watchFile(statusPath, () => {
      if (save) {
        if (!existsSync('./status-save/')) {
          mkdirSync('./status-save/')
        }
        saveStatusHandler()
      }
      statusFileHandler(verbose)
    })
    console.log(chalk.greenBright(`Tracker watching ${statusPath}`))
    console.log(chalk.cyan.italic('Press Ctrl+C any time to quit'))
  } else {
    console.log(red.inverse('   Status file path is invalid   '))
  }

  if (statusPath !== historyPath && existsSync(historyPath) && save) {
    watchFile(historyPath, () => {
      if (!existsSync('./status-save/')) {
        mkdirSync('./status-save/')
      }
      saveHistoryHandler()
    })
  }
}

export default tracker
