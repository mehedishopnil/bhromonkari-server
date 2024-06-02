const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);
console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cjch2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0;`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("bhromonkariDB").collection("users");
    const tourPlacesCollection = client.db("bhromonkariDB").collection("tourPlaces");

    // Get all users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Get a single user by email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      res.send(user);
    });

    // Update user data
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email;
      const { name, photoURL } = req.body;
      const filter = { email };
      const updateDoc = {
        $set: {
          name,
          photoURL
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    //Tour Place
    app.get('/tourPlace', async (req, res) => {
      const result = await tourPlacesCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Bhromonkari Server!");
});

app.listen(port, () => {
  console.log(`Bhromonkari Server is running on ${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log("MongoClient disconnected on app termination");
  process.exit(0);
});
