const { getDB } = require('../config/db');

const EditProfile = {
  getByUserId: async (userId) => {
    const db = getDB();
    const [rows] = await db.query('SELECT * FROM users WHERE userId = ?', [userId]);
    return rows[0];
  },

  updateProfile: async (userId, data) => {
    const db = getDB();
    const {
      name, age, city, gender,
      occupation, education, height, weight, bio,
      profile_image1, profile_image2, profile_image3, profile_image4, profile_image5
    } = data;

    const [result] = await db.query(`
      UPDATE users SET 
        name = ?, age = ?, city = ?, gender = ?, 
        occupation = ?, education = ?, height = ?, weight = ?, bio = ?,
        profile_image1 = ?, profile_image2 = ?, profile_image3 = ?, profile_image4 = ?, profile_image5 = ?
      WHERE userId = ?
    `, [
      name, age, city, gender,
      occupation, education, height, weight, bio,
      profile_image1, profile_image2, profile_image3, profile_image4, profile_image5,
      userId
    ]);

    return result;
  }
};

module.exports = EditProfile;
