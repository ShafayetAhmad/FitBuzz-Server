const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const moment = require("moment");
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
    const subsCollection = fitBuzzDB.collection("subsCollection");
    const slotsCollection = fitBuzzDB.collection("slotsCollection");
    const premiumMemberCollection = fitBuzzDB.collection(
      "premiumMemberCollection"
    );
    const paymentCollection = fitBuzzDB.collection("paymentCollection");

    app.get("/getFeaturedClasses", async (req, res) => {
      const result = await classesCollection
        .find({})
        .sort({ enrolled: -1 })
        .limit(6)
        .toArray();

      res.send(result);
    });
    app.get("/getAllClasses", async (req, res) => {
      // const result = await classesCollection.find({}).toArray();
      const result = await slotsCollection.find({}).toArray();

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
      const data = await trainersCollection
        .find({ trainerStatus: "approved" })
        .toArray();
      // console.log(data);

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
      // console.log(userDetails);
      const searchEmail = await usersCollection
        .find({
          userEmail: userDetails.userEmail,
        })
        .toArray();
      // console.log(searchEmail);
      if (searchEmail.length) {
        // console.log(searchEmail);
        res.send({ InsertedId: 1 });
        return;
      }
      const result = await usersCollection.insertOne(userDetails);
      res.send(result);
    });

    app.post("/add-trainer", async (req, res) => {
      const trainerFolio = req.body.trainerFolio;
      const findMail = await trainersCollection
        .find({ email: trainerFolio.email })
        .toArray();
      console.log(findMail);
      if (findMail.length != 0) {
        if (findMail[0].trainerStatus == "pending") {
          res.send("Sorry, you can not apply more than once");
          return;
        }
      }
      trainerFolio.joinData = moment().toString();
      trainerFolio.totalPaid = 0;
      // console.log(trainerFolio);
      const result = await trainersCollection.insertOne(trainerFolio);
      // console.log(result);
      if (!result.insertedId) {
        res.status(401).send("not inserted");
        return;
      }
      res.status(200).send("Applied Succesfully");
    });
    app.get("/getAllTrainerClasses", async (req, res) => {
      const trainers = await trainersCollection.find({}).toArray();
      const availabilityMap = {};

      trainers.forEach((trainer) => {
        const id = trainer._id;
        const availableTime = trainer.available_time_in_day;

        if (availableTime && Array.isArray(trainer.available_days_in_week)) {
          trainer.available_days_in_week.forEach((day) => {
            if (!availabilityMap[id]) {
              availabilityMap[id] = [];
            }
            availabilityMap[id].push({ [day]: availableTime });
          });
        }
      });

      // console.log(availabilityMap);
      let allclasses = {};
      // const formattedData = trainers.map((trainer) => {
      //   const availability = trainer.availability || {};
      //   for (key in availability) {
      //     const slotKeys = Object.keys(availability[key]);

      //     const entries = slotKeys.map((slotkey) => {
      //       // console.log(slotkey);
      //       // console.log(availability[key][slotkey]);
      //       if (availability[key][slotkey]) {
      //         const thekey = trainer._id.toString();
      //         const theValue = { [slotkey]: availability[key][slotkey] };
      //         const entry = { [thekey]: theValue };
      //         // console.log(entry);
      //         if (allclasses.hasOwnProperty(entry)) {
      //           if (allclasses[entry].includes(key)) {
      //             console.log(" ");
      //           } else {
      //             allclasses[entry].push(key);
      //           }
      //         } else {
      //           allclasses[entry] = [key];
      //         }
      //         return entry;
      //       }
      //     });
      //     // return { entries, key };
      //     console.log(allclasses);
      //   }
      // });
    });
    app.post("/add-subscriber", async (req, res) => {
      const subscriber = req.body.subscriber;
      const check = await subsCollection
        .find({ email: subscriber.email })
        .toArray();
      if (check.length) {
        res.send("You Are Already Subscribed!");
        return;
      }
      const result = await subsCollection.insertOne(subscriber);
      // console.log(result);
      res.send("Thank You for Subscribing");
    });

    app.get("/get-subs-data", async (req, res) => {
      const subscribers = await subsCollection.find({}).toArray();
      // console.log(subscribers);
      res.send(subscribers);
    });
    app.get("/getTrainerRequests", async (req, res) => {
      const trainerRequests = await trainersCollection
        .find({
          trainerStatus: "pending",
        })
        .toArray();
      res.send(trainerRequests);
    });
    app.post("/accept-trainer", async (req, res) => {
      const trainerEmail = req.body.email;
      const result = await trainersCollection.updateOne(
        { email: trainerEmail },
        {
          $set: {
            trainerStatus: "approved",
          },
        }
      );
      await usersCollection.updateOne(
        { userEmail: trainerEmail },
        {
          $set: {
            userRole: "trainer",
          },
        }
      );
      const trainerDetails = await trainersCollection
        .find({ email: trainerEmail })
        .toArray();
      const thumbnails = [
        "https://i.ibb.co/0FZV21K/class-thumbnail-1.jpg",
        "https://i.ibb.co/Jp3Zb2h/class-thumbnail-2.jpg",
        "https://i.ibb.co/80VNCgk/class-thumbnail-3.jpg",
        "https://i.ibb.co/yW6JyvQ/class-thumbnail-4.jpg",
        "https://i.ibb.co/M69MjqC/class-thumbnail-5.jpg",
        "https://i.ibb.co/nrw55f1/class-thumbnail-6.jpg",
        "https://i.ibb.co/37BNFsH/class-thumbnail-7.jpg",
        "https://i.ibb.co/XSY3pFh/class-thumbnail-8.jpg",
        "https://i.ibb.co/yQLr5D6/class-thumbnail-9.jpg",
        "https://i.ibb.co/XpHLjb0/class-thumbnail-10.jpg",
      ];
      const firstWords = [
        "Power",
        "Endurance",
        "Iron",
        "Beast",
        "Sweat",
        "Intensity",
        "Core",
        "Muscle",
        "Champion",
        "Victory",
      ];

      const secondWords = [
        "Blaze",
        "Fury",
        "Rage",
        "Storm",
        "Force",
        "Impact",
        "Thrust",
        "Avalanche",
        "Hurricane",
        "Quake",
      ];
      let thumbCount = 0;

      trainerDetails[0]?.available_days_in_week?.map(async (day) => {
        trainerDetails[0]?.available_time_in_day?.map(async (time) => {
          const trainingNameGenerate = (firstWords, secondWords) => {
            const randomFirst =
              firstWords[Math.floor(Math.random() * firstWords.length)];
            const randomSecond =
              secondWords[Math.floor(Math.random() * secondWords.length)];
            return `${randomFirst} ${randomSecond}`;
          };
          const trainingName = trainingNameGenerate(firstWords, secondWords);
          const newSlot = {
            trainerEmail: trainerDetails[0].email,
            day: day,
            thumbnail: thumbnails[thumbCount],
            time: time,
            slotName: trainingName,
            trainerName: trainerDetails[0].full_name,
            bookedUserId: null,
          };
          thumbCount = thumbCount + 1;
          if (thumbCount == 10) {
            thumbCount = 0;
          }
          console.log(thumbCount, thumbnails[thumbCount]);
          const slotsAddResult = await slotsCollection.insertOne(newSlot);
          if (slotsAddResult.acknowledged != true) {
            res.send("failed to add slot");
          }
        });
      });
      res.send("Trainer Added Successfully");
    });

    app.get("/get-slots-for-trainer", async (req, res) => {
      try {
        const email = req.query.email;
        const allSlots = await slotsCollection
          .find({ trainerEmail: email })
          .toArray();

        const bookedUserEmails = allSlots
          .filter((slot) => slot.bookedUserEmail)
          .map((slot) => slot.bookedUserEmail);

        const bookedUsers = await usersCollection
          .find({ userEmail: { $in: bookedUserEmails } })
          .toArray();

        const result = { allSlots, bookedUsers };
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.post("/bookSlot", async (req, res) => {
      const bookedUserEmail = req.body.userEmail;
      const slotId = req.body.slotId;
      console.log(bookedUserEmail, slotId);
      const result = await slotsCollection.updateOne(
        { _id: new ObjectId(slotId) },
        {
          $set: {
            bookedUserEmail: bookedUserEmail,
          },
        }
      );
      console.log(result);
    });
    app.get("/get-user-activity", async (req, res) => {
      const email = req.query.email;
      const today = moment().format("dddd");
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      console.log(today);
      const allSlots = await slotsCollection
        .find({ bookedUserEmail: email })
        .toArray();
      console.log(allSlots);
      const filteredSlots = allSlots.filter((slot) => {
        return today === days[slot.day];
      });
      console.log(filteredSlots);

      res.send({ allSlots, filteredSlots });
    });

    app.post("/add-premium-member", async (req, res) => {
      const memberData = req.body.premiumMember;
      const result = await premiumMemberCollection.insertOne(memberData);
      res.send(result);
    });

    app.get("/get-premium-member-payment-data", async (req, res) => {
      const userEmail = req.query.email;
      const result = await premiumMemberCollection.findOne({
        memberEmail: userEmail,
      });
      res.send(result);
    });
    app.get("/getTrainerEmail", async (req, res) => {
      const id = req.query.id;
      // console.log(id);
      const result = await trainersCollection.findOne({
        _id: new ObjectId(id),
      });
      console.log(result.full_name);
      res.send(result.full_name);
    });
    app.post("/payment-from-booked-user", async (req, res) => {
      const paymentData = req.body.paymentData;
      console.log(paymentData);
      const result = await paymentCollection.insertOne(paymentData);
      console.log(paymentData);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello");
  const startDate = "Sun Jan 03 2023 11:45:31 GMT+0530";
  console.log(moment().toString());
  console.log(moment().diff(startDate, "month"));
});

app.get("/gethello2", (req, res) => {
  res.send("2 hello");
});

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
