import { join } from 'path'
import { readdir, stat, access, readFile } from 'fs/promises'

import { readConfig } from '../config.js'

const { nmrDataPathManual } = readConfig()

const getFolders = async (data, cb) => {
  const groupFolderPath = join(nmrDataPathManual, data.group, 'nmr')

  try {
    await access(groupFolderPath)
  } catch (error) {
    console.log(error)
    return cb('error')
  }

  try {
    const responseData = []
    const datasetFolders = await getSubFolders(groupFolderPath)
    await Promise.all(
      datasetFolders.map(async folder => {
        const datasetFolderPath = join(groupFolderPath, folder)
        const folderStats = await stat(datasetFolderPath)

        //getting detailed info for each expNo subfolder
        const exps = []
        const expNoArr = await getSubFolders(datasetFolderPath)
        await Promise.all(
          expNoArr.map(async expNo => {
            const expNoFolderPath = join(datasetFolderPath, expNo)
            const expNoStats = await stat(expNoFolderPath)

            const titlePath = join(expNoFolderPath, 'pdata', '1', 'title')
            const paramsPath = join(expNoFolderPath, 'acqus')
            const procsPath = join(expNoFolderPath, 'pdata', '1', 'procs')

            let title
            let paramsFileArr
            let procsStats

            try {
              await access(titlePath)
              title = await readFile(titlePath, 'utf-8')
            } catch (error) {
              console.log(error)
            }

            try {
              await access(paramsPath)
              paramsFileArr = await (await readFile(join(paramsPath), 'utf-8')).split('##$')
            } catch (error) {
              console.log(error)
            }

            const solventE = paramsFileArr.find(e => e.startsWith('SOLVENT'))
            const solvent = solventE.slice(10, solventE.indexOf('>'))

            const pulProgE = paramsFileArr.find(e => e.startsWith('PULPROG'))
            const pulseProgram = pulProgE.slice(10, pulProgE.indexOf('>'))

            try {
              await access(procsPath)
              procsStats = await stat(procsPath)
            } catch (error) {
              console.log(error)
            }

            exps.push({
              expNo,
              dateCreated: expNoStats.ctime,
              dateLastModified: procsStats.mtime,
              title,
              solvent,
              pulseProgram,
              key: folder + '-' + expNo
            })
          })
        )
        responseData.push({ datasetName: folder, date: folderStats.ctime, exps, key: folder })
      })
    )
    cb(responseData)
  } catch (error) {
    console.log(error)
  }
}

//helper function that returns array of subfolders in source folder
const getSubFolders = async source => {
  const subfolderArr = (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  return Promise.resolve(subfolderArr)
}

export default getFolders
