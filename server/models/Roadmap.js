const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  minutes: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
});

const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  tasks: { type: [taskSchema], default: [] }
});

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true
    },
    company: { type: String, default: "Microsoft" },
    studyHours: { type: Number, default: 4 },
    days: { type: [daySchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);