require("./database/database");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const UsersRouter = require("./routers/users.js");
const TasksRouter = require("./routers/tasks.js");

const multer = require("multer");
const upload = multer({
  // dest: "images",
});
app.use(bodyParser.json());

app.post("/upload", upload.single("upload"), async (req, res) => {
  // console.log(req.file);
  // const file = reqiure("../images/f62e67a7c48a767d03eedf19d214f06b.jpg");
  res.send(file);
});

// this ensures that body can be viewed - display req.body in all app requests
app.use(UsersRouter);
app.use(TasksRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log("the app is successfully working on port " + port);
});

module.exports = upload;
