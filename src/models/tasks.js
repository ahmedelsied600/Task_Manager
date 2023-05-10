// step#1 - connect as a client to certain database in your database
const mongoose = require("mongoose");
const tasksSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

const tasks = mongoose.model("tasks", tasksSchema);

module.exports = { tasks, tasksSchema };
