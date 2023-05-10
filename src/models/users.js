// step#1 - connect as a client to certain database in your database
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const tasks = require("./tasks");
// step#2 - create a new model called user and tasks
const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("This email value is not valid !");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 7,
    trim: true,
    // cant contain 'password'
    validate(value) {
      value = value.toLowerCase();
      if (value.includes("password")) {
        throw new Error('the password can not contain "password"');
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    // must be positive
    validate(value) {
      if (value < 0) {
        throw new Error("the age must be a positive number!");
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  avatar: {
    extension: { type: String },
    binary: { type: Buffer },
  },
});

usersSchema.virtual("tasks", {
  ref: "tasks",
  localField: "_id",
  foreignField: "owner",
});

usersSchema.pre("deleteOne", { document: true }, async function (next) {
  const user = this;
  await tasks.deleteMany({ owner: user._id });
  next();
});

// Document Middleware - this is used when any instance of users is created and saved to database using save()
// this code will be applied before saving to database
usersSchema.pre("save", async function (next) {
  let user = this;
  // save password as hash
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// how to create custom functions to be used with any model like findById and update ...etc ?
// this code will be excuted when model object(=document) is called
usersSchema.statics.findByCredentials = async (data) => {
  const { email, password } = data;
  console.log("reached");

  // get all users in the database and find the needed one(find if email is found)
  let Matcheduser = await users.findOne({ email });
  if (!Matcheduser) {
    throw new Error("User not found!! please sign up first");
  }
  const isMatched = await bcrypt.compare(password, Matcheduser.password);
  if (!isMatched) {
    throw new Error("please enter the correct password for this password");
  }
  return Matcheduser;
};

// how to create custom functions to be used with any document and be applied before saving to database ?
// this code will be excuted when instance of model called
usersSchema.methods.generateAuthToken = function () {
  let user = this;
  // add new token to valid tokens array
  var token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "7 days",
  });
  user.tokens.push({ token });
  user.save();
  return token;
};

usersSchema.methods.verifyAuthToken = function () {
  for (let token of this.tokens) {
    var decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (email === decodedToken.email && password === decodedToken.password) {
      return res.send(matchedItem);
    }
  }
};

usersSchema.methods.toJSON = function () {
  let user = this.toObject();
  delete user.tokens;
  delete user._id;
  delete user.password;
  delete user.__v;
  return user;
};

const users = mongoose.model("users", usersSchema);

module.exports = users;
