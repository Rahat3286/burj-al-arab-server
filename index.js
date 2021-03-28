const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

// console.log(process.env.DB_PASS)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.79vii.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000

const app = express()

app.use(cors());
app.use(bodyParser.json());

// var admin = require("firebase-admin");

var serviceAccount = require("./configs/burj-al-arab-debe3-firebase-adminsdk-e0nlv-fce2f57462.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});

// const password = "ArabianHorse79";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
                // console.log(result);
            })
        console.log(newBooking);
    })
    // console.log('db connected successfully')
    // client.close();

    app.get('/bookings', (req, res) => {
        // console.log(req.headers.authorization);
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            // console.log({ idToken });
            admin.auth().verifyIdToken(idToken)
                .then(function (decodeToken) {
                    const tokenEmail = decodeToken.email;
                    const queryEmail = req.query.email;
                    // console.log(tokenEmail, queryEmail);
                    if (tokenEmail == queryEmail) {
                        bookings.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else {
                        res.status(401).send('un authorized access')
                    }
                    // console.log({ uid });
                }).catch(function (error) {
                    res.status(401).send('un authorized access')
                });
        }
        else {
            res.status(401).send('un authorized access')
        }
    });
});

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

app.listen(port);