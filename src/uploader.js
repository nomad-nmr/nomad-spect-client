const chalk = require('chalk')

const uploader = (socket, verbose) => {
  socket.on('upload', metadata => {
    const { datasetName, expNo } = JSON.parse(metadata)
    if (verbose) {
      console.log(
        chalk.magenta(`Uploading data ${datasetName}-${expNo}`),
        chalk.yellow(` [${new Date().toLocaleString()}]`)
      )
    }
  })
}

module.exports = uploader
