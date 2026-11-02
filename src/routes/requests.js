const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const ConnectionRequest = require("../models/connectionRequest.js");

const requestRouter = express.Router();
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId", // from user is logged in user
  userAuth,
  async (req, res) => {
    try {
      // from user is logged in user
      const fromUserId = req.user._id; // coming from loggedIn user(userAuth)
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid Status Type : " + status,
        });
      }

      // check if the toUserId is valid user or not
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        // if the toUserId is not valid user, then return error
        return res.status(404).json({
          message: "User not found !",
        });
      }

      // if there is an existing ConnectionRequest
      // we need index for data so my api will be faster because onr can send 1000 of connection Requests
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [ // or means either of the two conditions should be true, if any one is true then it will return the data
          {
            // Check if the logged-in user has already sent a request to the other user
            fromUserId,
            toUserId,
          }, // if they already exist
          {
            // Check if the other user has already sent a request to the logged-in user
            // Here, we reverse/swap the fromUserId and toUserId
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });
      // If a connection request already exists in either direction,
      // do not allow another request between the same two users.
      if (existingConnectionRequest) {
        return res.status(400).json({
          message: "Connection Request Already Exists!!",
        });
      }

      const connectionRequest = new ConnectionRequest({
        // new instance
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }
  },
);

// requestRouter.post( // for reviewing the connection request, only the receiver can accept or reject the request
//   "/request/review/:status/:requestId", // from user id is logged in user
//   userAuth,
//   async (req, res) => {
//     try {
//       const loggedInUser = req.user;
//       // validate the status

//       // sirjan => simran
//       // loggedInId === toUserId
//       // status = interested
//       // request id should be valid
//       const { status, requestId } = req.params;

//       const allowedStatus = ["accepted", "rejected"];
//       if (!allowedStatus.includes(status)) {
//         return res.status(400).json({ message: "Status not allowed !" });
//       }
//       const connectionRequest = await ConnectionRequest.findOne({
//         _id: requestId,
//         toUserId: loggedInUser._id, // only the receiver can accept or reject the request
//         status: "interested", // only interested requests can be accepted or rejected
//       });
//       if (!connectionRequest) {
//         return res
//           .status(404)
//           .json({ message: "Connection request not found" });
//       }
//       connectionRequest.status = status;

//       const data = await connectionRequest.save();
//     } catch (err) {
//       res.status(400).send("ERROR : " + err.message);
//     }
//   },
// );

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      const { status, requestId } = req.params;

      // Only these statuses are allowed when reviewing
      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Status not allowed!",
        });
      }

      // Find the request where:
      // 1. request ID matches
      // 2. logged-in user is the receiver
      // 3. request is currently interested
      const connectionRequest =
        await ConnectionRequest.findOne({
          _id: requestId,
          toUserId: loggedInUser._id,
          status: "interested",
        });

      if (!connectionRequest) {
        return res.status(404).json({
          message: "Connection request not found",
        });
      }

      // Update request status
      connectionRequest.status = status;

      // Save updated request
      const data = await connectionRequest.save();

      // Send response back
      res.json({
        message: `Connection request ${status} successfully`,
        data,
      });

    } catch (err) {
      res.status(400).send(
        "ERROR: " + err.message
      );
    }
  }
);

module.exports = requestRouter;
