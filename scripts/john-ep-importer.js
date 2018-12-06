const XLSX = require('xlsx')
const glob = require("glob")
const _ = require("lodash")
const fs = require('fs')

const getTimeForFile = (filename) => {
  const timeMatcher = RegExp(/(\d+)(am|pm)/,'i')
  const matches=  timeMatcher.exec(filename)
  const hour = matches[0]
  const amPm = matches[2]
  const hours = parseInt(hour,10) + (amPm == 'pm' ? 12 : 0)
  return new Date(Date.UTC('2013', '4', '15', hours))
}

const outFileName = (filename) => {
  const epMatcher = RegExp(/(^.*(NE|AK)_EP(1|2))/)
  return `${epMatcher.exec(filename)[0]}-out.json`
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

  // Write the json files
  const outFileNames = _.mapValues(outFiles, (values) => {
    const result = _.sortBy(values, ['Temperature', 'lat', 'lon'])
    return _.sortBy(values, ['date', 'lat', 'lon'])
  });
  _.forEach(outFileNames, (value, fileName) => {
    console.log(`writing ${fileName}`)
    try {
      fs.writeFileSync(fileName, JSON.stringify(value, null, 2))
    }
    catch (e) {
        console.log(e)
        console.trace()
    }
  })
})
