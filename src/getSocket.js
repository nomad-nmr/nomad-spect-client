import { Manager } from 'socket.io-client'
import { readConfig } from './config.js'

const getSocket = () => {
  const { serverAddress, instrumentId } = readConfig()
  const manager = new Manager(serverAddress, {
    reconnectionDelayMax: 100000,
    query: { instrumentId }
  })

  const socket = manager.socket('/')

  return socket
}

export default getSocket
