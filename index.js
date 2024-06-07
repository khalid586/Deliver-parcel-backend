const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const helmet = require('helmet');

const port = process.env.PORT || 5007;

const app = express();
const corsOptions = {
    origin:[
        'http://localhost:5173',
        'http://localhost:5174',
        'https://deliver-0.web.app',
    ],
    optionsSuccessStatus: 200,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true

}

app.use(cors(corsOptions));
app.use(express.json());

app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: { policy: "require-corp" }
  }));

require('dotenv').config();
const uri = process.env.MONGO_URL

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

async function run(){
    try{
        const usersCollection = client.db('usersCollection').collection('users');
        const ordersCollection = client.db('ordersCollection').collection('orders');
        
        app.get('/orders',async(req,res)=>{
            const {name,email} = req.query;
            console.log(name,email)
            const query = {
                placedBy:{
                    name,
                    email,
                }
            }
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/user',async(req,res)=>{
            const query = req.params;
            const result = await usersCollection.findOne(query);
            res.send(result);
        })
        app.get('/users',async(req,res)=>{
            const result = await usersCollection.find().toArray();
            res.send(result);
        })
        app.post('/place_order', async (req, res) => {
            try {
              const order = req.body;
              const result = await ordersCollection.insertOne(order);
              res.send(result);
            } catch (error) {
              console.error('Error placing order:', error);
              res.status(500).send('Error placing order');
            }
          });
          
        
        app.post('/users',async(req,res) =>{
            const {name,email} = req.body;
            console.log(name,email);
            const query = {
                name,
                email,
                role:'user',
            }
            if(name && email){
                const exist = await usersCollection.findOne(query)
                if(!exist){
                    const result = await usersCollection.insertOne(query);
                    res.send(result);
                }else{
                    res.send({acknowledge:true,result:"Already inserted"})
                }
            }else{
                res.send("Name or email missing")
            }
        })

    await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    }catch(error){
        console.log(error)
    }
}
run().catch(console.dir);



app.get('/', (req,res)=>{
    res.send('working fine')
})

app.listen(port,()=>{
    console.log(`listening on port : ${port}`)
})

