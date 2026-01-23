const express = require("express");
const router = express.Router();
const Incentive = require("../models/Incentive");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const i = await Incentive.findOne();
    res.json(i || { front: 0, rear: 0, shock: 0 });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/", auth, async (req, res) => {
  const { front, rear, shock } = req.body;

  if (
    typeof front !== "number" ||
    typeof rear !== "number" ||
    typeof shock !== "number"
  ) {
    return res.status(400).json({ message: "Invalid incentive data" });
  }

  try {
    const i = await Incentive.findOneAndUpdate(
      {},
      { front, rear, shock },
      { upsert: true, new: true }
    );
    res.json(i);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
