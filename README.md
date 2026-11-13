Javascript app that runs on NMR spectrometer PC in Node.js runtime environment and enables communication of NOMAD back-end with Bruker IconNMR software. It parses status and history HTML file(s) and outputs files in external setup folder to control automated run of the NMR spectrometer. v3.1 and higher also uploads nmr data to NOMAD datastore.

## Starting scripts

- _npm start_ - starts the app
- _npm test_ - starts unit testing using vitest
- _npm run coverage_ - runs unit testing with coverage report
- _npm run config_ - starts app configuration
- _npm run list_ - shows app configuration
- _npm run verbose_ - starts the app in verbose mode
- _npm run save_ - starts app in saving mode when every status.html file gets saved
- _npm run dev_ - starts the app in development mode. It communicates with API without reverse proxy.

## Data folder layout

By default the client expects NMR data in the classic IconNMR/TopSpin layout
`<nmrDataPath>/<group>/nmr/<datasetName>/<expNo>`.

If IconNMR is configured with *"Eliminate 'data' and 'nmr' from the data set path"*
(TopSpin 3+), the data is stored as `<nmrDataPath>/<group>/<datasetName>/<expNo>`.
Set the subfolder to empty (or `none`) to match:

| config.json          | Docker env variable    | Default | Applies to                         |
| -------------------- | ---------------------- | ------- | ---------------------------------- |
| `nmrSubfolderAuto`   | `NMR_SUBFOLDER_AUTO`   | `nmr`   | IconNMR automation data upload     |
| `nmrSubfolderManual` | `NMR_SUBFOLDER_MANUAL` | `nmr`   | Manual data claims and upload      |

Use `npm run config` and type `none`, or edit `src/config/config.json` directly, e.g.
`"nmrSubfolderAuto": "none"`. Missing settings default to `nmr`, so existing
installations keep working without changes.
