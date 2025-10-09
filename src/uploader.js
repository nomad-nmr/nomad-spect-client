import { join } from 'path'
import { readFile, readdir } from 'fs/promises'

import chalk from 'chalk'
import FormData from 'form-data'
import axios from './axios-instance.js'

import { readConfig } from './config.js'
import zipDataFolder from './zipDataFolder.js'
import { parseMetaData } from './claimManual/getFolders.js'

const { instrumentId, nmrDataPathAuto, uploadDelay, nmrDataPathManual } = readConfig()

export const uploadDataAuto = async (payload, verbose) => {
  const { datasetName, expNo, group } = JSON.parse(payload)

  if (verbose) {
    console.log(
      chalk.magenta(`Uploading data ${datasetName}-${expNo}`),
      chalk.yellow(` [${new Date().toLocaleString()}]`)
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
    form.append('dataType', 'auto')
    form.append('nmrData', zippedNMRData, 'nmrData.zip')

    const response = await axios.post('/data/auto/' + instrumentId, form, {
      headers: { ...form.getHeaders() },
      maxContentLength: 100000000,
      maxBodyLength: 1000000000
    })
    if (response.status === 200 && verbose) {
      console.log(chalk.green('Success!'))
      console.timeEnd('upload')
    }
  } catch (error) {
    console.log(error)
    console.log(chalk.red('Data upload failed'), chalk.yellow(` [${new Date().toLocaleString()}]`))
  }
}

export const uploadDataManual = async (payload, verbose) => {
  const { userId, group, expsArr, claimId, sampleManager } = JSON.parse(payload)

  try {
    console.time('upload-m')

    await Promise.all(
      expsArr.map(async exp => {
        const datasetName = exp.split('#-#')[0]
        const expNo = exp.split('#-#')[1]
        if (verbose) {
          console.log(
            chalk.magenta(`Uploading data ${datasetName}#-#${expNo}`),
            chalk.yellow(` [${new Date().toLocaleString()}]`)
          )
        }

        const dataPath = join(nmrDataPathManual, group, 'nmr', datasetName, expNo)

        const { title, solvent, pulseProgram, expNoStats } = await parseMetaData(dataPath)

        // file deepcode ignore PT: <Unclear why this is unsecure>
        const zippedNMRData = await zipDataFolder(dataPath)

        const form = new FormData()

        form.append('datasetName', datasetName)
        form.append('expNo', expNo)
        form.append('group', group)
        form.append('userId', userId)
        form.append('title', title)
        form.append('solvent', solvent)
        form.append('pulseProgram', pulseProgram)
        form.append('instrumentId', instrumentId)
        form.append('dataType', 'manual')
        form.append('claimId', claimId)
        form.append('dateCreated', expNoStats.ctime.toISOString())
        form.append('nmrData', zippedNMRData, 'nmrData.zip')

        const response = await axios.post('/data/manual/' + instrumentId, form, {
          headers: { ...form.getHeaders() },
          maxContentLength: 100000000,
          maxBodyLength: 1000000000
        })

        if (response.status === 200 && verbose) {
          console.log(chalk.green(`${datasetName}-${expNo} Upload Success!`))
        }
      })
    )
    console.timeEnd('upload-m')

    if (sampleManager) {
      const datasetPath = join(nmrDataPathManual, group, 'nmr', expsArr[0].split('#-#')[0])

      // Get all .json files in datasetPath and load their contents into sampleManagerData
      let sampleManagerData = []
      const files = await readdir(datasetPath)
      const jsonFiles = files.filter(f => f.endsWith('.json'))
      sampleManagerData = await Promise.all(
        jsonFiles.map(async file => {
          const filePath = join(datasetPath, file)
          const content = await readFile(filePath, 'utf8')
          return JSON.parse(content)
        })
      )
      // sampleManagerData now contains all parsed JSON objects from the folder

      const response = await axios.post('/datasets/sample-manager/' + instrumentId, {
        userId,
        group,
        expsArr,
        sampleManagerData
      })
      if (response.status === 200 && verbose) {
        console.log(chalk.green(`Sample Manager Upload Success!`))
      }
    }
  } catch (error) {
    console.log(chalk.red('Data upload failed'), chalk.yellow(` [${new Date().toLocaleString()}]`))
    console.log(error)
  }
}

const uploader = (socket, verbose) => {
  socket.on('upload-auto', payload => {
    //timeout to wait until the whole dataset is written by TopSpin
    //If the timeout is to short or null incomplete dataset is uploaded
    setTimeout(() => uploadDataAuto(payload, verbose), uploadDelay || 15000)
  })

  socket.on('upload-repair', payload => uploadDataAuto(payload))

  socket.on('upload-manual', payload => uploadDataManual(payload, verbose))
}

export default uploader
