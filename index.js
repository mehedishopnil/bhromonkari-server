const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);


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

    // User ::
    // Get all users
    app.get('/users', async (req, res) => {
      console.log('Received request for /users');
      try {
        const result = await usersCollection.find().toArray();
        console.log('Users found:', result);
        res.send(result);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
      }
    });
    
    // Post a new user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // Tour Collections
    app.get('/tour-places', async (req, res) => {
      const result = await tourPlacesCollection.find().toArray();
      res.send(result);
    });

    // // Get a specific tour place by ID
    app.get('/tour-places/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const tourPlace = await tourPlacesCollection.findOne({ _id: new ObjectId(id) });
        if (!tourPlace) {
          return res.status(404).send('Tour place not found');
        }
        res.send(tourPlace);
      } catch (error) {
        console.error('Error fetching tour place:', error);
        res.status(500).send('Error fetching tour place');
      }
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

