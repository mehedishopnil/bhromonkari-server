const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connections::

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cjch2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // Get the database and collection on which to run the operation
     
    const usersCollection = client.db("bhromonkariDB").collection("users");



// Users related apis:
app.get('/users', async(req, res, next) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
})


app.post('/users', async(req, res) => {
    const user = req.body;
    const query = { email: user.email};
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      res.status(400).send("User already exists");
      return;
    }
    const result = await usersCollection.insertOne(user);
    res.send(result)
})








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// Define a route handler for the root route ("/")
app.get("/", (req, res) => {
  res.send("Hello from Bhromonkari Server!"); // Sending a simple response for demonstration
});

app.listen(port, () => {
  console.log(`Bhromonkari Server is running on ${port}`);
});
