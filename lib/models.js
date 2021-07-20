const mongoose = require('mongoose');

const Chunk = mongoose.model('chunk', new mongoose.Schema({
  id: { type: Number, required: true },
  data: { type: String, required: true },
}));

const File = mongoose.model('file', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  chunks: { type: ['ObjectId'], required: true },
}).index({ name: -1 }));

module.exports = { Chunk, File };
