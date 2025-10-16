import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    default: 0,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  admin:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const GroupModel = mongoose.model("Group", GroupSchema);

export default GroupModel;
