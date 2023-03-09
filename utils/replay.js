//helper function for development testing
//replay status files stored in status-save folder
//delay in ms can be used as argument, default 5000 ms

import { readdirSync, copyFileSync } from 'fs'

const statusFileCount = readdirSync('../status-save')
  .map(i => i.split('-')[0])
  .filter(i => i === 'status').length

const delay = process.argv[2] || 5000

const timer = ms => new Promise(res => setTimeout(res, ms))

const copyStatus = async () => {
  for (let i = 1; i <= statusFileCount; i++) {
    console.log(`status-${i}`)
    copyFileSync(`../status-save/status-${i}.html`, '../status_files/status.html')
    await timer(delay)
  }
  console.log('Finished')
}

copyStatus()
