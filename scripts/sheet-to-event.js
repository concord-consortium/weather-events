var commander = require('commander');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

commander
  .usage('[options] <spreadsheetId>')
  .option('-s, --source <spreadsheetId>', 'specify ID of Google Sheets document to convert')
  .parse(process.argv);

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
  authorize(JSON.parse(content), retrieveSheets);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1bnHnvC38acVi_LGD-0k85kFTIUpSliUyFvzgxHCisoE/edit
 */
function retrieveSheets(auth) {
  const sheets = google.sheets('v4');
  sheets.spreadsheets.get({
    auth: auth,
    spreadsheetId: '1bnHnvC38acVi_LGD-0k85kFTIUpSliUyFvzgxHCisoE'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    const sheetRanges = response.sheets.map(function(sheet, index) {
      return `'${sheet.properties.title}'`;
    });

    let stations = [];
    retrieveStations(auth, sheetRanges, stations);
  });
}

function retrieveStations(auth, sheetRanges, stations) {
  const sheets = google.sheets('v4');
  // let station = { id: stationID, index: stationIndex, data: [] };
  sheets.spreadsheets.values.batchGet({
    auth: auth,
    spreadsheetId: commander.args[0] || commander.source,
    ranges: sheetRanges
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    response.valueRanges.forEach(function(stationData, index) {
      let id = sheetRanges[index],
          result;
      if (result = /'(.*)'/.exec(id))
        id = result[1];
      let station = { id: id, index: index, lat: null, long: null,
                      cols: [], rows: [] };
      let colNames = [],
          row;

      stationData.values.forEach(function(rowValues, index) {
        if (index === 0) {
          colNames = rowValues;
        }
        else {
          row = [];
          rowValues.forEach(function(value, index) {
            const numValue = Number(value),
                  resultValue = isNaN(numValue) ? value : numValue;
            switch (colNames[index].toLowerCase()) {
              case 'lat': station.lat = resultValue; break;
              case 'long': station.long = resultValue; break;
              case 'timestr': break;  // skip because it's redundant with "time" column
              default: row.push(resultValue); break;
            }
          });
          station.cols = colNames.filter(name => ['lat','long','timestr'].indexOf(name) < 0);
          station.rows.push(row);
        }
      });
      stations.push(station);
    });
    console.log(JSON.stringify(stations));
    // console.log(JSON.stringify(stations, null, 2));
  });

}

