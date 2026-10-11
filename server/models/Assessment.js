const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    company: {
      type: String,
      required: true
    },
    skills: {
      java: { type: Number, min: 0, max: 100 },
      python: { type: Number, min: 0, max: 100 },
      dsa: { type: Number, min: 0, max: 100 },
      dbms: { type: Number, min: 0, max: 100 },
      os: { type: Number, min: 0, max: 100 },
      cn: { type: Number, min: 0, max: 100 },
      aptitude: { type: Number, min: 0, max: 100 }
    },
    projects: {
      type: Number,
      default: 0,
      min: 0
    },
    certifications: {
      type: Number,
      default: 0,
      min: 0
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

const Assessment = mongoose.model("Assessment", assessmentSchema);

module.exports = Assessment;