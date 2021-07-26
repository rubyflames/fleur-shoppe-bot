const express = require('express')

const admin = require('firebase-admin')

// var serviceAccount = require("")

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

const port = process.env.PORT || 3000 // This is important for Heroku to bind their port to application

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
  
    if (intent === "make-appointment") {
      const parameters = body.queryResult.parameters;
      const appointment_datetime = parameters["appointment-datetime"].date_time;    
      const name = parameters["name"];
      const venue = parameters["venue"];
  
      const refAppointment = db.ref("appointments")
      const newAppointmentRef = refAppointment.push()
      newAppointmentRef.set({
        name: name,
        venue: venue,
        appointment_datetime: appointment_datetime
      })
      res.status(200).send()    
    } else
    if (intent === "order-bouquet") {
      const parameters = body.queryResult.parameters;
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