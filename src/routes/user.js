const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// get all the pending connection requests for logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
      // }).populate("fromUserId", ["firstName", "lastName"]); // populate the fromUserId with firstName and lastName of the user
    }).populate("fromUserId", "firstName lastName photoUrl age gender skills"); // another way to populate the fromUserId with firstName and lastName of the user with a space in between, instead of an array
    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});
const USER_SAFE_DATA = "firstName lastName photoUrl age gender skills"; //
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      /// or query to get all the connections for logged in user, either fromUserId or toUserId is logged in user and status is accepted
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
        // finding out all connection req where my two user id and from user id are accepted and to user id is logged in user id or vice versa
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        // if logged in user is the sender, then return the receiver's data
        // mongoose object id is not a string, so we need to convert it to string to compare it with logged in user id
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({ data });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  // in feed, we will show all the users who are not connected to the logged in user and not sent a connection request to the logged in user and not received a connection request from the logged in user
  // user should see all the user cards except the users who are already connected to the logged in user and the users who have sent a connection request to the logged in user and the users who have received a connection request from the logged in user
  // 0. his own card
  // 1.his connections
  // 2. ignored people
  // 3. already sent the connection request to the user
  // Example: Rahul, Akshay, Elon, Mark, Donald, MS Dhoni, Virat
  // if rahul is new user, he should see all the users except himself, so he should see Akshay, Elon, Mark, Donald, MS Dhoni, Virat
  // if rahul sent connection request to akshay, then he should not see Akshay in his feed, so he should see Elon, Mark, Donald, MS Dhoni, Virat
  // R-> Akshay -> Rejected  R->Elon->Accepted  R->Mark->Ignored  R->Donald->Interested  R->MS Dhoni->Accepted  R->Virat->Rejected
  // You will only see people whose carts you have never seen on your feed.
  // You won't see your own cart or people who have already accepted or rejected you.
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit; // limit should not be more than 50, if it is more than 50, then set it to 50
    const skip = (page - 1) * limit;


    // find all connection requests (sent + received)
    const connectionRequests= await ConnectionRequest.find({
        // find all connection requests where logged in user is either the sender or receiver
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set(); // create a set to store the user ids of the users who have sent or received a connection request from the logged in user
    connectionRequests.forEach(req =>{
        hideUsersFromFeed.add(req.fromUserId.toString());
        hideUsersFromFeed.add(req.toUserId.toString());

    });
    console.log(",,,hide",hideUsersFromFeed);
    const users = await User.find({
       $and: [
        {_id: { $nin: Array.from(hideUsersFromFeed) }},
        {_id : { $ne: loggedInUser._id }},
    ], // find all users whose id is not in the hideUsersFromFeed set and not equal to the logged in user id  
    }).select(USER_SAFE_DATA).skip(skip).limit(limit); // select only the safe data fields from the user model
    res.send(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
