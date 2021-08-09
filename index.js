const express = require('express')
require('dotenv').config()
// ${process.env.KEY}

const admin = require('firebase-admin')

// import orderBouquet from "./intents/order-bouquet.js"

var serviceAccount= {
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
    // if intent is make-appointment, save appointment to firebase
    const body = req.body;
    const intent = body.queryResult.intent.displayName;
  
    /*
    Thank you for placing your order. We will send your order of #bouquet-order.order-quantity bouquet(s) to $delivery-address on #bouquet-order.date-time.original . Please note that cash payment of SGD70 per bouquet should be made upon delivery. What else would you like to do?
    */
    if (intent === "bouquet-order-collection") {
      const parameters = body.queryResult.parameters;
      const order_datetime = parameters["date-time"].original;    
      // const name = parameters["name"];
      // const venue = parameters["venue"];
  
      const refAppointment = db.ref("appointments")
      const newAppointmentRef = refAppointment.push()
      const store = parameters.store;
  
      const refOrder = db.ref("orders")
      refOrder.orderByChild('order').equalTo(order).on('value', function(snapshot) {
        const clinics = snapshot.val()
        
          let message = "Thank you for placing your order! Please pick up from our pop-up store at The Wired Monkey cafe @ 5 Dunlop St, #01-00, Singapore 209335 (view on Google maps here: https://g.page/TheWiredMonkey?share). We will notify you when your order is ready. Also, please make payment of SGD70 per bouquet upon pick-up on " + order_datetime + ". What else would you want to do?"
          // const keys = Object.keys(clinics)
        
          // let optionButtons = ['Book an Appointment', 'Purchase a Bouquet', 'End Chat']
        
          res.send({
              "fulfillmentMessages": [
                {
                  "text": {
                    "text": [
                      message
                    ]
                  }
                },
                {
                  "card": {
                    "title": "Our Pop-up Store",
                    "subtitle": "The Wired Monkey @ 5 Dunlop St, #01-00, Singapore 209335 (https://g.page/TheWiredMonkey?share)",
                    "imageUri": "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80"//,
                    // "buttons": optionButtons
                  },
                  "reply_markup": {
                    "inline_keyboard": [
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
                  },
                  "platform": "TELEGRAM"
                },
              ]
            })
        
        
       
      })
    }
      res.status(200).send()    
    } else
    if (intent === "make-appointment") {
      const parameters = body.queryResult.parameters;
      const appointment_datetime = parameters["appointment-datetime"].date_time;    
      const name = parameters["name"];
      const venue = parameters["venue"];
  
      const refAppointment = db.ref("appointments")
      const newAppointmentRef = refAppointment.push()

      /*
      Have fixed slots e.g. 9am, 10am, etc.
      Create a dictionary. Write it out
      JSON object:
      {
        appointment_datetime: appointment_datetime, //index can be a string
        name: name,
        phone_number: phone_number,
        venue: venue
      
      }
      
      Use time as index
        */
      // as a list
      newAppointmentRef.set({
        name: name,
        venue: venue,
        appointment_datetime: appointment_datetime
        // email: email
      })
      res.status(200).send()    
    } else
    if (intent === "bouquet-order") {
      const parameters = body.queryResult.parameters;

      const quantity = parameters["order-quantity"]
      const order_datetime = parameters["date-time"].date_time;    
      const custom_order = parameters["custom-order"];
      // const name = parameters["name"];
      // const venue = parameters["venue"];
      
  
      const refOrder = db.ref("orders")
      const newOrderRef = refOrder.push()

      newOrderRef.set({
        quantity: quantity,
        order_datetime: order_datetime,
        custom_order: custom_order
      })
      /*
      const town = parameters.town;
  
      const refClinics = db.ref("clinics")
      refClinics.orderByChild('town').equalTo(town).on('value', function(snapshot) {
        const clinics = snapshot.val()
        
        if(clinics !== undefined && clinics !== null) {
          let message = ''
          const keys = Object.keys(clinics)
        
          let clinicButtons = []
  
          for(let i = 0; i < keys.length; i++) {
            let address = clinics[keys[i]].address
            let name = clinics[keys[i]].name
            message = message + name + " at " + address + "\r\n" // Health Way at Parkway Parade 01-04
  
            clinicButtons.push({
              text: name,
              postback: "https://www.google.com/maps/search/?api=1&query=" + address
            })
          }
        } else{
          res.send({
              "fulfillmentMessages": [
                {
                  "text": {
                    "text": [
                      message
                    ]
                  }
                },
                {
                  "card": {
                    "title": "Clinics Available",
                    "subtitle": "",
                    "imageUri": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
                    "buttons": clinicButtons
                  },
                  "platform": "TELEGRAM"
                },
              ]
          })
        }
        
       
      })
      */
    }
  }
  
  app.post('/appointment', handleAppointment)
  app.post('/dialog', handleDialog)

/*
// JSON structure:
appointment: {
    first_name: "",
    last_name: "",
    phone: "",
    time: "",
    location: ""
}
*/