// node deps
const util = require('util')
const wait = util.promisify(setTimeout)
const exec = util.promisify(require('child_process').exec)
const readFile = util.promisify(require('fs').readFile)
// npm deps
const dogapi = require("dogapi")

const {
  // DD Config
  DD_METRIC_NAME='temperature',
  DD_API_KEY='',
  DD_APP_KEY='',
  DD_ENDPOINT='api.datadoghq.com',
  // App Config
  GRANULARITY=20000,
  DEVICE=''
} = process.env

const temperatureLog = `/sys/bus/w1/devices/${DEVICE}/w1_slave`

// initialize dd api
dogapi.initialize({
  api_key: DD_API_KEY,
  app_key: DD_APP_KEY,
  api_host: DD_ENDPOINT
})

// Basic utilities
// Basic logger function with timestamp
function log({message, level='INFO'}) {
  console.log(`${(new Date()).toISOString()} - [${level}]: ${message}`)
}

// parse file for raw num string
function parseData(data) {
  return data.split('=').slice(-1)[0]
}

// convert to number with decimal
function formatTemp(string) {
  return (Number(string) / 1000) * 1.8 + 32
}

function sendMetric(temp) {
  dogapi.metric.send(DD_METRIC_NAME, temp)
  return temp
}

function recursivelyPollTemp() {
  return readFile(temperatureLog, "utf8")
  .then(parseData)
  .then(formatTemp)
  .then(sendMetric)
  .then(temp => log({message: `Sent ${temp}, waiting ${GRANULARITY}`}))
  .then(() => wait(GRANULARITY))
  .then(() => recursivelyPollTemp())
}

function main() {
  log({message: 'Loading device drivers'})
  
  return exec('modprobe w1-gpio')
  .then(() => exec('modprobe w1-therm'))
  .then(() => log({message: 'Begin polling temperature'}))
  .then(() => recursivelyPollTemp())
  .catch(console.log)
}

main()