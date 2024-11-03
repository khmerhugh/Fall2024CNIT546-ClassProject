let express = require('express')
let app = express()
let bodyParser = require('body-parser');
app.use(bodyParser.json())
let swarm = require('./swarm');
const { SerialPort } = require('serialport');

const portTCP = 88;

const portSerial = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: 'none'
  });
  
app.get('/', function (req, res) {
    res.send("Chirpstack-SWARM Middleware running!");
    res.sendStatus(200);
})

// Sample stripped data
// {"time":"2024-11-02T12:19:24.377491567+00:00","deviceName":"WHIN Weather Station #13","description":"MIC of join-request is invalid, make sure keys are correct"}
app.post('/', function(req, res) {
  const data = req.body.data;
  (async function () {
    let d = { "time": req.body.data.time, "deviceName": req.body.data.deviceName, "description": req.body.data.description };
    d = JSON.stringify(d);
    let modemCommand = swarm.makeMessage(d);
    portSerial.on('open', () => {
        console.log('SerialPort opened for modem command: ' + modemCommand);
        //port.write('$MT C=U*12');
        //port.write("$FV*10");
        portSerial.write(modemCommand);
      });
  })()

  res.sendStatus(200);
})

//app.listen(port, 'localhost', () => {
app.listen(portTCP, () => {
  console.log('Listening on port ' + portTCP + '!');
})