const router = require("express").Router();
const Service = require("../models/service");
const auth = require("../middleware/auth");

/* ===============================
   GET SERVICES (SAFE)
================================ */
router.get("/", auth, async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    console.error("SERVICE GET ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ===============================
   SAVE / UPDATE SERVICE (SAFE)
================================ */
router.post("/", auth, async (req, res) => {
  try {
    if (!req.body.key) {
      return res.status(400).json({ message: "Service key required" });
    }

    const service = await Service.findOneAndUpdate(
      { key: req.body.key },
      req.body,
      { upsert: true, new: true }
    );

    res.json(service);
  } catch (err) {
    console.error("SERVICE SAVE ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
