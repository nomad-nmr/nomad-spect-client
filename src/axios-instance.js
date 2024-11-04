import axios from 'axios'
import { readConfig } from './config.js'

const configFile = readConfig()

const instance = axios.create({
  // /api has to be added in to the route to allow host both front and back end using single nginx server in production environment
  baseURL: configFile.serverAddress + '/api'
})

export default instance
