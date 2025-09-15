const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  // category now references Category model
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  price: { type: Number, default: 0 },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// optional virtual to expose category name easily when populated
ProductSchema.virtual('categoryName').get(function () {
  return this.category && this.category.name ? this.category.name : null;
});

ProductSchema.set('toObject', { virtuals: true });
ProductSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);