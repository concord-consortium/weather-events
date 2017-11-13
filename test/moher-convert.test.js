const jsonData = require('./simple.json');
const {Converter, decodeValue} = require('../scripts/moher-import.js');


describe("The structure of imported data", () =>{
  const data = jsonData.data;
  test("its an object", ()=> {
    expect(typeof data).toBe('object');
  });
  test("it has a length", () => {
    expect(data.length).toBe(2);
  })

  test("It has frames, and rows, and columns", () => {
    let frame, row, column = 0;
    for(frame =0; frame < data.length; frame++) {
      for(row = 0; row < data[frame].length; row++)  {
        for(column = 0; column < data[frame][row].length; column ++) {
        }
      }
    }
    expect(frame).toBe(2);
    expect(row).toBe(2);
    expect(column).toBe(2);
  });
});

describe("The Converter methods", () => {
  let converter = new Converter(jsonData);

  test("#numFrames identifies 2 frames", () => {
    expect(converter.numFrames).toBe(2);
  });

  test("#numRows identifies 2 rows", () => {
    expect(converter.numRows).toBe(2);
  });

  test("#numColumns identifies 2 columns", () => {
    expect(converter.numRows).toBe(2);
  });

  test("#rowsForCell returns the frames for that cell.", () => {
    let row = 0;
    let column = 0;
    let result = converter.rowsForCell(row,column);
    expect(result).toHaveLength(2);
    expect(decodeValue('air_temperature',result[0])).toBe(10);
    expect(decodeValue('time',result[0])).toBe("03/31/17 17:55");
    expect(decodeValue('air_temperature',result[1])).toBe(110);
    expect(decodeValue('time',result[1])).toBe("03/31/17 18:55");
  });

  test("#extractStation gets all the frames for a station", () => {
    const result = converter.extractStation(0,0);
    expect(result.id).toBe("a-1");
    expect(result.cols).toHaveLength(5);
    expect(result.cols).toContain("air_temperature");
    expect(result.cols).toContain("time");
    expect(result.cols).toContain("precipitation_amount_hourly");
    expect(result.rows).toHaveLength(2);
    expect(converter.extractStation(0,1).id).toBe("a-2");
    expect(converter.extractStation(1,1).id).toBe("b-2");
    expect(converter.extractStation(1,0).id).toBe("b-1");
  });
  test("#extractStations extracts all the frames for all 4 stations", () => {
    const result = converter.extractStations();
    expect(result).toHaveLength(4);
  });
});