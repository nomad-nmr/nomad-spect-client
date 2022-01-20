const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const { readConfig } = require('./config')

const { submissionPath } = readConfig()

const bookExps = data => {
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

  fs.writeFileSync(submissionPath + uuidv4() + '-b', submissionFile)
}

const deleteExps = data => {
  let submissionFile = ''
  JSON.parse(data).forEach(holder => {
    submissionFile += `
HOLDER ${holder}
DELETE
		`
  })
  submissionFile += `
END`
  fs.writeFileSync(submissionPath + uuidv4() + '-d', submissionFile)
}

const submitExps = data => {
  let submissionFile = ''
  JSON.parse(data).forEach(holder => {
    submissionFile += `
HOLDER ${holder}
SUBMIT_HOLDER ${holder}
			`
  })
  submissionFile += `
END`
  fs.writeFileSync(submissionPath + uuidv4() + '-s', submissionFile)
}

// const socket = getSocket(serverAddress, instrumentId)

const submitter = socket => {
  socket.on('book', data => bookExps(data))
  socket.on('delete', data => deleteExps(data))
  socket.on('submit', data => submitExps(data))

  //Connecting socket for test server
  // if (process.env.TEST_URL && process.env.TEST_INSTR_ID) {
  //   const testSocket = getSocket(process.env.TEST_URL, process.env.TEST_INSTR_ID)
  //   testSocket.on('book', data => bookExps(data))
  //   testSocket.on('delete', data => deleteExps(data))
  //   testSocket.on('submit', data => submitExps(data))
  // }
}

module.exports = submitter
