import { join } from 'path'
import { readdir, stat, access, readFile } from 'fs/promises'

import { readConfig } from '../config.js'

const { nmrDataPathManual } = readConfig()

export default async (data, cb) => {
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

        if (expNoArr.length === 0) {
          return
        }

        await Promise.all(
          expNoArr.map(async expNo => {
            const expNoFolderPath = join(datasetFolderPath, expNo)

            const { title, solvent, pulseProgram, expNoStats, procsStats } = await parseMetaData(
              expNoFolderPath
            )

            if (procsStats) {
              exps.push({
                expNo,
                dateCreated: expNoStats.ctime.toISOString(),
                dateLastModified: procsStats.mtime.toISOString(),
                title,
                solvent,
                pulseProgram,
                key: folder + '#-#' + expNo
              })
            }
          })
        )
        responseData.push({
          datasetName: folder,
          date: folderStats.ctime.toISOString(),
          exps,
          key: folder
        })
      })
    )
    cb(responseData.filter(i => i.exps.length > 0))
  } catch (error) {
    cb('error')
    console.log(error)
  }
}

//helper function that parses data folder metadata
export const parseMetaData = async expNoFolderPath => {
  const titlePath = join(expNoFolderPath, 'pdata', '1', 'title')
  const paramsPath = join(expNoFolderPath, 'acqus')
  const procsPath = join(expNoFolderPath, 'pdata', '1', 'procs')

  let title
  let paramsFileArr
  let procsStats
  let expNoStats
  let solvent
  let pulseProgram

  try {
    await access(expNoFolderPath)
    expNoStats = await stat(expNoFolderPath)
  } catch (error) {
    console.log(error)
  }

  try {
    await access(titlePath)
    title = await readFile(titlePath, 'utf-8')
  } catch (error) {
    console.log(error)
  }

  try {
    await access(paramsPath)
    paramsFileArr = await (await readFile(join(paramsPath), 'utf-8')).split('##$')
    const solventE = paramsFileArr.find(e => e.startsWith('SOLVENT'))
    solvent = solventE.slice(10, solventE.indexOf('>'))

    const pulProgE = paramsFileArr.find(e => e.startsWith('PULPROG'))
    pulseProgram = pulProgE.slice(10, pulProgE.indexOf('>'))
  } catch (error) {
    console.log(error)
  }

  try {
    await access(procsPath)
    procsStats = await stat(procsPath)
  } catch (error) {
    console.log(error)
  }

  console.log(expNoStats.ctime.toISOString())
  console.log(procsStats.mtime.toISOString())

  return Promise.resolve({ title, solvent, pulseProgram, expNoStats, procsStats })
}

//helper function that returns array of subfolders in source folder
const getSubFolders = async source => {
  const subfolderArr = (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  return Promise.resolve(subfolderArr)
}
