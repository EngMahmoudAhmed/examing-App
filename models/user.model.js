const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const studentAnswers = require("./studentAnswers");

const users_Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "student must have Name."],
    },
    grade: {
      type: String,
      enum: ["G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G12"],
    },
    address: String,
    studentMobile: String,
    parentMobile: String,
    group: String,
    studentCode: {
      type: String,
    },
    password: String,
  },
  {
    timestamps: { createdAt: "creationTime", updatedAt: "lastModified" },
    versionKey: false,
  }
);

users_Schema.index({ studentCode: 1 }, { unique: true });

users_Schema.pre("save", async function (next) {
  const isModified = this.isModified("password");
  if (!isModified) return next(); //Don't re-hash if not modified + it will save empty or default value
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

users_Schema.pre("findOneAndDelete", async function (next) {
  const student = await this.model.findOne(this.getQuery());
  if (student) {
    studentAnswers.deleteOne({ studentCode: student.studentCode });
  }
  next();
});

const usersDB = mongoose.model("users_table", users_Schema);

module.exports = usersDB;
