const express=require('express');
const app=express();
const jwt=require('jsonwebtoken');
const multer=require('multer');
const cors=require('cors');
const mongoose=require('mongoose');
const port=3001;
const path=require('path');
const bodyparser=require("body-parser");
const { log } = require('console');




main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect('mongodb://localhost:27017/e-commerce');
}
app.use(cors());
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));


const storage = multer.diskStorage({
    destination: "./upload/images",
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
  });
  
  const upload = multer({ storage: storage });
  
  app.use('/images', express.static(path.join(__dirname, 'upload/images')));
  //create upload endpoint for images
app.post('/upload',upload.single('product'),(req,res)=>
{
    res.json({
        success:1,
        image_url:`http://localhost:${3001}/images/${req.file.filename}`
    })
})

//schema for product
const productSchema = mongoose.Schema({
  id: {
      type: Number,
      required: true
  },
  name: {
      type: String,
      required: true
  },
  image: {
      type: String,
      required: true
  },
  category: {
      type: String,
      required: true
  },
  new_price: {
      type: Number,
      required: true
  },
  old_price: {
      type: Number,
      required: true
  },
  date: {
      type: Date,
      default: Date.now,
  },
  available: {
      type: Boolean,
      default: true
  }
});

const Product = mongoose.model('Product', productSchema);

// Endpoint to add a new product
app.post("/addproduct", async (req, res) => {
  let products=await Product.find({});
  let id;
  if(products.length>0)
  {
    let last_product_array=products.slice(-1);
    let last_product=last_product_array[0];
    id=last_product.id+1;
  }
  else{
    id=1;
  }
  const newProduct = new Product({
      id:id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      available: req.body.available
  });

  console.log(newProduct);
  await newProduct.save();
  console.log("Product saved");
  res.json({
      success: 1,
      name: req.body.name
  });
});
//creating API for deleting products
app.post('/removeproduct',async (req,res)=>{
  await Product.findOneAndDelete({id:req.body.id});
  console.log("Removed");
  res.json({
    sucess:true,
    name:req.body.name
  })
})

app.get('/allproducts',async (req,res)=>{
 let products= await Product.find({});
  console.log("all products fecthed");
  res.send(products);
})

 

const Users = mongoose.model('Users', {
  name: {
    type: String
},
email: {
    type: String,
    required: true,
    unique: true
},
password: {
    type: String,
    required: true
},
cartData: {
    type: Object
},
date: {
    type: Date,
    default: Date.now
}
});
 
app.post('/signup', async (req, res) => {
 
      let check = await Users.findOne({ email:req.body.email });
      if (check) {
          return res.status(400).json({ success: false, errors: "existing user found with the same email id" });
      }

      let cart = {};
      for (let i = 0; i < 300; i++) {
          cart[i] = 0;
      }
      const user = new Users({
          name: req.body.username,
          email: req.body.email,
          password: req.body.password,
          cartData: cart,
      });
      await user.save();

      const data = {
          user: {
              id: user.id
          }
      };
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success: true, token });
  
});

app.post('/login', async (req, res) => {
 
      let user = await Users.findOne({email: req.body.email});
      if (user) {
        const passcompare = req.body.password === user.password;
        if (passcompare) {
          const data = {
              user: {
                  id: user.id
              }
          }
          const token = jwt.sign(data,'secret_ecom');
          res.json({ success: true, token });
        }

          else {
            res.json({ success: false, errors: "wrong password" });
        }
      }
      
     

    
       else{
        res.json({sucess:false,errors:"wrong emailid"})
       }
           
       
 
});

app.get('/newcollections',async(req,res)=>
{
  let products=await Product.find({});
  let newcollection=products.slice(1).slice(-8);
  console.log("NewCollection Fecthed");
  res.send(newcollection);
})
app.get('/popularinwomen',async(req,res)=>
{
  let products=await Product.find({category:"women"});
  let popular_in_women=products.slice(0,4);
  console.log("womenFecthed");
  res.send(popular_in_women);
})
//create middleware to fectch user
const fecthuser=async(req,res,next)=>
{
  const token=req.header('auth-token')
  if(!token)
  {
     res.status(401).send({errors:"please authenticate using valid token"})
  }
  else 
  {
    try {
      const data=jwt.verify(token,"secret_ecom")
      req.user=data.user
      next()
    }
    catch(error)
    {
       res.status(401).send({errors:"please authenticate using valid token"})
    }
  }

}


app.post('/addtocart',fecthuser,async(req,res)=>
{
  console.log("added", req.body.itemId);
   const userData=await Users.findOne({_id:req.user.id});
   userData.cartData[req.body.itemId]+=1;
   await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData});
   res.send("Added")
})

app.post('/removefromcart',fecthuser,async(req,res)=>
{
   console.log("removed",req.body.itemId);
   const userData=await Users.findOne({_id:req.user.id});
   if(userData.cartData[req.body.itemId]>0)
   {
    userData.cartData[req.body.itemId]-=1;
   }
   await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData});
   res.send("Added")
})

app.post('/getcart',fecthuser,async(req,res)=>
{
  console.log("GetCart");
 let userData=await Users.findOne({_id:req.user.id});
   
   res.json(userData.cartData);
})


// Default route
app.get("/", (req, res) => {
  console.log("Server is running");
  res.send('Hello World!');
});

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

 
 