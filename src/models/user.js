const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: 3,
      index:true, // this will be indexed so query will be fast
      maxlength: 30,
      required: true, // if it firstname not there, then mangoose not allow insertion of document in collection
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      // if unique:true, // if emailId already exist in collection then it will not allow to insert document with same emailId
      unique: true, // mongodb automatically creates index if there is unique
      trim: true, // if user enter emailId with space in starting or ending then it will remove the space and store in collection
      lowercase: true, // if user enter emailId in capital letter then it will convert to small letter and store in collection

      // this function will run when we try to save the document in collection, it will check if emailId is valid or not
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email Address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password :" + value);
        }
      },
      // isStrongPassword is a function of validator library which checks if the password is strong or not, it checks for minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special charactersgtg.g
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: "{VALUE} is incorrect gender type",
      },
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Invalid gender");
        }
      },
      // this function only run when creating new document
      // runvalidators:true, // this function run when creating new document and updating document
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL");
        }
      },
    },

    about: {
      type: String,
      default: "I am a software developer",
    },
    skills: {
      type: [String], // array of skills, so we can store multiple skills in the array
    },
  },
  { timestamps: true }, // this will create createdAt and updatedAt fields in the collectionm it will automatically update the updatedAt field when we update the document
);

// User.find({firstName: "Sirjanpreet", lastName: "Kaur"})// it will return or finbd with the same name and it can be very much , so it will take time to query so instead

userSchema.index({firstName: 1, lastName: 1}); // compound interest, it will be very fast
// More indexes = faster reads, but slower writes and more memory/storage usage.
userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$790", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this; // this is refrencing to that user
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  ); // it will compare the password entered by user with the password stored in database, if it is valid then it will return true, if not then it will return false
  return isPasswordValid;
};

// const UserModel= mongoose.model("User",userSchema);

// module.exports = userModel;
module.exports = mongoose.model("User", userSchema);
