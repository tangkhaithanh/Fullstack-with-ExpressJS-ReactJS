const moongoose = require('mongoose');
const {Schema}=moongoose;
const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = moongoose.model('Category', CategorySchema);