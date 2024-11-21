// middleware.js: Program acts as middleware between Chirpstack HTTP Integration 
// and SWARM Eval Kit connected by USB serial, in order to send weather station
// data from remote areas

let express = require('express')
let app = express()
let bodyParser = require('body-parser');
app.use(bodyParser.json())
const { SerialPort } = require('serialport');
const fs = require('node:fs');

// all messages to SWARM from this app get marked with application identifier 13 in order
// to differentiate from messages sent from other applications.
const appId = 13;

// this app listens for http connections on TCP port 88
const portTCP = 88;

// configure serial port per requirement to talk to SWARM eval kit
const portSerial = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: 'none'
  });

app.get('/', function (req, res) {
    res.end("Chirpstack-SWARM Middleware running!");
})


// Provide web endpoint for Chirpstack message to be posted to middleware.
// Chirpstack message contains payload from weatherstation device.
// Sample stripped data:
// {  "time":"2024-11-06T19:31:05.098454+00:00",
//    "devEui":"8c1f64ef8811000f",
//    "fPort":100,
//    "data":"Ai0C4AEBAAAAADdy7f////8AAPf///////////8="  }
app.post('/', function(req, res) { 
    // repackage relevent data from chirpstack
    let d = { "time": req.body.time, "devEui": req.body.deviceInfo.devEui, "data": req.body.data, "fPort":  req.body.fPort };
    d = JSON.stringify(d);
    // create modem command to send SWARM message with chirpstack data as payload
    let modemCommand = makeMessage(d);
    // send message to modem
    portSerial.write(modemCommand);
    // Append message payload to log file
    fs.appendFile("logs/cnit546_post.log", JSON.stringify(req.body)+"\n", ()=>{});
    res.sendStatus(200);
})

app.listen(portTCP, 'localhost', () => {
    console.log('Listening on port  ' + portTCP + '!');
})

// create SWARM modem message to send to SAT.
// See modem manual for details on constructing message. 
function makeMessage(cmd)
{
  cmd = 'TD AI=' + appId + ',"' + cmd + '"';
  // Compute the checksum by XORing all the character values in the string.
  var checksum = 0;
  for(var i = 0; i < cmd.length; i++) {
    checksum = checksum ^ cmd.charCodeAt(i);
  }

  // Convert it to hexadecimal (base-16, upper case, most significant nybble first).
  var hexsum = Number(checksum).toString(16).toUpperCase();
  if (hexsum.length < 2) {
    hexsum = ("00" + hexsum).slice(-2);
  }

  cmd = "$" + cmd + "*" + hexsum + "\n";
  return cmd;
}