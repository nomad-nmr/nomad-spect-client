const fs = require('fs')
const tableToJSON = require('tabletojson').Tabletojson
const chalk = require('chalk')
const axios = require('axios')

const { readConfig } = require('./config')

const { instrumentId, statusPath, historyPath, serverAddress } = readConfig()

const statusFileHandler = verbose => {
	if (verbose) {
		console.log(chalk.blue('parsing status file'), chalk.yellow(` [${new Date().toLocaleString()}]`))
	}
	try {
		let statusHTML = fs.readFileSync(statusPath).toString()
		if (statusPath !== historyPath) {
			statusHTML = statusHTML + fs.readFileSync(historyPath).toString()
		}
		const statusObj = {
			instrumentId: instrumentId,
			data: tableToJSON.convert(statusHTML)
		}

		// fs.writeFileSync('status.json', JSON.stringify(statusObj))

		axios
			.patch('http://' + serverAddress + '/api/tracker/status', statusObj)
			.then(res => {
				if (verbose) {
					if (res.status === 201) {
						console.log(
							chalk.greenBright('Status on server was updated'),
							chalk.yellow(` [${new Date().toLocaleString()}]`)
						)
					}
				}
			})
			.catch(err => {
				console.log(chalk.red('[Server Error]', err))
			})
	} catch (err) {
		console.log(err)
	}
}

const tracker = verbose => {
	axios
		.get('http://' + serverAddress + '/api/tracker/ping/' + instrumentId)
		.then(res => {
			if (res.status === 200) {
				console.log(chalk.greenBright(`Instrument ${res.data.name} is connected to the server`))
				statusFileHandler(verbose)
			}
		})
		.catch(err => {
			console.log(chalk.red('[Server Error]', err, 'Check whether instrument ID is valid'))
		})

	if (fs.existsSync(statusPath)) {
		fs.watchFile(statusPath, () => {
			statusFileHandler(verbose)
		})
		console.log(chalk.greenBright(`Tracker watching ${statusPath}`))
		console.log(chalk.cyan.italic('Press Ctrl+C any time to quit'))
	} else {
		console.log(chalk.red.inverse('   Status file path is invalid   '))
	}
}

module.exports = tracker
