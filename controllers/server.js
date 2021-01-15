// Dummy posts to show authorized information
const posts = [
  {
    user_id: 0,
    title: "Backend Developer",
  },
  {
    user_id: 1,
    title: "Data Scientist",
  },
];

// Return title of user
exports.getPosts = (req, res) => {
  const post = posts.filter((post) => +post.user_id === +req.user.user_id);
  res.json([post[0].title]);
};
