const Schema = require("mongoose").Schema;

const Comment = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: String,
    detail: String
  },
  { timestamps: true }
);

const patronSchema = new Schema({
  givenName: String,
  familyName: String,
  imageUrl: String,
  title: String,
  story: String
});

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    subtitle: String,
    description: {
      header: String,
      content: String
    },
    patron: patronSchema,
    abilities: {
      type: Array,
      default: ["Python", "Veri Görselleştirme"]
    },
    purchaseNumber: Number,
    commentNumber: Number
  },
  { timestamps: true }
);

module.exports = ProductSchema;
