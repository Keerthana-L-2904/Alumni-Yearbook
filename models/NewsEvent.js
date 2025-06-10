const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  eventDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

const News = mongoose.model('News', newsSchema);
const Event = mongoose.model('Event', eventSchema);

module.exports = { News, Event };