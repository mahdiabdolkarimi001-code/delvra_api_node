const path = require("path");

function showHomePage(req, res) {
    res.sendFile(path.join(__dirname, "../views/home.html"));
}

module.exports = { showHomePage };
