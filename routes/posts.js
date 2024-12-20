const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const verifyToken = require("../verifyToken");

// Updates the status of a post based on its expiration time.
const updatePostStatus = async (post) => {
  const now = new Date();
  if (now >= post.post_expiration_time) {
    post.post_status = "Expired";
    await post.save();
  }
};

// POST a post (CREATE)
router.post("/", verifyToken, async (req, res) => {
  const postData = new Post({
    post_title: req.body.post_title,
    post_topics: req.body.post_topics,
    post_body: req.body.post_body,
    post_owner: { name: req.user.username },
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
router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts);
  } catch (err) {
    res.status(400).send({ message: err });
  }
});

// Fetch a post by ID (READ 2)
router.get("/:postId", verifyToken, async (req, res) => {
  try {
    const postById = await Post.findById(req.params.postId);
    res.send(postById);

    // Update post status based on expiration time
    await updatePostStatus(postById);
  } catch (err) {
    res.send({ message: err });
  }
});

// Fetch posts by topic (READ 3)
router.get("/topic/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;

    // Fetch posts matching user specified topic
    const posts = await Post.find({ post_topics: topic });

    // If no posts are found
    if (posts.length === 0) {
      return res
        .status(404)
        .send({ message: `No posts found for topic: ${topic}` });
    }
    res.send(posts);
  } catch (err) {
    res.send({ message: err });
  }
});

// Fetch 'trending' (most active) post by topic  (READ 4)
router.get("/trending/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;

    // Validate topic
    if (!["Politics", "Health", "Sport", "Tech"].includes(topic)) {
      return res.status(400).send({ message: "Invalid topic provided." });
    }

    // Find posts by topic and sort by total likes + dislikes
    const trendingPost = await Post.findOne({ post_topics: topic })
      .sort({ post_likes: -1, post_dislikes: -1 }) // Sort by highest likes, then dislikes
      .exec();
    res.send(trendingPost);
  } catch (err) {
    res.send({ message: err });
  }
});

router.get("/trending/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;

    // Validate topic
    if (!["Politics", "Health", "Sport", "Tech"].includes(topic)) {
      return res.status(400).send({ message: "Invalid topic provided." });
    }

    // Find all posts for the topic
    const posts = await Post.find({ post_topics: topic });

    if (posts.length === 0) {
      return res
        .status(404)
        .send({ message: "No posts found for this topic." });
    }

    // Calculate the trending post (highest sum of likes and dislikes)
    const trendingPost = posts.reduce((max, post) => {
      const totalInteractions = post.post_likes + post.post_dislikes;
      const maxInteractions = max.post_likes + max.post_dislikes;
      return totalInteractions > maxInteractions ? post : max;
    }, posts[0]);

    res.send(trendingPost);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Fetch expired posts by topic (READ 5)
router.get("/expired/:topic", async (req, res) => {
  try {
    const topic = req.params.topic;

    // Validate topic
    if (!["Politics", "Health", "Sport", "Tech"].includes(topic)) {
      return res.status(400).send({ message: "Invalid topic provided." });
    }
    const expiredPosts = await Post.find({
      post_topics: topic,
      post_status: "Expired",
    });
    res.send(expiredPosts);
  } catch (err) {
    res.send({ message: err });
  }
});

// PATCH user interaction for a post, matched by Id (UPDATE)
router.patch("/:postId", verifyToken, async (req, res) => {
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

// Delete a post by Id (DELETE)
router.delete("/:postId", async (req, res) => {
  try {
    const deletePostById = await Post.deleteOne({ _id: req.params.postId });
    res.send(deletePostById);
  } catch (err) {
    res.send({ message: err });
  }
});

module.exports = router;
