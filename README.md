# weather-events

This project is intended to serve as a repository of weather event data suitable for use in Weather Simulations such as those supported by the [Weather](https://github.com/concord-consortium/fb-weather-demo) project.

## events

The `events` folder contains the set of JSON files representing individual weather events. Scripts in the `scripts` folder can be used to create the JSON files by, for instance, converting them from appropriately formatted Google Sheets documents. The contents of the events folder should eventually be published to Github pages.

#### JSON format

The resulting JSON file looks like the following:
```
[
  {
    "id":"KASW",
    "index":0,
    "lat":41.27,
    "long":-85.83,
    "cols":[
      "inches_ALTIM",
      "dew_point_temperature",
      "weather",
      "air_temperature",
      "wind_from_direction",
      "precipitation_amount_hourly",
      "precipitation_amount_24",
      "cloud_area_fraction",
      "wind_speed",
      "time"
    ],
    "rows":[
      [29.72, 4, "b''", 5, 340, "nan", "nan", 1, 2.57222, "3/31/17 17:55"],
      ...
      [29.63, 1, "b'-DZ'", 4, 320, "nan", "nan", 1, 8.745548, "4/6/17 17:35"]
    ]
  },
  {
    "id":"KBUU",
    "index":1,
    "lat":42.689,
    "long":-88.3,
    "cols":[
      "inches_ALTIM",
      "dew_point_temperature",
      "weather",
      "air_temperature",
      "wind_from_direction",
      "precipitation_amount_hourly",
      "precipitation_amount_24",
      "cloud_area_fraction",
      "wind_speed",
      "time"
    ],
    "rows":[
      [29.88, 3.5, "b''", 4.8, 10, "nan", "nan", 1, 5.658884, "3/31/17 17:55"],
      ...
      [29.87, 3, "b''", 10.1, 340, "nan", "nan", 0.375, 9.774436, "4/6/17 17:35"]
    ]
  },
  ...
]
```

## scripts

### quickstart.js

A copy of the script from [Node.js Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs) useful for configuring/testing authorization. It requires the following authentication steps, as described in the aforementioned [Node.js Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs) document:

* download the `client_secret.json` from https://console.developers.google.com/apis/credentials for the appropriate project (authentication required) to the root of the `weather-events` repository folder.
* run the quickstart script: `node scripts/quickstart.js`
* visit the authorization page as instructed by the script output
* copy the code returned by the authorization page into the script when requested

Upon completion of these steps, an authorization token will be written to `.credentials/sheets.googleapis.com-nodejs-quickstart.json`. To reauthorize after changing anything that affects authorization, delete this file and repeat the steps above.

Once the authorization token has been written, this (or any other similar) script can be run without manual authorization steps.

### sheet-to-json.js

Converts a set of Weather Event data in the form of a Google Sheets document with one weather station per sheet into a JSON formatted weather event suitable for use in Weather Simulations. Patterned after the Google Sheets API [Node.js Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs). It requires the same authentication steps described above for `quickstart.js`.

Once the authorization token has been written, the script can be run without manual authorization steps. The `sheet-to-json.js` script converts a Google Sheets document with a command like the following:
```
node scripts/sheet-to-json.js <spreadsheetId> events/<destination-name>.json
```
or
```
node scripts/sheet-to-json.js -s <spreadsheetId> events/<destination-name>.json
```


## Importing simplified weather events ##
2017-11-13 Recently we started recieving data in a simplified JSON format in a row, column indexed array.
(see `./test/simple.json` for an example of the data format.

To translate this format into our older format, run `./scripts/import.js` from the command line.
If you run it with supplying any arguments it will prompt for required params. To get a list of
parameters and help try `./scripts/import.js --help`.

