import { join } from 'path'

import chalk from 'chalk'
import FormData from 'form-data'
import axios from 'axios'

import { readConfig } from './config.js'
import zipDataFolder from './zipDataFolder.js'

const { instrumentId, nmrDataPathAuto, serverAddress, uploadDelay } = readConfig()

const uploader = (socket, verbose) => {
  socket.on('upload', async payload => {
    const { datasetName, expNo, group, repair } = JSON.parse(payload)

    const uploadData = async () => {
      if (verbose) {
        console.log(
          chalk.magenta(`Uploading data ${datasetName}-${expNo}`),
          chalk.yellow(` [${new Date().toLocaleString()}]`),
          !repair && `delay: ${uploadDelay}`
        )
      }

      try {
        console.time('upload')

        const dataPath = join(nmrDataPathAuto, group, 'nmr', datasetName, expNo)
        // file deepcode ignore PT: <Unclear why this is unsecure>
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
    }

    if (repair) {
      uploadData()
    } else {
      //timeout to wait until the whole dataset is written by TopSpin
      //If the timeout is to short or null incomplete dataset is uploaded
      setTimeout(() => uploadData(), uploadDelay || 15000)
    }
  })
  // socket.on('repair', payload => {
  //   console.log(JSON.parse(payload))
  // })
}

export default uploader
