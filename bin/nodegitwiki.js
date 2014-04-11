#!/usr/bin/env node --harmony
var commander = require('commander'),
  melkor = require('../index');

var dataFolder = process.cwd();


commander
  .option('-p, --port <num>', 'Port number (Default: 4567)', 4567)
  .option('-t, --title <title>', 'Wiki title (Default: Wiki)', 'Wiki')
  .parse(process.argv);

var options = {
  baseURL: 'http://localhost:' + commander.port,
  port: commander.port,
  title: commander.title
};

melkor.init(dataFolder, options, function(err) {
  if (err) {
    console.error(err.stack);
    return;
  }

  console.log('Melkor started in: ' + dataFolder);
});
