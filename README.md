Javascript code app that runs on NMR spectrometer PC in Node.js runtime environment and enables communication of NOMAD back-end with Bruker IconNMR software. It parses status and history HTML file(s) and outputs files in external setup folder to control automated run of the NMR spectrometer.

## Starting scripts

- _npm start_ - starts the app
- _npm run config_ - starts app configuration
- _npm run list_ - shows app configuration
- _npm run verbose_ - starts the app in verbose mode
- _npm run save_ - starts app in saving mode when every status.html file gets saved
- _npm run dev_ - starts the app in development mode. It communicates with API without reverse proxy.
- _npm run dev-test_ - App starts in verbose mode and sends requests to two servers. The test server URL is defined in dev-test.env file.
