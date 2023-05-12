import { existsSync, readFileSync, writeFile } from 'fs'
import { join } from 'path'

import prompt from 'prompt'
import chalk from 'chalk'

export const readConfig = () => {
  //configuration for docker environment
  if (process.env.NODE_ENV === 'docker' || process.env.NODE_ENV === 'docker-dev') {
    return {
      instrumentId: process.env.INSTRUMENT_ID,
      statusPath: process.env.STATUS_PATH,
      historyPath: process.env.HISTORY_PATH,
      serverAddress: process.env.SERVER_URL,
      submissionPath: process.env.SUBMIT_PATH,
      nmrDataPathAuto: process.env.NMR_DATA_PATH_AUTO,
      nmrDataPathManual: process.env.NMR_DATA_PATH_MANUAL,
      uploadDelay: process.env.UPLOAD_DELAY
    }
  }

  //configuration for docker test environment
  if (process.env.NODE_ENV === 'test') {
    return {
      submissionPath: './submit_files',
      nmrDataPathManual: join(__dirname, '../tests/fixtures/data-manual'),
      nmrDataPathAuto: join(__dirname, '../tests/fixtures/data-auto'),
      instrumentId: '123-test-id',
      serverAddress: 'test-server-url'
    }
  }

  //configuration for node.js production environment
  const configPath = existsSync('./src/config/config.json')
    ? './src/config/config.json'
    : './src/config/config-default.json'
  const configJSON = readFileSync(configPath).toString()
  try {
    return JSON.parse(configJSON)
  } catch (err) {
    console.log(chalk.red('ERROR - config.json is empty or corrupted'))
    console.log(chalk.red.italic('Use app.js config to save new configuration'))
    return {}
  }
}

export const setConfig = list => {
  console.log(list)
  if (list) {
    console.log(chalk.greenBright.inverse(' *** Current client config *** '))
    console.log(readConfig())
  } else {
    console.log(
      chalk.cyanBright(
        'This utility will walk you through client configuration stored in config.json file.\nPress enter to confirm current value shown in ()'
      )
    )
    const configObj = readConfig()
    prompt.start()
    prompt.get(
      [
        {
          name: 'instrumentId',
          description: chalk.greenBright('Instrument ID found in Admin Setting Instruments table'),
          type: 'string',
          default: configObj.instrumentId
        },
        {
          name: 'statusPath',
          description: chalk.greenBright('Relative path to file with status table'),
          type: 'string',
          default: configObj.statusPath
        },
        {
          name: 'historyPath',
          description: chalk.greenBright('Relative path to file with history table'),
          type: 'string',
          default: configObj.historyPath
        },
        {
          name: 'serverAddress',
          description: chalk.greenBright('HTTP address of the server'),
          type: 'string',
          default: configObj.serverAddress
        },
        {
          name: 'submissionPath',
          description: chalk.greenBright('Relative to submission folder'),
          type: 'string',
          default: configObj.submissionPath
        },
        {
          name: 'nmrDataPathAuto',
          description: chalk.greenBright('Absolute path to IconNMR data folder'),
          type: 'string',
          default: configObj.nmrDataPathAuto
        },
        {
          name: 'nmrDataPathManual',
          description: chalk.greenBright('Absolute path to manual NMR data folder'),
          type: 'string',
          default: configObj.nmrDataPathManual
        },
        {
          name: 'uploadDelay',
          description: chalk.greenBright('Delay for data upload [ms]'),
          type: 'number',
          default: configObj.uploadDelay
        }
      ],
      (err, result) => {
        if (err) {
          return onError(err)
        }
        const newConfigJSON = JSON.stringify(result)
        writeFile('./src/config/config.json', newConfigJSON, () => {
          console.log(chalk.blue('     !!!   SUCCESS   !!!   '))
          console.log(chalk.greenBright.inverse(' *** Current client config *** '))
          console.log(readConfig())
        })
      }
    )
  }
}

const onError = err => {
  console.log(err)
  return 1
}

// export const readConfig = readConfig
// export const setConfig = setConfig
