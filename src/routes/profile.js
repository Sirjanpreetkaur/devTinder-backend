const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const { validateProfileEditData } = require("../utils/validation");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  /// in this req, user is already present because userAuth set this user
  // if you do not pass middleware, then this code will not even be called
  try {
    const user = req.user;
    res.send(user);
    // to read cookie, we need to parse the cookie from the request object, so we can use cookie-parser middleware to parse the cookie from the request object and then we can use that cookie to get the user data from the database
  } catch (err) {
    res
      .status(400)
      .send("Error fetching the user profile data : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("Invalid Edit Request");
      // return res.status(400).send("")
    }

    const loggedInUser = req.user; // which auth middleware has attached
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    // res.send(`${loggedInUser.firstName}, Profile Updated Successfully !`);
    res.json({
      message: `${loggedInUser.firstName}, Profile Updated Successfully !`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    // forgot password Api, existing, new passwodd, user shoudl be logged in, existing password correct or not, bcypt .compare, if existing pass valid then check new password is strong enough then you will update it, we need curren tpassword
    const { password, newPassword } = req.body;
    // Check if both passwords are provided
    if (!password || !newPassword) {
      throw new Error("Current password and new password are required");
    }
    const loggedInUser = req.user;
    const isPasswordValid =
      await loggedInUser.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    // Check whether the new password is strong
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Please enter a strong password");
    }

    // Hash the new password before saving it
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the password
    loggedInUser.password = passwordHash;

    // Save the updated password
    await loggedInUser.save();

    res.send("Password updated successfully");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/password/forget", userAuth, async (req, res) => {
  try {
    // forgot password Api, existing, new passwodd, user shoudl be logged in, existing password correct or not, bcypt .compare, if existing pass valid then check new password is strong enough then you will update it, we need curren tpassword
    const { email,password, newPassword } = req.body;
    // Check if both passwords are provided
    if (!password || !newPassword) {
      throw new Error("Current password and new password are required");
    }
    const loggedInUser = req.user;
    const isPasswordValid =
      await loggedInUser.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    // Check whether the new password is strong
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Please enter a strong password");
    }

    // Hash the new password before saving it
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the password
    loggedInUser.password = passwordHash;

    // Save the updated password
    await loggedInUser.save();

    res.send("Password updated successfully");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = profileRouter;
