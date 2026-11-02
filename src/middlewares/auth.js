const jwt = require("jsonwebtoken"); // library to create and verify the token
const User = require("../models/user"); // import the user model to get the user data from the database

const adminAuth = (req, res, next) => {
  console.log("Admin auth is getting checked");
  const token = "xyz";
  const isAdminValid = token === "xyz";
  if (!isAdminValid) {
    res.status(401).send("You are not authorized to access this resource");
  } else {
    next();
  }
};

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please login to access this resource");
    }

    const decodedObj = await jwt.verify(token, "DEV@Tinder$790");

    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user=user;
    next(); // if user is found then we can proceed to the next middleware or route handler
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};
module.exports = { adminAuth, userAuth };
// app.get("/profile", userAuth, async (req, res) => {
//   /// in this req, user is already present because userAuth set this user
//   // if you do not pass middleware, then this code will not even be called
//   try {
//     const user=req.user;
//     const cookies = req.cookies; // this will return you the cookie object which is attached to the request object, so we can get the cookie from the request object and then we can use that cookie to get the user data from the database

//     // validate the token
//     const { token } = cookies; // this will return you the token which is attached to the cookie, so we can use that token to get the user data from the database
//     if (!token) {
//       throw new Error("Invalid Token");
//     }
//     const decodedMessage = await jwt.verify(token, "DEV@tinder@790"); // it will return you the payload which is attached to the token, so we can use that payload to get the user data from the database
//     // ,,,decodedMessage { _id: '6a6fa232f609dba4c8769cf6', iat: 1786533477 } this is the payload which is attached to the token, so we can use that payload to get the user data from the database

//     const { _id } = decodedMessage; // we can get the user id from the payload which is attached to the token, so we can use that user id to get the user data from the database
//     const user = await User.findById(_id);
//     if(!user) {
//       throw new Error("User not found");
//     }
//     res.send(user);
//     // to read cookie, we need to parse the cookie from the request object, so we can use cookie-parser middleware to parse the cookie from the request object and then we can use that cookie to get the user data from the database
//   } catch (err) {
//     res
//       .status(400)
//       .send("Error fetching the user profile data : " + err.message);
//   }
// });