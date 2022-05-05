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

        //add a product
        app.post('/products', async (req, res) => {
            const result = await productsCollection.insertOne(req.body)
            res.send(result)
        })


        //find all product
        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })

        //update a product
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    price: updatedProduct.newPrice,
                    quantity: updatedProduct.newQuantity
                }
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        //find a product by id 
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query)
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
