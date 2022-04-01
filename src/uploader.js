const path = require('path')
// const fs = require('fs/promises')

const chalk = require('chalk')
const FormData = require('form-data')
const axios = require('axios')

const { readConfig } = require('./config')
const zipDataFolder = require('./zipDataFolder')

const { instrumentId, nmrDataPath, serverAddress, uploadDelay } = readConfig()

const uploader = (socket, verbose) => {
  socket.on('upload', async payload => {
    const { datasetName, expNo, group } = JSON.parse(payload)

    //timeout to wait until the whole dataset is written by TopSpin
    //If the timeout is to short or null incomplete dataset is uploaded
    setTimeout(async () => {
      if (verbose) {
        console.log(
          chalk.magenta(`Uploading data ${datasetName}-${expNo}`),
          chalk.yellow(` [${new Date().toLocaleString()}]`),
          `delay: ${uploadDelay}`
        )
      }

      try {
        console.time('upload')
        const dataPath = path.join(nmrDataPath, group, 'nmr', datasetName, expNo)
        const zippedNMRData = await zipDataFolder(dataPath)

        const form = new FormData()
        form.append('datasetName', datasetName)
        form.append('expNo', expNo)
        form.append('group', group)
        form.append('nmrData', zippedNMRData, 'nmrData.zip')

        const response = await axios.post(serverAddress + '/data/auto/' + instrumentId, form, {
          headers: { ...form.getHeaders() },
          maxContentLength: 100000000,
          maxBodyLength: 1000000000
        })
        if (response.status === 200 && verbose) {
          console.log(chalk.green('Success!'))
          console.timeEnd('upload')
        }
      } catch (error) {
        console.log(
          chalk.red('Data upload failed'),
          chalk.yellow(` [${new Date().toLocaleString()}]`)
        )
        console.log(error)
      }
    }, uploadDelay || 15000)
  })
}

module.exports = uploader
