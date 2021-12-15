Javascript code app that runs on NMR spectrometer PC in Node.js runtime environment and enables communication of NOMAD back-end with Bruker IconNMR software. It parses status and history HTML file(s) and outputs files in external setup folder to control automated run of the NMR spectrometer.

## Starting scripts

- **npm start** starts the app
- **npm run config** starts app configuration
- **npm run list** shows app configuration
- **npm run verbose** starts the app in verbose mode
- **npm run save** starts app in saving mode when every status.html file gets saved
- **npm run dev** starts the app in development mode. It communicates with API without reverse proxy.
- **npm run dev-test** App starts in verbose mode and sends requests to two servers. The test server URL is defined in dev-test.env file.
