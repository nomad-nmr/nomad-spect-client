import { relative, join, resolve } from 'path'
import { access } from 'fs/promises'
import { readFileSync, readdirSync, statSync } from 'fs'

import JsZip from 'jszip'

const zipDataFolder = async dataFolderPath => {
  try {
    const zip = new JsZip()
    await access(dataFolderPath)
    const allPaths = getFilePathsRecursiveSync(dataFolderPath)

    allPaths.forEach(filePath => {
      const relativePath = relative(join(dataFolderPath, '../..'), filePath)
      //Replacing slashing to convert from Win to Linux paths
      const addPath = relativePath.replace(/\\/g, '/')
      const data = readFileSync(filePath)
      zip.file(addPath, data)
    })

    const zipped = await zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    return Promise.resolve(zipped)
  } catch (error) {
    console.log(error)
    return Promise.reject(error)
  }
}

//helper function that returns array of all paths in data folder
const getFilePathsRecursiveSync = dir => {
  let results = []
  const list = readdirSync(dir)
  let pending = list.length
  if (!pending) return results

  for (let file of list) {
    file = resolve(dir, file)
    const stat = statSync(file)
    if (stat && stat.isDirectory()) {
      const res = getFilePathsRecursiveSync(file)
      results = results.concat(res)
    } else {
      results.push(file)
    }
    if (!--pending) return results.map(i => i.replace(/\\/g, '/'))
  }

  return results.map(i => i.replace(/\\/g, '/'))
}

export default zipDataFolder
