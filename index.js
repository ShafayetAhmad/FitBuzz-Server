const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://fitbuzz-316d8.web.app"],
    credentials: true,
  })
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = `mongodb+srv://shafayetahmad1:1wiZf7sw9VXdSg4b@cluster0.dawr9mq.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb://localhost:27017`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const fitBuzzDB = client.db("fitBuzzDB");
    const classesCollection = fitBuzzDB.collection("classesCollection");
    const blogsCollection = fitBuzzDB.collection("blogsCollection");
    const trainersCollection = fitBuzzDB.collection("trainersCollection");
    const usersCollection = fitBuzzDB.collection("usersCollection");

    app.get("/getFeaturedClasses", async (req, res) => {
      const result = await classesCollection
        .find({})
        .sort({ enrolled: -1 })
        .limit(6)
        .toArray();

      res.send(result);
    });
    app.get("/getAllClasses", async (req, res) => {
      const result = await classesCollection.find({}).toArray();

      res.send(result);
    });
    app.get("/getAllBlogs", async (req, res) => {
      const result = await blogsCollection.find({}).toArray();

      res.send(result);
    });

    app.get("/getSingleBlog", async (req, res) => {
      const id = req.query.id;
      const result = await blogsCollection
        .find({ _id: new ObjectId(id) })
        .toArray();
      res.send(result);
    });

    app.get("/getHello", (req, res) => {
      res.send("you got hello");
    });

    app.get("/getTrainersData", async (req, res) => {
      const data = await trainersCollection.find({}).toArray();

      res.send(data);
    });

    app.get("/getTrainerDetails", async (req, res) => {
      const id = req.query.id;

      const result = await trainersCollection
        .find({ _id: new ObjectId(id) })
        .toArray();
      res.send(result);
    });
    app.get("/get-user", async (req, res) => {
      const email = req.query.email;
      if (email) {
        const userData = await usersCollection
          .find({ userEmail: email })
          .toArray();
        res.send(userData[0]);
      }
    });
    app.post("/add-user", async (req, res) => {
      const userDetails = req.body.userDetails;

      const searchEmail = await usersCollection
        .find({
          userEmail: userDetails.userEmail,
        })
        .toArray();
      console.log(searchEmail);
      if (searchEmail.length) {
        console.log(searchEmail);
        res.send({ InsertedId: 1 });
        console.log("vitore");
        return;
      }
      const result = await usersCollection.insertOne(userDetails);
      res.send(result);
    });

    app.post("/add-trainer", async (req, res) => {
      const trainerFolio = req.body.trainerFolio;
      // console.log(trainerFolio);
      const result = await trainersCollection.insertOne(trainerFolio);
      console.log(result);
      if (!result.insertedId) {
        res.status(401).send("not inserted");
      }
      res.status(200).send("inserted");
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/gethello2", (req, res) => {
  res.send("2 hello");
});

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
