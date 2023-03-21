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
            const paramsPath = join(expNoFolderPath, 'pdata', '1', 'parm.txt')
            const procsPath = join(expNoFolderPath, 'pdata', '1', 'procs')

            let title
            let paramsArr
            let procsStats

            try {
              await access(titlePath)
              title = await readFile(titlePath, 'utf-8')
            } catch (error) {
              console.log(error)
            }

            try {
              await access(paramsPath)
              paramsArr = (await readFile(join(paramsPath), 'utf-8')).split('\r\n')
            } catch (error) {
              console.log(error)
            }

            const solvent =
              paramsArr &&
              paramsArr
                .find(e => e.startsWith('SOLVENT'))
                .slice(7)
                .trim()
            const pulseProgram =
              paramsArr &&
              paramsArr
                .find(e => e.startsWith('PULPROG'))
                .slice(7)
                .trim()

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
