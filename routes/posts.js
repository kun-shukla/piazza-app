const express = require("express");
const router = express.Router();

const Post = require("../models/Post");

const updatePostStatus = async (post) => {
  const now = new Date();
  if (now >= post.post_expiration_time) {
    post.post_status = "Expired";
    await post.save();
  }
};

// POST a post (CREATE)
router.post("/", async (req, res) => {
  // console.log(req.body);

  const postData = new Post({
    post_title: req.body.post_title,
    post_topics: req.body.post_topics,
    post_body: req.body.post_body,
    post_owner: req.body.post_owner,
  });
  // try to insert...
  try {
    const postToSave = await postData.save();
    res.send(postToSave);
  } catch (err) {
    res.send({ message: err });
  }
});

// Fetch all posts (READ 1)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts);
  } catch (err) {
    res.send({ message: err });
  }
});

// router.get("/trending", (req, res) => {
//   res.send("You are viewing trending posts!");
// });

// Fetch a post by ID (READ 2)
router.get("/:postId", async (req, res) => {
  try {
    const postById = await Post.findById(req.params.postId);
    res.send(postById);

    // Update post status based on expiration time
    await updatePostStatus(postById);
  } catch (err) {
    res.send({ message: err });
  }
});

// PATCH user interaction for a post (matched by Id)(UPDATE)
router.patch("/:postId", async (req, res) => {
  // Fetch the post by ID
  const post = await Post.findById(req.params.postId);

  await updatePostStatus(post);

  // Check if the post is expired.
  if (post.post_status === "Expired") {
    return res.send({
      message: "This post has expired and cannot accept further interactions.",
    });
  }

  // Extract interaction data from the request body
  const interaction = {
    user: { name: req.body.user_name },
    action_type: req.body.action_type,
    action_value: req.body.action_value || null, // Only applicable for comments
  };

  // Update the like/dislike counter fields based on interaction type
  const updateFields = {};
  if (interaction.action_type === "like") {
    updateFields.post_likes = post.post_likes + 1;
  } else if (interaction.action_type === "dislike") {
    updateFields.post_dislikes = post.post_dislikes + 1;
  }

  // Push the interaction to the post_interactions array and increment like/dislike counters
  try {
    const updatePostById = await Post.updateOne(
      { _id: req.params.postId },
      {
        $set: updateFields,
        $push: { post_interactions: interaction },
      }
    );
    // Fetch and return the updated post to confirm successful outcome
    const updatedPost = await Post.findById(req.params.postId);
    const newInteraction =
      updatedPost.post_interactions[updatedPost.post_interactions.length - 1];
    res.send({ message: "Interaction added successfully.", newInteraction });
  } catch (err) {
    res.send({ message: err });
  }
});

// DELETE a post by Id (Delete)

router.delete("/:postId", async (req, res) => {
  try {
    const deletePostById = await Post.deleteOne({ _id: req.params.postId });
    res.send(deletePostById);
  } catch (err) {
    res.send({ message: err });
  }
});

module.exports = router;
