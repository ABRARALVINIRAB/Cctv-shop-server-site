



const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;


const { MongoClient } = require('mongodb');
const { query } = require('express');
const port = process.env.PORT || 5000;



//middle

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a6fks.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('cctv');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');



        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
        app.post('/products', async (req, res) => {
            const product = req.body;

            console.log("order", product);
            const result = await productsCollection.insertOne(product);
            res.json(result);
        })
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.json(result)
        })
        //reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;

            console.log("review", review);
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        })
        // add orders api
        app.post('/orders', async (req, res) => {
            const order = req.body;

            console.log("order", order);
            const result = await ordersCollection.insertOne(order);
            res.json(result)
        })

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('single data');
            const query = { _id: ObjectId(id) }
            const order = await ordersCollection.findOne(query)
            console.log('id', id);
            console.log('done');
            res.json(order);
        })

       

        // app.get("/orders", async (req, res) => {
        //     const email = req.query.email;
        //     console.log(email);
        //     const query = { email: email };
        //     const cursor = ordersCollection.find(query)
        //     const result = await cursor.toArray();
        //     res.send(result)
        // })
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        })



        app.get("/orders/:email", async (req, res) => {
            const email = req.params.email;
            console.log('req email', email);
            console.log('email', email);
            const query = { email: email };
            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
        })
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result);
        })


        app.put("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            console.log("updating req", updatedUser);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    phone: updatedUser.phone,
                    name: updatedUser.name,

                   
                    status: updatedUser.status,
                    

                },
            };
            const result = await ordersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            console.log("updating", id);
            res.json(result);
        });

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
        })
        //users
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log('user', user);
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })
        //make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user)
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })




    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running cctv')
})

app.listen(port, () => {
    console.log(`server runnig at http://localhost:${port}`)
})