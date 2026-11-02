// starting point of application

console.log("Starting a new project");

const express = require("express");

const connectDB = require("./config/database");
const app = express();
const cors=require("cors");

const User = require("./models/user");
const { validateSignupData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");
app.use(
  cors({
  origin:"http://localhost:5173", // whitelisting origin domain name
  credentials:true,
})
);

app.use(express.json());
//to attach a cookie, we can use res.cookie() method, it takes 3 parameters, first is the name of the cookie, second is the value of the cookie, third is the options object, in which we can set the options for the cookie like maxAge, httpOnly, secure, sameSite etc.
app.use(cookieParser()); // this middleware will parse the cookie from the request object and attach it to the request object, so that we can access the cookie from the request object in our route handlers
const authRouter= require("./routes/auth");
const profileRouter= require("./routes/profile");
const requestRouter= require("./routes/requests");
const userRouter= require("./routes/user");

app.use("/", authRouter); // whenever rwquest is comin to "/" to check the routes
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);

// const { adminAuth,userAuth } = require("./middlewares/auth");

// entry point of the application
app.patch("/patchUser/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = [
      "firstName",
      "photoUrl",
      "about",
      "gender",
      "age",
      "skills",
    ]; // i want that only these fields should be updated, so we will check if the fields are present in the request body or not

    // It checks if all the keys in the data object are present in the ALLOWED_UPDATES array. If any key is not present, it will return false and the update will not be allowed. If all keys are present, it will return true and the update will be allowed.
    const isUpdateAllowed = Object.keys(data).every((key) =>
      ALLOWED_UPDATES.includes(key),
    );
    if (!isUpdateAllowed) {
      throw new Error("Update failed, Invalid updates");
    }
    // check if skills array is more than 10, if yes then throw error
    if (data?.skills?.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true, // this function run when creating new document and updating document
    });
    // const user = await User.findByIdAndUpdate({_id : userId}, data, { returnDocument: "before" });
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("Update failed " + err.message);
  }
});
// app.use("/",(err,req,res,next) => {
//     if(err) {
//         //Log your error
//         console.log(err)
//         res.status(500).send("Something went wrong")
//     }
// })
// app.get("/getUserData",(req,res) => {
//     // try {
//     // Logic of DB call and get user data

//     throw new Error("Error");
//     res.send("User data fetched successfully");
//     // }
//     // catch(err) {
//     //     res.status(500).send("Some error occured while fetching user data");
//     // }

// })
// app.use("/",(err,req,res,next) => {
//     if(err) {
//         //Log your error
//         console.log(err)
//         res.status(500).send("Something went wrong")
//     }
// })

// app.use("/admin", adminAuth);
// app.use("/user", userAuth);

// app.get("/user/data" ,(req, res) => {
//   res.send("Users request fulfilled");
// });
// app.get("/user/data", userAuth, (req, res) => {
//   res.send("Users request fulfilled");
// });

// app.post("/user/login",userAuth,(req, res) => {
//     res.send("User logged In successfully");
// });
// app.get("/admin/getAllUsers", (req, res) => {
//   res.send("All Users request fulfilled");
// });
// app.get("/admin/deleteUsers", (req, res) => {
//   res.send("Delete User");
// });

// app.get("/user",(req,res,next)=>{
//     console.log("1ST Request received for /user");
//     // res.send("1st Hello from /user");
//     next();
// })

// app.get("/user",(req,res,next)=>{
//     console.log("2nd Request received for /user");
//     // res.send("2nd Hello from /user");
//     // next();
// })

// app.use(
//   "/user",
//   (req, res,next) => {
//     console.log("Printing Response 1");
//     next();
//   },
//   (req, res,next) => {
//     console.log("Printing Response 2");
//     // res.send("Response 2");
//     next();
//   },
//   [(req, res,next) => {
//     console.log("Printing Response 3");
//     res.send("Response 3");
//     next();
//   },
//   (req,res,next) => {
//     console.log("Printing Response 4");
//     // res.send("Response 4");
//     next();
//   }],
//   (req,res,next) => {
//     console.log("Printing Response 5");
//     // res.send("Printing Response 5");
//     next();
//   }
// );

// // /ac will work /ac /abc
// app.get("/ab?c", (req,res) => {
//     res.send({firstName:"/ab?c" , lastName:"Kaur"});
// });

// // bc is optional /ac /abc
// app.get("/a(bc)?d", (req,res) => {
//     res.send({firstName:"/a(bc)?d" , lastName:"Kaur"});
// });

