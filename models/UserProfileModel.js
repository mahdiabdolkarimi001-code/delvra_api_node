const { getDB } = require("../config/db");

async function getUserProfileById(userId) {
  const db = getDB();

  const [rows] = await db.query(
    `
    SELECT 
      u.id, 
      u.userId, 
      u.name, 
      u.profile_image1, 
      u.profile_image2, 
      u.profile_image3, 
      u.profile_image4, 
      u.profile_image5, 
      u.bio
    FROM users u
    WHERE u.id = ?
    `,
    [userId]
  );

  return rows[0] || null;
}

module.exports = { getUserProfileById };
