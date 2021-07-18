const express = require('express')
const admin = require('firebase-admin')

// var serviceAccount = require("")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fleur-shoppe-jvqg-default-rtdb.asia-southeast1.firebasedatabase.app/"
})