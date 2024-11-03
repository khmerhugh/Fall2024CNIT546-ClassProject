///
let express = require('express')
let app = express()
let bodyParser = require('body-parser');
app.use(bodyParser.json())
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')
const fs = require('node:fs');

const appId = 13;
const portTCP = 8889;

const portSerial = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: 'none'
  });
//
const parser = portSerial.pipe(new ReadlineParser());

app.get('/', function (req, res) {
    res.end("Chirpstack-SWARM Middleware running!");
})

app.get('/msgcount', function (req, res) {
    sendCMD('$MT C=U*12\n');

    //portSerial.on('open', () => {
      //portSerial.write('$MT C=U*12\n');
      //portSerial.drain(function(){
        //let foo = portSerial.read(99);
        //res.end(foo)}
      //);
      //let foo = portSerial.read(192);
      //console.log(foo);
    //});

    //const parser = portSerial.pipe(new ReadlineParser());
    
   // let msg = data;
    //parser.on('data', function (data) {
    //  console.log(data)
    //  msg = data;
    //portSerial.close();
    //res.end(data);
    //});
    //res.end("foo");
})

// Sample stripped data
// {"time":"2024-11-02T12:19:24.377491567+00:00","deviceName":"WHIN Weather Station #13","description":"MIC of join-request is invalid, make sure keys are correct"}
app.post('/', function(req, res) { 
    let d = { "time": req.body.time, "deviceName": req.body.deviceName, "description": req.body.description };
    d = JSON.stringify(d);
    fs.appendFile("logs/cnit546_post.log", d+"\n", ()=>{});
    let modemCommand = makeMessage(d);
    portSerial.write(modemCommand);
  res.sendStatus(200);
})

//app.listen(port, 'localhost', () => {
app.listen(portTCP, () => {
  console.log('Listening on port  ' + portTCP + '!');
})

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

function writeToSerial(command) {
  return new Promise((resolve, reject) => {
    portSerial.write(command, (err) => {
      if (err) {
        reject(err);
      } else {
        parser.once('data', (data) => {
          resolve(data);
        });
      }
    });
  });
}

async function sendCMD(cmd) {
  try {
    const response = await writeToSerial(cmd);
    console.log('Response:', response);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    portSerial.close();
  }
}