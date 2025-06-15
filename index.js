const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');




app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const logger = (req, res, next) => {
    console.log('inside the loger midilwere');
    next()
}
const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    console.log('cookie in the middleware', token);
    next()

    if (!token) {
        return res.status(401).send({ message: 'unauthoraiz assess' })
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthoraiz assess' })

        }
        req.decoded = decoded
        console.log(decoded);
    })





}
// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project-server.fv9q8on.mongodb.net/?retryWrites=true&w=majority&appName=Project-server`;




// const uri = "mongodb+srv://<db_username>:<db_password>@project-server.fv9q8on.mongodb.net/?retryWrites=true&w=majority&appName=Project-server";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const workCollection = client.db('server_user').collection('userr')
        const BookingCollection = client.db('server_user').collection('Booking')


        // jwt Token related api

        app.post('/jwt', async (req, res) => {
            const userInfo = req.body;
            const token = jwt.sign(userInfo, process.env.JWT_ACCESS_SECRET, {
                expiresIn: '2h',
            })
            res.cookie('token', token, {
                httpOnly: true,
                secure: false
            })
            res.send({ success: true, token });
        });







        //   Work api
        app.get('/working', async (req, res) => {
            const result = await workCollection.find().toArray();
            res.send(result)
        })

        app.get('/working/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await workCollection.findOne(query);
            console.log(result);
            res.send(result);
        });


        app.post('/working', async (req, res) => {
            const newWork = req.body;
            console.log(newWork);
            const result = await workCollection.insertOne(newWork);
            res.send(result)
        })

        app.put('/working/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateWork = req.body;

            const updateDoc = {
                $set: updateWork
            };

            const result = await workCollection.updateOne(filter, updateDoc, options);

            res.send(result);
        });

        app.delete('/working/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await workCollection.deleteOne(query);
            res.send(result)
        })


        // Services related api
        app.get('/workings', logger, verifyToken, async (req, res) => {
            const email = req.query.email;
            console.log('insaide application api', req.cookies);

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'unauthoraiz assess' })
            }
            const query = {

                providerEmail: email

            };

            const result = await workCollection.find(query).toArray();
            res.send(result);
        });


        // Booking 


        app.post('/bookings', async (req, res) => {
            const UserProfile = req.body;
            // console.log(UserProfile);
            const result = await BookingCollection.insertOne(UserProfile);
            res.send(result)
        })



        // app.post('/bookings', async (req, res) => {
        //     const {
        //         serviceId,
        //         providerEmail,
        //         userEmail,
        //         takingDate
        //     } = req.body;

        //     const existingBooking = await BookingCollection.findOne({ serviceId, userEmail });

        //     if (existingBooking) {
        //         return res.status(400).json({ message: 'You already booked this service.' });
        //     }

        //     const providerBooked = await BookingCollection.findOne({ providerEmail, takingDate });

        //     if (providerBooked) {
        //         return res.status(409).json({ message: 'Provider is already booked on this date.' });
        //     }

        //     const result = await BookingCollection.insertOne({ ...req.body, serviceStatus: 'pending' });
        //     res.status(201).json(result);
        // });




        app.get('/bookings', async (req, res) => {

            const email = req.query.email;
            const query = {};
            if (email) {
                query.userEmail = email
            }
            const result = await BookingCollection.find(query).toArray();
            res.send(result)
        })
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateWork = req.body;

            const updateDoc = {
                $set: updateWork
            };

            const result = await BookingCollection.updateOne(filter, updateDoc, options);

            res.send(result);
        });





        await client.connect();

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send(' Services Hube Hub Server: Empowering Your Projects with Top Talent Inspired by Services HUBE!');
});

app.listen(port, () => {
    console.log(`services server is running on port ${port}`);
});
