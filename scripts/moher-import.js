const moment = require('moment');
const COLUMN_DEFS = [
  "air_temperature",
  "wind_from_direction",
  "precipitation_amount_hourly",
  "wind_speed",
  "time"
];
const TIME_FORMAT = "MM/DD/YY kk:mm";

const decodeValue = function (name,data) {
  const index = COLUMN_DEFS.indexOf(name);
  return data[index];
}

class Converter {
  constructor(jsonString) {
    this.sourceData = jsonString;
    this.data = this.sourceData.data
    this.timeIncrement = 60;
    this.timeOffset = moment("3/31/17 17:55",TIME_FORMAT);
    this.latIncrement = 1;
    this.latOffset = this.latIncrement / 2.0;
    this.longIncrement = 1;
    this.longOffset = this.longIncrement / 2.0;
  };

  get frames() {
    return this.data;
  }

  get numFrames() {
    return this.frames.length;
  }

  get numRows() {
    return this.data[0].length;
  }

  get numColumns() {
    return this.data[0][0].length;
  }

  getFrame(index) {
    return this.data[index];
  }

  getStationName(row, column) {
    const rowName = String.fromCharCode(97 + row);
    return `${rowName}-${column+1}`
  }

  timeFor(index) {
    return this.timeOffset.add(index * this.timeIncrement, 'minute').format(TIME_FORMAT);
  }

  dataRowFor(index, data) {
    const {t, p} = data;
    const air_temperature = t;
    const precipitation_amount_hourly = p === 'clear' ?  0 : 1
    const wind_from_direction = 0;
    const wind_speed = 0;
    const timeString = this.timeFor(index);

    return [
      air_temperature,
      wind_from_direction,
      precipitation_amount_hourly,
      wind_speed,
      timeString
    ]
  }

  rowsForCell(row, column) {
    const results = [];
    for(let frameNo = 0; frameNo < this.numFrames; frameNo++) {
      let data = this.frames[frameNo][row][column];
      results.push(this.dataRowFor(frameNo,data));
    }
    return results;
  }

  extractStation(row, column) {
    const stationId = this.getStationName(row, column);
    const result = {};

    result.id = this.getStationName(row, column);
    result.index = row * this.numColumns + column;
    result.lat = row * this.latIncrement + this.latOffset;
    result.long = row * this.longIncrement + this.longOffset;
    result.cols = COLUMN_DEFS;
    result.rows = this.rowsForCell(row, column);
    return result;
  }

  extractStations() {
    const results = [];
    for(let row = 0; row < this.numRows; row++) {
      for(let column = 0; column < this.numColumns; column ++) {
        results.push(this.extractStation(row, column));
      }
    }
    return results;
  }

  writeJsonFile(fileName) {
    const data = this.extractStations();
    console.log(JSON.stringify(data,null,2));
  }
}


module.exports = {Converter: Converter, decodeValue: decodeValue};