const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cjch2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoClient options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Main function to run the server
async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Collections
    const usersCollection = client.db("bhromonkariDB").collection("users");
    const tourPlacesCollection = client.db("bhromonkariDB").collection("tourPlaces");
    const touristWalletCollection = client.db("bhromonkariDB").collection("touristWallet");
    const regularSpendingCollection = client.db("bhromonkariDB").collection("regularSpending");
    const tourPlanCollection = client.db("bhromonkariDB").collection("tourPlan");
    const bookingsCollection = client.db("bhromonkariDB").collection("bookings");


    // Routes
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send("Email query parameter is required");
      }
      try {
        const user = await usersCollection.findOne({ email: email });
        if (user) {
          res.send([user]); // User exists
        } else {
          res.send([]); // User does not exist
        }
      } catch (error) {
        console.error("Error fetching user by email:", error);
        res.status(500).send("Error fetching user by email");
      }
    });

    // Add the POST /users route here
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error creating user");
      }
    });

    app.patch("/users/:email", async (req, res) => {
      const { email } = req.params;
      const updateData = req.body;
      try {
        const result = await usersCollection.updateOne(
          { email: email },
          { $set: updateData }
        );
        if (result.matchedCount === 0) {
          return res.status(404).send("User not found");
        }
        res.send(result);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Error updating user");
      } 
    });

    app.get("/tour-places", async (req, res) => {
      try {
        const result = await tourPlacesCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching tour places:", error);
        res.status(500).send("Error fetching tour places");
      }
    });

    app.get("/tour-places/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const tourPlace = await tourPlacesCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!tourPlace) {
          return res.status(404).send("Tour place not found");
        }
        res.send(tourPlace);
      } catch (error) {
        console.error("Error fetching tour place:", error);
        res.status(500).send("Error fetching tour place");
      }
    });

    // Hotel Data
    app.get("/tour-places/:id/hotel", async (req, res) => {
      const { id } = req.params;
      try {
        const tourPlace = await tourPlacesCollection.findOne(
          { _id: new ObjectId(id) },
          { projection: { hotel: 1 } } // Project only the hotel field
        );
        if (!tourPlace) {
          return res.status(404).send("Tour place not found");
        }
        res.send(tourPlace.hotel || []);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        res.status(500).send("Error fetching hotels");
      }
    });

    // Tour Guide Data
    app.get("/tour-places/:id/tourGuide", async (req, res) => {
      const { id } = req.params;
      try {
        const tourPlace = await tourPlacesCollection.findOne(
          { _id: new ObjectId(id) },
          { projection: { tourGuide: 1 } } // Project only the tourGuide field
        );
        if (!tourPlace) {
          return res.status(404).send("Tour place not found");
        }
        res.send(tourPlace.tourGuide || []);
      } catch (error) {
        console.error("Error fetching tourGuide:", error);
        res.status(500).send("Error fetching tourGuide");
      }
    });


    // Tourist Wallet Data - Get by email
    app.get("/tourist-wallet", async (req, res) => {
      const { email } = req.query;
      try {
        if (!email) {
          return res.status(400).send("Email query parameter is required");
        }
        const result = await touristWalletCollection.findOne({ email });
        if (!result) {
          return res.status(404).send("No data found for the provided email");
        }
        res.send(result);
      } catch (error) {
        console.error("Error fetching tourist wallet:", error);
        res.status(500).send("Error fetching tourist wallet");
      }
    });


    // Input Tourist Wallet Data
    app.post("/tourist-wallet", async (req, res) => {
      try {
        const touristWallet = req.body;
        const result = await touristWalletCollection.insertOne(touristWallet);
        res.json(result);
      } catch (error) {
        console.error("Error creating tourist wallet:", error);
        res.status(500).send("Error creating tourist wallet");
      }
    });

    // Input Regular Spending Data
    app.post("/regular-spending", async (req, res) => {
      try {
        const spendingData = req.body;
        console.log("Received spending data:", spendingData); // Log received data

        // Assuming you need to include email in spendingData
        const result = await regularSpendingCollection.insertOne(spendingData);

        console.log("Database insert result:", result); // Log the result of the database insert
        res.json(result);
      } catch (error) {
        console.error("Error submitting spending data:", error);
        res.status(500).send("Error submitting spending data");
      }
    });


    // Regular Spending Data - Get by email
    app.get("/regular-spending", async (req, res) => {
      const { email } = req.query;
      try {
        if (!email) {
          return res.status(400).send("Email query parameter is required");
        }
        const result = await regularSpendingCollection.find({ email }).toArray(); // Use find and toArray to get all records
        res.send(result); // Send the array of spending records
      } catch (error) {
        console.error("Error fetching regular spending:", error);
        res.status(500).send("Error fetching regular spending");
      }
    });


    // Tour Plan input data
    app.post('/bookings', async (req, res) => {
      try {
        const bookingsData= req.body;
        console.log("Received tour plan data:", bookingsData);

        // Input validation can be done here (e.g., using a library like Joi or express-validator)

        const result = await bookingsCollection.insertOne(bookingsData);
        res.status(201).json(result); // 201 Created
      } catch (error) {
        console.error("Error submitting tour plan data:", error);
        res.status(500).send("Internal Server Error: Error submitting tour plan data");
      }
    });
    

    // Tour Plan get data
    app.get('/bookings', async (req, res) => {
      const { email } = req.query;
      try {
        if (!email) {
          return res.status(400).send("Bad Request: Email query parameter is required");
        }

        const result = await bookingsCollection.find({ email }).toArray();
        if (result.length === 0) {
          return res.status(404).send("No tour plans found for the provided email");
        }

        res.status(200).json(result); // 200 OK
      } catch (error) {
        console.error("Error fetching tour plan:", error);
        res.status(500).send("Internal Server Error: Error fetching tour plan");
      }
    });



    // Bookings input data
    app.post('/tour-plan', async (req, res) => {
      try {
        const bookingsData= req.body;
        console.log("Received tour plan data:", tourPlanData);

        // Input validation can be done here (e.g., using a library like Joi or express-validator)

        const result = await tourPlanCollection.insertOne(tourPlanData);
        res.status(201).json(result); // 201 Created
      } catch (error) {
        console.error("Error submitting tour plan data:", error);
        res.status(500).send("Internal Server Error: Error submitting tour plan data");
      }
    });



    // Tour Plan get data
    app.get('/tour-plan', async (req, res) => {
      const { email } = req.query;
      try {
        if (!email) {
          return res.status(400).send("Bad Request: Email query parameter is required");
        }

        const result = await tourPlanCollection.find({ email }).toArray();
        if (result.length === 0) {
          return res.status(404).send("No tour plans found for the provided email");
        }

        res.status(200).json(result); // 200 OK
      } catch (error) {
        console.error("Error fetching tour plan:", error);
        res.status(500).send("Internal Server Error: Error fetching tour plan");
      }
    });



    // Ping the database
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Start the server
    app.listen(port, () => {
      console.log(`Bhromonkari server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    await client.close();
  }
}

// Properly close the MongoDB connection on application shutdown
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB client disconnected");
  process.exit(0);
});

// Start the run function
run().catch(console.dir);

// Serve main HTML file for all other routes
app.get("/", (req, res) => {
  res.send("Bhromonkari server is running");
});
