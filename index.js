const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://shafayetahmad1:1wiZf7sw9VXdSg4b@cluster0.dawr9mq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const fitBuzzDB = client.db("fitBuzzDB");
    const classesCollection = fitBuzzDB.collection("classesCollection");
    const blogsCollection = fitBuzzDB.collection("blogsCollection");

    app.get("/getFeaturedClasses", async (req, res) => {
      const result = await classesCollection
        .find({})
        .sort({ enrolled: -1 })
        .limit(6)
        .toArray();
      console.log(result);

      res.send(result);
    });
    app.get("/getAllClasses", async (req, res) => {
      const result = await classesCollection.find({}).toArray();
      console.log(result);

      res.send(result);
    });
    app.get("/getAllBlogs", async (req, res) => {
      const result = await blogsCollection.find({}).toArray();
      console.log(result);

      res.send(result);
    });
    // app.get("/getAllBlogs", async (req, res) => {
    //   const id = req.params.id;
    //   console.log(id);
    // const result = await blogsCollection.find({}).toArray();
    // console.log(result);

    // res.send(result);
    // });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
