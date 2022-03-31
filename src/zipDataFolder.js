const path = require('path')
const { access } = require('fs/promises')
const fs = require('fs')

const JsZip = require('jszip')

const zipDataFolder = async dataFolderPath => {
  try {
    const zip = new JsZip()
    await access(dataFolderPath)
    const allPaths = getFilePathsRecursiveSync(dataFolderPath)

    console.log(allPaths)

    allPaths.forEach(filePath => {
      const relativePath = path.relative(path.join(dataFolderPath, '../..'), filePath)
      //Replacing slashing to convert from Win to Linux paths
      const addPath = relativePath.replace(/\\/g, '/')
      const data = fs.readFileSync(filePath)
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
  var results = []
  list = fs.readdirSync(dir)
  var pending = list.length
  if (!pending) return results

  for (let file of list) {
    file = path.resolve(dir, file)
    let stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      res = getFilePathsRecursiveSync(file)
      results = results.concat(res)
    } else {
      results.push(file)
    }
    if (!--pending) return results.map(i => i.replace(/\\/g, '/'))
  }

  return results.map(i => i.replace(/\\/g, '/'))
}

module.exports = zipDataFolder
