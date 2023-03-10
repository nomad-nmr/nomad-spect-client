import { writeFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import chalk from 'chalk'

import { readConfig } from './config.js'

const { submissionPath } = readConfig()

export const bookExps = data => {
  try {
    const dataObj = JSON.parse(data)
    let submissionFile = `USER ${dataObj[0].group}`

    dataObj.forEach(entry => {
      submissionFile += `
	
HOLDER ${entry.holder}
NAME ${entry.sampleId}
SOLVENT ${entry.solvent}
NO_SUBMIT
`
      entry.experiments.forEach(exp => {
        const params = exp.params ? `PARAMETERS ${exp.params}` : ``
        const night = entry.night ? `NIGHT` : ``
        const priority = entry.priority ? `PRIORITY` : ``
        submissionFile += `
${night}
${priority}
EXPNO ${exp.expNo}
${params}
EXPERIMENT ${exp.paramSet}
TITLE ${entry.title} || ${exp.expTitle}
`
      })
    })
    submissionFile += `		
END`

    writeFileSync(submissionPath + uuidv4() + '-b', submissionFile)
  } catch (error) {
    console.log(chalk.red('Client failed to write submission file', error))
  }
}

export const deleteExps = data => {
  try {
    let submissionFile = ''
    JSON.parse(data).forEach(holder => {
      submissionFile += `
  HOLDER ${holder}
  DELETE
      `
    })
    submissionFile += `
  END`
    writeFileSync(submissionPath + uuidv4() + '-d', submissionFile)
  } catch (error) {
    console.log(chalk.red('Client failed to write submission file', error))
  }
}

export const submitExps = data => {
  try {
    let submissionFile = ''
    JSON.parse(data).forEach(holder => {
      submissionFile += `
HOLDER ${holder}
SUBMIT_HOLDER ${holder}
			`
    })
    submissionFile += `
END`
    writeFileSync(submissionPath + uuidv4() + '-s', submissionFile)
  } catch (error) {
    console.log(chalk.red('Client failed to write submission file', error))
  }
}

// const socket = getSocket(serverAddress, instrumentId)

const submitter = socket => {
  socket.on('book', data => bookExps(data))
  socket.on('delete', data => deleteExps(data))
  socket.on('submit', data => submitExps(data))
}

export default submitter
