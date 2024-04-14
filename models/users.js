const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const usersSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    cloudAccounts: {
      type: Object,
      required: false,
      properties: {
        dropbox: {
          type: String,
        },
        onedrive: {
          type: String,
        },
        googledrive: {
          type: String,
        },
      },
    },
    points:{
      type:Number,
      required:true,
      default:0
    }
  },
  { timestamps: true }
);
const User = mongoose.model("User", usersSchema);

module.exports = User;
