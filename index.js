const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());



const verifyJWTtoken = (req, res, next) => {
    console.log(req.decoded)
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = header.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
        if (error) {

            return res.status(403).send({ message: 'Forbidden' })
        }
        req.decoded = decoded;

    })

    next();
}



const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.1lhsr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect();
        const productsCollection = client.db('pi-electronics').collection('products');
        
        app.get('/', async (req, res) => {
            res.send('server is running ');
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

                    quantity: updatedProduct.newQuantity
                }
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        //produce jwt token
        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ token });
        })


        //find my products for specific user
        app.get('/product', async (req, res) => {
            const verifiedEmail = req?.decoded?.email;
            const email = req.query.email;

            const query = { email: email }
            const cursor = productsCollection.find(query)
            const myProducts = await cursor.toArray();
            res.send(myProducts)


        })


        //find a product by id 
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query)
            res.send(product)
        })

        //delete a product by id 
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query)
            res.send(result)
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
