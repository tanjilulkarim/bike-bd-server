const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svxru.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);
////////
async function run() {
  try {
    await client.connect();
    console.log('database connected successfully');

    const database = client.db("BikeCollection");
    const ProductCollection = database.collection("Products");
    const orderCollection = database.collection("Orders");
    const reviewCollection = database.collection("Review");
    const usersCollection = database.collection("Users");

    //   get all product
    app.get("/products", async (req, res) => {
      const product = await ProductCollection.find({}).toArray();
      res.json(product);
    });

    // add product
    app.post("/products", async (req, res) => {
      const offer = req.body;
      const result = await ProductCollection.insertOne(offer);
      res.json(result);
    });
    //delete product from the database
    app.delete("/deleteProduct/:id", async (req, res) => {
      const result = await ProductCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });

    // get single product ////
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ProductCollection.findOne(query);
      res.send(result);
    });

    // order offer
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // get book offer by email
    app.get("/myOrders/:email", async (req, res) => {
      // const email = req.params.email;
      const result = await orderCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });
    //delete order from the database
    app.delete("/deleteOrders/:id", async (req, res) => {
      const result = await orderCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });

    //   get all order
    app.get("/allOrders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.json(result);
    });

    //  update products
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.updateOne(filter, {
        $set: {
          status: "Shipped",
        },
      });
      res.json(result);
    });

    // add review//
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    // get review
    app.get("/review", async (req, res) => {
      const review = await reviewCollection.find({}).toArray();
      res.json(review);
    });

    // saved new Register user info into dataBase
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    // search admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })

    // saved google login user into database
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running assignment-12 server");
});

app.listen(port, () => {
  console.log("running assignment-12 server", port);
});
