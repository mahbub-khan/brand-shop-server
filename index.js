const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://difficult-comfort.surge.sh"],
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gjmhsgq.mongodb.net/?retryWrites=true&w=majority`;

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
    //await client.connect();

    const productsCollection = client
      .db("brandShopProductsDB")
      .collection("products");

    const cartCollection = client.db("brandShopProductsDB").collection("cart");

    //product related APIS
    app.get("/products/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = { brand: brand };

      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/productdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      //console.log(newProduct);
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.put("/productdetails/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = req.body;

      const myProduct = {
        $set: {
          image: updatedProduct.image,
          name: updatedProduct.name,
          brand: updatedProduct.brand,
          productType: updatedProduct.productType,
          price: updatedProduct.price,
          rating: updatedProduct.rating,
          description: updatedProduct.description,
        },
      };

      const result = await productsCollection.updateOne(
        filter,
        myProduct,
        options
      );

      res.send(result);
    });

    //cart related APIS

    app.get("/mycart", async (req, res) => {
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/mycart", async (req, res) => {
      const cartNewProduct = req.body;
      //console.log(cartNewProduct);
      const result = await cartCollection.insertOne(cartNewProduct);
      res.send(result);
    });

    app.delete("/mycart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Brand shop server is running");
});

app.listen(port, () => {
  console.log(`Brand shop server is running on port: ${port}`);
});
