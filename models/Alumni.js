const mongoose = require("mongoose");

const AlumniSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  occupation: String,
  company: String,
  graduationYear: String,
  collegeIdPath: String,
  isVerified: { type: Boolean, default: false }, // true only when manually verified by admin
  isRejected: { type: Boolean, default: false }, // true when rejected by admin
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

// Create separate models for pending and verified alumni
const PendingAlumni = mongoose.model("PendingAlumni", AlumniSchema);
const VerifiedAlumni = mongoose.model("VerifiedAlumni", AlumniSchema);

module.exports = { PendingAlumni, VerifiedAlumni };