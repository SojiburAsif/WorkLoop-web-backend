const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');




app.use(cors());
app.use(express.json());



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
    res.send(' Freelance Hub Server: Empowering Your Projects with Top Talent Inspired by Tasky!');
});

app.listen(port, () => {
    console.log(`services server is running on port ${port}`);
});
