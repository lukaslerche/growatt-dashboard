import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import Growatt from 'growatt'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()
const user = process.env.GROWATT_USER || ''
const password = process.env.GROWATT_PASSWORD || ''
const plantId = process.env.PLANT_ID || ''
const inverterId = process.env.INVERTER_ID || ''
const kwhPrice = parseFloat(process.env.KWH_PRICE || '0');
const maxPower = parseInt(process.env.MAX_POWER || '0');


// Init Growatt and do first login
const growatt = new Growatt({})
growatt.login(user,password).catch((e: any) => {console.log(e)})

// Options for the getAllPlantData function, to not get all the data
const options={"plantData": false, "weather": false, "totalData": false, "historyLast": false, "statusData": false}


// Init Hono
const app = new Hono()

app.get('/', async (c) => {
  const data = await getDeviceData();
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charset="UTF-8" />
        <link href="https://cdn.jsdelivr.net/npm/modern-normalize@3.0.0/modern-normalize.min.css" rel="stylesheet">
        <title>${data.pac} Watt</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gauge.js/1.3.8/gauge.min.js"></script>
      </head>
      <body>
        <div style="margin: 16px">
          <h1>Balkonkraftwerk</h1>
          <p>Gesamterzeugnis heute: ${data.eToday} kWh (${(data.eToday * kwhPrice)/100}€)</p>
          <p>Gesamterzeugnis akt. Monat: ${data.eMonth} kWh (${(data.eMonth * kwhPrice)/100}€)</p>
          <p>Gesamterzeugnis seit Anfang: ${data.eTotal} kWh (${(data.eTotal * kwhPrice)/100}€)</p>
          <p style="font-size: 2em">Aktueller Strom: ${data.pac} Watt</p>
          <canvas id="gauge"></canvas>
        <div>
        <script>
      
        var opts = {
          angle: 0.15, // The span of the gauge arc
          lineWidth: 0.44, // The line thickness
          radiusScale: 1, // Relative radius
          pointer: {
            length: 0.6, // Relative to gauge radius
            strokeWidth: 0.035, // The thickness
            color: '#000000' // Fill color
          },
          limitMax: false,     // If false, max value increases automatically if value > maxValue
          limitMin: false,     // If true, the min value of the gauge will be fixed
          colorStart: '#6FADCF',   // Colors
          colorStop: '#8FC0DA',    // just experiment with them
          strokeColor: '#E0E0E0',  // to see which ones work best for you
          staticZones: [
            {strokeStyle: "#F03E3E", min: 0, max: 110}, // Red from 100 to 130
            {strokeStyle: "#FFC107", min: 110, max: 190}, // Yellow
            {strokeStyle: "#FFDD00", min: 190, max: 270}, // Yellow
            {strokeStyle: "#30B32D", min: 270, max: ${maxPower}} // Green
          ],
          generateGradient: true,
          highDpiSupport: true,     // High resolution support
        };
        var target = document.getElementById('gauge'); // your canvas element
        var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
        gauge.maxValue = ${maxPower}; // set max gauge value
        gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
        gauge.animationSpeed = 32; // set animation speed (32 is default value)
        gauge.set(${data.pac}); // set actual value 
    </script>
      </body>
    </html>
  `);
})

app.get('/power', async (c) => {
  const data = await getDeviceData();
  return c.text(data.pac)
})

app.get('/raw', async (c) => {
  const data = await getDeviceData();
  return c.json(data)
})

async function getDeviceData(): Promise<any> {
  // Try getting the data, if it fails, login and try again
  let getAllPlantData;
  try {
    getAllPlantData = await growatt.getAllPlantData(options);
  } catch (e: any) {
    if (e.message.includes("errorNoLogin")) {
      await growatt.login(user,password).catch((e: any) => {console.log(e)});
      getAllPlantData = await growatt.getAllPlantData(options);
    } else {
      console.log(e);
    }
  }

  //console.log('getAllPlatData:',JSON.stringify(getAllPlantData,null,' '));

  return getAllPlantData[plantId].devices[inverterId].deviceData;
}


// Start the server
const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
