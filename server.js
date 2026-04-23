const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

/* CONNECT DB */
mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log("MongoDB Connected"))
  .catch(err=>console.log(err));

/* MODELS */
const Email = mongoose.model("Email", {
  email: String,
  date: Date
});

const Visit = mongoose.model("Visit", {
  date: Date
});

/* SAVE EMAIL */
app.post("/save-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send("No email");

    const exists = await Email.findOne({ email });
    if (exists) return res.send({ success: true });

    await Email.create({ email, date: new Date() });

    res.send({ success: true });
  } catch {
    res.status(500).send("Error");
  }
});

/* TRACK VISITS */
app.get("/track", async (req, res) => {
  await Visit.create({ date: new Date() });
  res.sendStatus(200);
});

/* ADMIN DATA */
app.get("/admin-data", async (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY)
    return res.status(403).send("Forbidden");

  const emails = await Email.find().sort({ date: -1 });
  const visits = await Visit.countDocuments();

  res.json({
    totalEmails: emails.length,
    totalVisits: visits,
    emails
  });
});

/* SERVE ADMIN */
app.use("/admin", express.static("admin"));

app.listen(process.env.PORT || 3000);