// // /abc /abbbc  add many b's as you want
// app.get("/ab+c", (req,res) => {
//     res.send({firstName:"/ab+c" , lastName:"Kaur"});
// });

// // /abcd /abcbcd /abcbcbcd
// app.get("/a(bc)+d", (req,res) => {
//     res.send({firstName:"/a(bc)+d" , lastName:"Kaur"});
// });

// // anything between ab and cd will work /abcd /abxcd /abRANDOMcd
// app.get("/ab*cd",(req,res) => {
//     res.send({ firstName:"Sirju" , lastName: "Kaur"})
// })

// // so any string can contain a in it, so /a/ , /abc/ will work
// app.get(/a/,(req,res) => {
//     res.send({firstName:"/a/" , lastName:"Kaur"})
// })

// // if route start with * and ends with fly, then it will work /fly , /abcdfly
// app.get(/.*fly$/,(req,res) => {
//     res.send({firstName:"/.*fly$/" , lastName:"Kaur"})
// })

// // this is how we can read query paramters from the request object and send the response back to the client using the response object
// // we can get the query params from the request object, and we can send the response back to the client using the response object
// app.get("/user", (req,res) => {
//     console.log(",,,req", req.query);
//     console.log(",,,res", res.query);
//     res.send({firstName:"dynamic params" , lastName:"Kaur"})
// })

// // for dynamic routes, : means dynamic route, so we can get the value of the dynamic route from the request object, and we can send the response back to the client using the response object
// app.get("/user/:userId/:name/:password",(req,res) => {
//     console.log(",,,req", req.params);
//     console.log(",,,res", res.params);
//     res.send({firstName:"dynamic routes" , lastName:"Kaur"})
// })

// // req /user , /user/xyz, /user/1
// // app.use("/user", (req,res) => {
// //     res.send("HAHAHAHAHAH")
// // })

// // This will only handle GET call to /user
// app.get("/user",(req,res) =>{
//     res.send({firstName:"Sirjanpreet" , lastName:"Kaur"})
// })

// app.post("/user",(req,res) => {
//     console.log("Save data to the database");
//     // saving data to DB
//     res.send("Data successfully saved to the database!");
// })

// app.patch("/user",(req,res) => {
//      res.send({firstName:"Sirjan"})
//     console.log("Patch data to the database");
// })

// app.put("/user",(req,res) => {
//      res.send({firstName:"Sirjanp"})
//     console.log("Put data to the database");
// })

// app.delete("/user",(req,res) =>{
//     res.send("Deleted Successfully")
// })

// // this will match all the HTTP method API calls to /test
// app.use("/test",(req,res)=>{ // if it has this path, then server will response
//     res.send("Hello from test server") // request handler
// });

// app.use("/hello/2",(req,res)=>{
//     res.send("Hello Preet Sirjan 2!")
// });

// app.use("/hello",(req,res)=>{
//     res.send("Hello Preet Sirjan !")
// });

// app.use("/",(req,res)=>{
//     res.send("Hello namaste from the sirjanpreet !")
// });

// Feef API - GET /feed - get all the users from the database
// app.get("/user", async (req,res) =>{
//   const userEmail=req.body.emailId;
//   console.log(",,,userEmail",userEmail)
//   try {
//     const users= await User.find({emailId : userEmail});
//     if(users.length === 0) {
//       res.status(404).send('User not found');
//     } else {
//       res.send(users);
//     }
//   }
//   catch(err) {
//     res.status(400).send("Something went wrong");
//   }
// });
// app.get("/user", async (req,res) =>{
//   const userEmail=req.body.emailId;
//   console.log(",,,userEmail",userEmail)
//   try {
//     // const users= await User.findOne({emailId : userEmail});
//     const users= await User.find({emailId : userEmail});

//     if(users.length === 0) {
//       res.status(404).send('User not found');
//     } else {
//       res.send(users);
//     }
//   }
//   catch(err) {
//     res.status(400).send("Something went wrong");
//   }
// });
app.get("/user", userAuth, async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    const users = await User.findById({ emailId: userEmail });

    if (users.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});
app.delete("/deleteUser", async (req, res) => {
  const deleteUser = req.body.userId;
  try {
    // const deletedUser= User.findByIdAndDelete({_id:deleteUser})
    // or
    const deletedUser = await User.findByIdAndDelete(deleteUser);

    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(7777, () => {
      console.log("Server is running on port 7777"); // callback function when server is up and running
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
