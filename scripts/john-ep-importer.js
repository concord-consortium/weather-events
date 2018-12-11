const XLSX = require('xlsx')
const glob = require("glob")
const _ = require("lodash")
const fs = require('fs')
const moment = require('moment')

const TIME_FORMAT = "MM/DD/YYYY kk:mm"

const COLUMN_DEFS = [
  "air_temperature",
  "precipitation_amount_hourly",
  "moisture",
  "time"
]

const getTimeForFile = (filename) => {
  const timeMatcher = RegExp(/(\d+)(am|pm)/,'i')
  const matches=  timeMatcher.exec(filename)
  const hour = matches[0]
  const amPm = matches[2]
  const hours = parseInt(hour,10) + (amPm == 'pm' ? 12 : 0)
  const date = new Date(Date.UTC('2013', '4', '15', hours))
  return moment(date).format(TIME_FORMAT)
}

const outFileName = (filename) => {
  const epMatcher = RegExp(/(^.*(NE|AK)_EP(1|2))/)
  const name = _.last(filename.split("/"))
  return `events/${epMatcher.exec(name)[0]}.json`
}

// Read the xlsx files.
glob("./john-events/**/*_EP*.xlsx", null, function (er, files) {
  const outFiles = {}
  files.forEach( (file) => {
    const workbook = XLSX.readFile(file)
    const sheetNames = workbook.SheetNames
    const date = getTimeForFile(file)
    const outfile = outFileName(file)
    const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]])
    json.forEach( (datum) => datum.date = date)
    outFiles[outfile] = outFiles[outfile] || []
    outFiles[outfile] = outFiles[outfile].concat(json)
  })

  const stations = {}
  let stationIndex = 1
  const keyForDatum = (datum) => {
    const startLat = 40
    const startLon = -77
    const columnNumber = datum.lat - startLat
    const rowNumber = datum.lon - startLon
    const column = String.fromCharCode(97 + columnNumber);
    return `${column}-${rowNumber + 1}`
  }
  const createStation = (key, datum) => {
    stations[key] = {
      id: key,
      index: stationIndex,
      lat: datum.lat,
      long: datum.lon,
      cols: COLUMN_DEFS,
      rows: []
    }
    stationIndex++
    return stations[key]
  }
  const stationForDatum = (datum) => {
    const key = keyForDatum(datum)
    return stations[key] || createStation(key, datum)
  }

  const parsePrecip = (precipString) => {
    const pString = precipString.toLowerCase()
    switch (pString) {
      case "none":
        return 0
      case "light":
        return 1
      case "moderate":
        return 2
      case "heavy":
        return 3
      default:
        console.err(`Unsupported precipitation value ${pString}`)
        return 0;
    }
  }

  const addDatum = (datum) => {
    // "air_temperature", "moisture", "precipitation_amount_hourly", "time"
    stationForDatum(datum).rows.push([
      datum.Temperature,
      parsePrecip(datum.Precipitation || "none"),
      datum.Moisture || 0,
      datum.date
    ])
  }
  // Write the json files
  const outFileNames = _.mapValues(outFiles, (values) => {
    _.forEach(values, (v) => {
        addDatum(v)
      })
    return _.values(stations)
  })

  _.forEach(outFileNames, (value, fileName) => {
    console.info(`writing ${fileName}`)
    try {
      fs.writeFileSync(fileName, JSON.stringify(value, null, 2))
    }
    catch (e) {
        console.log(e)
        console.trace()
    }
  })
})


// TODO, new format is going to be like this:
// "id": "a-1",
// "index": 0,
// "lat": 42,
// "long": 74,
// "cols": [
//   "air_temperature",
//   "wind_from_direction",
//   "precipitation_amount_hourly",
//   "wind_speed",
//   "time"
// ]