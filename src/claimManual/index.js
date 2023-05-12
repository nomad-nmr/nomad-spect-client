import getFolders from './getFolders.js'

const claimManual = socket => {
  socket.on('get-folders', getFolders)
}

export default claimManual
