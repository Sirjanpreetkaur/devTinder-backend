//

const mongoose = require("mongoose");
const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // means this is a reference to the User model, so we can populate the user data when needed
      required: true,
    }, // sender
    toUserId: {
      type: mongoose.Schema.Types.ObjectId, // whom you are sending connection request
      required: true,
      ref: "User",
    }, // receiver
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      }, //where you want user to restrict some values
    },
  },
  {
    timestamps: true,
  },
);

// connectionRequest.find({fromUserId: 249024828432, toUserId: 408348093898 }), then these queries will be fast
connectionRequestSchema.index({fromUserId: 1, toUserId: 1 }); // these queries will become very fast , 1 means ascending order, -1 means descending order, so we can use either 1 or -1, it will not make any difference, but we can use 1 because it is more readable
// index is used to make the queries faster, so we can use index on fromUserId and toUserId, so that we can find the connection request between two users very fast, because there can be millions of connection requests in the database, so we need to make the queries faster
// when using schema or pre , always write this function not arrow fuction,
// it will be called everytime you have a connection request
connectionRequestSchema.pre("save", function () {
  const connectionRequest = this;

  // Check whether the user is trying to send
  // a connection request to themselves
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself!");
  }
});

const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports = ConnectionRequestModel;