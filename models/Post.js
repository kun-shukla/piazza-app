const mongoose = require("mongoose");

// Define the schema for individual interactions
const InteractionSchema = mongoose.Schema({
  user: {
    name: { type: String, required: true }, // Information about the user
  },
  action_type: {
    type: String,
    enum: ["like", "dislike", "comment"], // Type of interaction
    required: true,
  },
  action_value: {
    type: String, // Optional value for comments
    default: null,
  },
});

// Define the schema for a post
const PostSchema = mongoose.Schema({
  post_title: {
    type: String,
    required: true, // Title of the post
  },
  post_topics: {
    type: [String], // Array of topics (e.g., Politics, Tech)
    enum: ["Politics", "Health", "Sport", "Tech"],
    required: true,
  },
  post_timestamp: {
    type: Date,
    default: Date.now, // Timestamp of post registration
  },
  post_body: {
    type: String,
    required: true, // Content of the post
  },
  post_expiration_time: {
    type: Date, // When the post stops accepting actions
    default: function () {
      // Add 3 days to the current timestamp
      return new Date(Date.now() + 60 * 1000);
    },
  },
  post_status: {
    type: String,
    enum: ["Live", "Expired"], // Status of the post
    default: "Live",
  },
  post_owner: {
    name: { type: String, required: true }, // Owner of the post
  },
  post_likes: {
    type: Number,
    default: 0, // Default to zero likes
  },
  post_dislikes: {
    type: Number,
    default: 0, // Default to zero dislikes
  },
  post_interactions: {
    type: [InteractionSchema], // Array of interactions
  },
});

module.exports = mongoose.model("Post", PostSchema);
