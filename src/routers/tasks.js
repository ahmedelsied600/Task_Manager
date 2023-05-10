const express = require("express");
const router = new express.Router();
const { tasks, tasksSchema } = require("../models/tasks");
const auth = require("../middlewares/authentication.js");

// This is tasks Methods
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/tasks", auth, async (req, res) => {
  try {
    const newlyAddedItem = new tasks({ ...req.body, owner: req.user._id });
    newlyAddedItem.save();
    res.send(newlyAddedItem);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get all tasks from user's id
router.get("/tasks/me", auth, async (req, res) => {
  const queries = req.query;
  const paths = Object.keys(tasksSchema.paths);
  let match = {};
  let options = {};

  for (let query in queries) {
    // validate and filter results
    if (paths.indexOf(query) !== -1) {
      match[query] = queries[query];
    }
    // paginate results
    if (query === "skip" || query === "limit") {
      options[query] = queries[query];
    }
    // sort results
    if (query === "sortBy") {
      let parts = queries.sortBy.split("_");
      options["sort"] = {};
      options.sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
  }
  try {
    const user = req.user;
    await user.populate({
      path: "tasks",
      match,
      options,
    });
    console.log("reached");

    res.send(user.tasks);
  } catch (err) {
    res.status.send(err.message);
  }
});

// get all about my task using task's id
router.get("/tasks/:id/owner", async (req, res) => {
  try {
    const matchedTask = await tasks.findOne({ _id: req.params.id });
    if (!matchedTask) return res.status(404).send("no matched found");

    await matchedTask.populate("owner");
    res.send(matchedTask.owner);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get all about owner of the task using task's id - dev
router.get("/tasks/:id", async (req, res) => {
  try {
    // console.log("done");
    const matchedTask = await tasks.findOne({ _id: req.params.id });
    if (!matchedTask) return res.status(404).send("no matched Task found");
    res.send(matchedTask);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get all about owner of the task using task's id - dev
router.get("/tasks/:id/owner", async (req, res) => {
  try {
    const matchedTask = await tasks.findOne({ _id: req.params.id });
    if (!matchedTask) return res.status(404).send("no matched Task found");

    await matchedTask.populate("owner");
    res.send(matchedTask.owner);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  try {
    let foundTask = await tasks.findById(req.params.id);
    if (!foundTask) res.status(404).send("Item not found in the database");
    for (property in req.body) {
      // if there is any property that is not found in the db , give error
      if (!foundTask[property])
        throw new Error("Updated properties are outside the model ones");
      foundTask[property] = req.body[property];
    }
    await foundTask.save();
    res.send(foundTask);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const newVal = await tasks.findByIdAndDelete(req.params.id);
    if (!newVal) return res.status(404).send("Item not found in the database");
    res.send(newVal);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
