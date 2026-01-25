const express = require("express");
const mongoose = require("mongoose");
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const router = express.Router();

/* ===============================
   GET ALL JOBS
================================ */
router.get("/", auth, async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { createdBy: req.user.id };

        const search = req.query.search;

if (search) {
  filter.$or = [
    { vehicle: { $regex: search, $options: "i" } },
    { jobCard: { $regex: search, $options: "i" } }
  ];
}

const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 25;
const skip = (page - 1) * limit;

const jobs = await Job.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();

const total = await Job.countDocuments(filter);

res.json({
  jobs,
  total,
  page,
  pages: Math.ceil(total / limit)
});

  } catch (err) {
    console.error("GET jobs error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ===============================
   GET SINGLE JOB
================================ */
router.get("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("GET job error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ===============================
   CREATE JOB
================================ */
router.post("/", auth, async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(job);
  } catch (err) {
    console.error("CREATE job error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ===============================
   UPDATE JOB
================================ */
router.put("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("UPDATE job error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ===============================
   DELETE JOB
================================ */
router.delete("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("DELETE job error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/export/all", auth, async (req, res) => {
  try {
    const { from, to, search } = req.query;

    let filter =
      req.user.role === "admin"
        ? {}
        : { createdBy: req.user.id };

    if (from) filter.entryDate = { $gte: from };
    if (to) filter.entryDate = { ...filter.entryDate, $lte: to };

    if (search) {
      filter.$or = [
        { vehicle: { $regex: search, $options: "i" } },
        { jobCard: { $regex: search, $options: "i" } }
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Export failed" });
  }
});


module.exports = router;
