#!/usr/bin/env node

const { Converter } = require("./moher-import.js");
const fs = require('fs');
const prompt = require('prompt-sync')();
const glob = require('glob-fs')({ gitignore: true });
const jsonFiles = glob.readdirSync('**/*.json');

const cliProgram = require('commander')
  .version('0.1.0')
  .option('-i, --input <fileName>', 'Input file eg: `day-1-src.json`')
  .option('-o, --output <fileName>', 'Output file eg: `day-1-data.json`')
  .option('-t, --time <1/1/2018>', 'start Time: eg: `1/1/2018 10:00`')
  .option('-s, --step <5>', 'interval between datapoints in minutes')
  .parse(process.argv);

const complete = (starting) => {
  return jsonFiles.filter( (i) => i.startsWith(starting) );
}

function getInputFile() {
  const firstFile = jsonFiles && jsonFiles[0];
  return prompt('Input File: ', firstFile, {autocomplete: complete} );
}

function getOutFile(inName) {
  const defaultOutName = `${inName.split(".")[0]}-out.json`;
  return prompt("Output File: ", defaultOutName);
}

function getTime() {
  return prompt("Start date/time (1/1/2018 10:00): ", "1/1/2018 10:00");
}

function getInterval() {
  return parseInt(prompt("Minutes/frame (5): ", "5"));
}

const input    = cliProgram.input    || getInputFile();
const output   = cliProgram.output   || getOutFile(input);
const time     = cliProgram.time     || getTime();
const interval = cliProgram.interval || getInterval();

const data = JSON.parse(fs.readFileSync(input));
const converter = new Converter(data, time, interval);
const newData = converter.getJson();

try {
  fs.writeFileSync(output, newData);
}
catch (e) {
    console.log(e);
    console.trace();
}
