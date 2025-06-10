const mongoose = require('mongoose');

const yearbookStorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  title: { type: String, required: true },
  story: { type: String, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'VerifiedAlumni' },
  createdAt: { type: Date, default: Date.now }
});

const yearbookPhotoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  batch: { type: Number, required: true },
  description: { type: String },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'VerifiedAlumni' },
  createdAt: { type: Date, default: Date.now }
});

const YearbookStory = mongoose.model('YearbookStory', yearbookStorySchema);
const YearbookPhoto = mongoose.model('YearbookPhoto', yearbookPhotoSchema);

module.exports = { YearbookStory, YearbookPhoto };