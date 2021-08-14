const express = require('express')
require('dotenv').config()
// ${process.env.KEY}

const admin = require('firebase-admin')

// import orderBouquet from "./intents/order-bouquet.js"
// const orderBouquet = require('./intents/order-bouquet.js')

var serviceAccount = {
  "type": process.env.account_type,
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key.replace(/\\n/g, '\n'),
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": process.env.auth_uri,
  "token_uri": process.env.token_uri,
  "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.client_x509_cert_url
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fleur-shoppe-jvqg-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

const db = admin.database();
const ref = db.ref('mysecret')

// listening for changes until an error happens
ref.on('value', (snapshot) => {
  console.log(snapshot.val());
}, (errorObject) => {
  console.log('The read failed: ' + errorObject.name);
});

const app = express()
app.use(express.json());

const port = process.env.PORT || 4000 // This is important for Heroku to bind their port to application

function handleRoot(req, res) {
  res.send('Hello back!')
}

function handleHello(req, res) {
  res.send('Hello World!')
}


function start() {
  console.log(`Example app listening at http://localhost:${port}`)
}

app.listen(port, start)
// control/command + c to exit Node programme

function handleSave(req, res) {
  const value = req.params.value
  const refSave = db.ref("save")
  refSave.set(value)
  res.status(200).send()
}

function handleAppointment(req, res) {
  const appointment = req.body;
  console.log(appointment)
  const refAppointment = db.ref("appointments")
  res.status(200).send()
}

app.get('/', handleRoot)
app.get('/hello', handleHello)
app.get('/save/:value', handleSave)
app.post('/appoint', handleAppointment)

function handleDialog(req, res) {

  const body = req.body;
  const intent = body.queryResult.intent.displayName;


  if (intent === "operation-hours") {
    const parameters = body.queryResult.parameters;

    let message = "Our pop-up store is open on Mondays to Saturdays, 10am to 8pm, except on Public Holidays. Visit us at The Wired Monkey cafe @ 5 Dunlop St, #01-00, Singapore 209335 (view on Google maps here: https://g.page/TheWiredMonkey?share)! You can still place an order or book an appointment with us here. What would you like to do?"
    /*
    let optionButtons = [
      {
      "text": 'Find our Store',
      "link": 'https://g.page/TheWiredMonkey?share'
      }
    ] 
    */

    res.send({
      "fulfillmentMessages": [
        {
          "card": {
          "title": "Our Pop-up Store",
          "subtitle": "Visit our pop-up store at The Wired Monkey @ 5 Dunlop St, #01-00, Singapore 209335 (view on Google Maps here: https://g.page/TheWiredMonkey?share)",
          "imageUri": "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80"
          // "buttons": optionButtons
          
          }
        },
        {
          "text": {
            "text": [
              message
            ]
          }
        }
        
      ]
    })

  }
  res.status(200).send()
}

app.post('/appointment', handleAppointment)
app.post('/dialog', handleDialog)

/*
{
      "telegram": {
          "reply_markup": {
            "inline_keyboard": [
              [
                {
                  "text": "FAQ",
                  "callback_data": "FAQ"
                }
              ],
              [
                {
                  "text": "Book an Appointment",
                  "callback_data": "Book an Appointment"
                }
              ],
              [
                {
                  "text": "Purchase a Bouquet",
                  "callback_data": "Purchase a Bouquet"
                }
              ],
              [
                {
                  "text": "End Chat",
                  "callback_data": "End Chat"
                }
              ]
            ]
          // },
          // "platform": "TELEGRAM"
        }
      }
      ]
    
    }
    */