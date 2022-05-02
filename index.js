const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.1lhsr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect();
        const productsCollection = client.db('pi-electronics').collection('products');
        app.get('/', async (req, res) => {
            res.send('server running');
        })

        app.post('/products', async (req, res) => {
            const result = await productsCollection.insertOne(req.body)
            res.send(result)
        })

        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray()
            console.log(result)
            res.send(result)
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query)
            console.log(product)
            res.send(product)
        })
    }
    finally {
        // await client.close();
    }
    app.listen(port, () => {
        console.log('server running on the port ', port);
    })


}

run().catch(console.dir)

// userName= pi-electronics
// pass= XAFnfB1mplBtGJ1r