// manage routes specific to authorization
const express = require('express');
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");


authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);
    const {
      firstName,
      lastName,
      emailId,
      age,
      password,
      gender,
      photoUrl,
      about,
      skills,
    } = req.body;

    //encrypt the password before saving it to the database
    const passwordHash = await bcrypt.hash(password, 10); // 10 is the number of rounds for hashing, it is a good practice to use 10 rounds for hashing, it will take more time to hash the password but it will be more secure, the more encyption will be, the more time it will take to hash the password, so we can use 10 rounds for hashing, it will take more time to hash the password but it will be more secure, the more encyption will be, the more time it will take to hash the password, so we can use 10 rounds for hashing, it will take more time to hash the password but it will be more secure, the more encyption will be, the more time it will take to hash the password, so we can use 10 rounds for hashing, it will take more time to hash the password but it will be more secure, the more encyption will be, the more time it will take to hash the password, so we can use 10 rounds for hashing, it will take more time to hash the password but it will be more secure, the more encyption will be, the more time it will take to hash the password, so we can use 10 rounds for hashing, it will take more time to hash the password but it will be more secure, the more encyption will be, the more time it will take to hash the password, so we can use 10 rounds for hashing, it will take more time to hash the password but it will be more secure, the more encyption will be, the more time it will take to hash the password, so we can use 10 rounds for hashing, it will take more time to hash the password but it will be more secure

    // validation of data
    // encrypt the password, then store data into database
    const userObj = req.body;
    // we will create new instance of model and add database of model
    // creating new instance of the user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash, // firstly created passwordHash , then storing it into database, so that we can encrypt the password before storing it into database
      age,
      gender,
      photoUrl,
      about,
      skills,
    }); // or // const user=new User(req.body)
    const savedUser = await user.save();
    const token = await user.getJWT(); // we can handle it using the schema method
      res.cookie("token", token,{
        expires: new Date(Date.now() + 8 * 3600000)
      });
    res.send({message: "User added successfully", data: savedUser});
  } catch (err) {
    res.status(400).send("Error saving the user : " + err.message);
  }

  // this data will be saved on database and this fn will return you a promise
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId }); // if emailId is valid, then it will return the user object, if not then it will return null

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.validatePassword(password); // it will compare the password entered by user with the password stored in database, if it is valid then it will return true, if not then it will return false
    if (isPasswordValid) {
      // here i will write the logic to generate the token and send it to the user, so that user can use that token to access the protected routes
      // Create a JWT Token
      // Add the token to cookies and send the response back to the user
      // i will hide the user id

      const token = await user.getJWT(); // we can handle it using the schema method
      // const token = await jwt.sign({ _id: user._id }, "DEV@tinder@790", {
      //   expiresIn: "7d",
      // }); // i am hiding the user data under secret
      //to attach a cookie, we can use res.cookie() method, it takes 3 parameters, first is the name of the cookie, second is the value of the cookie, third is the options object, in which we can set the options for the cookie like maxAge, httpOnly, secure, sameSite etc.
      res.cookie("token", token,{
        expires: new Date(Date.now() + 8 * 3600000)
      });
      res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("Error logging in the user : " + err.message);
  }
});

authRouter.post("/logout", async(req,res) =>{
  res.cookie("token",null,{
    expires: new Date(Date.now()),
  });
  res.send("User Logged Out Successfully");
})
module.exports = authRouter;
