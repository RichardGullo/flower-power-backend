const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  id:{type:String},
  name:{type:String},
  selected:{type:Boolean}
});

const FlowerSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: [true, "Please add a nickname"],
      trim: true,
      maxlength: [50, "Nickname can not be more than 50 characters"],
    },
    species: {
      type: String,
      maxlength: [50, "Species can't be longer than 50 characters."],
    },
    photo: {
      type: String,
    },
    classes: [classSchema],
    notes:{

    },
    acquiredDate:{
      type:String,
    },
    waterFreq:{
      type:String
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: false,
    },
  },
);

module.exports = mongoose.model("Flower", FlowerSchema);