const moment = require('moment');
const COLUMN_DEFS = [
  "air_temperature",
  "wind_from_direction",
  "precipitation_amount_hourly",
  "wind_speed",
  "time"
];
const TIME_FORMAT = "MM/DD/YYYY kk:mm";

const decodeValue = function (name,data) {
  const index = COLUMN_DEFS.indexOf(name);
  return data[index];
}

class Converter {
  constructor(data, startTimeS = "1/1/2018 10:00", timeStep = 5) {
    this.sourceData = data;
    this.data = this.sourceData.data
    this.timeIncrementMinutes = timeStep;
    this.timeOffset = moment(startTimeS, TIME_FORMAT);
    this.latIncrement = -1;
    this.latOffset = 42;
    this.longIncrement = 1;
    this.longOffset = 74;
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
    const colName = String.fromCharCode(97 + column);
    return `${colName}-${row+1}`
  }

  timeFor(index) {
    return new moment(this.timeOffset).add(index * this.timeIncrementMinutes, 'minute').format(TIME_FORMAT);
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
    result.long = column * this.longIncrement + this.longOffset;
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

  getJson() {
    const data = this.extractStations();
    return JSON.stringify(data,null,2);
  }
}


module.exports = {Converter: Converter, decodeValue: decodeValue};