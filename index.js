const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

// Connect to the MongoDB cluster
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cjch2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // All Data collections
    const usersCollection = client.db("bhromonkariDB").collection("users");
    const tourPlacesCollection = client.db("bhromonkariDB").collection("tourPlaces");

    // Get all users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(error);
  }
}

// Start the run function
run().catch(console.dir);

// Serve main HTML file for all other routes
app.get('/', (req, res) => {
  res.send('Bhromonkari server is running');
});

app.listen(port, () => {
  console.log(`Bhromonkari server listening on port ${port}`);
});

// Properly close the MongoDB connection on application shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB client disconnected');
  process.exit(0);
});
