const { Manager } = require('socket.io-client')
const { readConfig } = require('./config')

const getSocket = () => {
  const { serverAddress, instrumentId } = readConfig()
  const manager = new Manager(serverAddress, {
    reconnectionDelayMax: 100000,
    query: { instrumentId }
  })

  const socket = manager.socket('/')

  return socket
}

module.exports = getSocket
