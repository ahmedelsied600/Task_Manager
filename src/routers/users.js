const express = require("express");
const router = new express.Router();
const auth = require("../middlewares/authentication.js");
const users = require("../models/users");
const sharp = require("sharp");
const multer = require("multer");
const upload = multer({
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/.(jpg||png)$/)) {
      return cb(new Error("Please upload a Word document"));
    }
    cb(undefined, true);
  },
});

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SGMAILKEY);

const CancelationMsg = {
  to: "ahmedelsied600@gmail.com", // Change to your recipient
  from: "sienceseeker@gmail.com", // Change to your verified sender
  subject: "Welcome to Task app!!",
  text: "Hello to my CRUD task app!! I hope you get a good trip with us",
  html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};

// Create new users
router.post("/users/signup", async (req, res) => {
  try {
    let createdUser = new users(req.body);
    const token = await createdUser.generateAuthToken();
    const WelcomeMsg = {
      to: createdUser.email, // Change to your recipient
      from: "sienceseeker@gmail.com", // Change to your verified sender
      subject: "Welcome to Task app!!",
      text: "Hello to my CRUD task app!! I hope you get a good trip with us",
      // html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    sgMail
      .send(WelcomeMsg)
      .then(() => {
        console.log("Email sent successfully!!");
      })
      .catch((error) => {
        throw new Error(error.message);
      });
    res.send({ createdUser, token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const matchedItem = await users.findByCredentials(req.body);
    const token = await matchedItem.generateAuthToken();
    res.send({ matchedItem, token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    let user = req.user;
    const currToken = req.header("Authorization").replace("Bearer ", "");
    user.tokens = user.tokens.filter(
      (TokenObj) => TokenObj.token !== currToken
    );
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(500).send("Error when logging out !!");
  }
});

router.post("/users/logoutall", auth, async (req, res) => {
  try {
    let user = req.user;
    const currToken = req.header("Authorization").replace("Bearer ", "");
    user.tokens = [];
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(500).send("Error when logging out !!");
  }
});

router.post(
  "/users/me/avatar",
  upload.single("upload"),
  auth,
  async (req, res) => {
    const user = req.user;
    const NameParts = req.file.originalname.split(".");
    user.avatar = {
      binary: req.file.buffer,
      extension: NameParts[NameParts.length - 1],
    };
    await user.save();

    res.send();
  },
  (error, req, res, next) => {
    res.send(error.message);
  }
);

router.get(
  "/users/:id/avatar",
  // auth,
  async (req, res) => {
    try {
      const user = await users.findById(req.params.id);
      // console.log(user.avatar.binary);

      if (!user || !user.avatar) {
        throw new Error("there no such avatar for such a user!!");
      }
      const formattedImage = await sharp(user.avatar.binary)
        .resize({
          width: 250,
          height: 250,
        })
        .png()
        .toBuffer();
      res.set("Content-Type", `image/png`);
      res.send(formattedImage);
    } catch (err) {
      res.status(404).send(err.message);
    }
  }
);

// preview my profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// // get all users or specific users using its id - dev
// router.get("/users", async (req, res) => {
//   try {
//     console.log(req.query);
//     const matches = await users.find(req.query);
//     if (!matches[0]) res.status(404).send();
//     res.send(matches);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

// // get user using its id
// router.get("/users/:id", async (req, res) => {
//   try {
//     const match = await users.findById(req.params.id);
//     if (!match) res.status(404).send("No user matched in database");
//     res.send(match);
//   } catch (err) {
//     res
//       .status(500)
//       .send("Operation failed : finding user or users in database");
//   }
// });

router.patch("/users/me", auth, async (req, res) => {
  try {
    let matchedItem = req.user;
    if (!matchedItem) return res.status(404).send("User Not Found");

    // update the value
    for (let property in req.body) {
      // test all updated properties are inside the document properties
      if (!matchedItem[property])
        throw new Error("Updated properties are outside the model ones");
      matchedItem[property] = req.body[property];
    }
    await matchedItem.save();
    res.send(matchedItem);
  } catch (err) {
    res.send("there is error here : " + err);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    // await users.deleteOne(req.user);
    // await users.deleteOne();
    // console.log(req.user);
    await req.user.deleteOne();
    // console.log(req.user);
    res.send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
