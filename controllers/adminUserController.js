const { fetchUsers, deleteUserById } = require("../models/adminUserModel");

async function showAdminUsersPage(req, res) {
  res.sendFile(require("path").join(__dirname, "../views/adminUsers.html"));
}

async function getUsers(req, res) {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function removeUser(req, res) {
  try {
    const id = req.params.id;
    const result = await deleteUserById(id);
    if (result.affectedRows) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "کاربر پیدا نشد" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { showAdminUsersPage, getUsers, removeUser };
