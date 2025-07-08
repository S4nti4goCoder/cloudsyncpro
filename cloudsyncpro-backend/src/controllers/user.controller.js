const userService = require("../services/user.service");

exports.getProfile = async (req, res) => {
  try {
    const profile = await userService.getUserProfile(req.user.id_user);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
