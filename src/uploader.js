const path = require('path')
const fs = require('fs/promises')

const chalk = require('chalk')
const FormData = require('form-data')
const axios = require('axios')
const ZipDir = require('zip-dir')

const { readConfig } = require('./config')
const { from } = require('form-data')
const { Console } = require('console')
const { instrumentId, nmrDataPath, serverAddress } = readConfig()

if (process.env.NODE_ENV !== 'dev') {
  serverAddress += '/api'
}

const uploader = (socket, verbose) => {
  socket.on('upload', async payload => {
    const { datasetName, expNo, group } = JSON.parse(payload)
    if (verbose) {
      console.log(
        chalk.magenta(`Uploading data ${datasetName}-${expNo}`),
        chalk.yellow(` [${new Date().toLocaleString()}]`)
      )
    }

    try {
      console.time('upload')
      const dataPath = path.join(nmrDataPath, group, 'nmr', datasetName, expNo)
      const blob = await ZipDir(dataPath)

      const form = new FormData()
      form.append('instrumentId', instrumentId)
      form.append('datasetName', datasetName)
      form.append('expNo', expNo)
      form.append('group', group)
      form.append('nmrData', blob, 'nmrData.zip')

      const response = await axios.post(serverAddress + '/data/auto/' + instrumentId, form, {
        headers: { ...form.getHeaders() }
      })
      if (response.status === 200 && verbose) {
        console.log(chalk.green('Success!'))
      }
    } catch (error) {
      console.log(
        chalk.red('Data upload failed'),
        chalk.yellow(` [${new Date().toLocaleString()}]`)
      )
    }
    console.timeEnd('upload')
  })
}

module.exports = uploader
