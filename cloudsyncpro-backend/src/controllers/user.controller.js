const userService = require("../services/user.service");
const { validationResult } = require("express-validator");

exports.getProfile = async (req, res) => {
  try {
    const profile = await userService.getUserProfile(req.user.id_user);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const result = await userService.updateUserProfile(
      req.user.id_user,
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
