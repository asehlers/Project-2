var path = require("path");

module.exports = function(app)
{
  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "../character page.html"));
  });

  app.get("/chooseMonsters", function(req, res) {
    res.sendFile(path.join(__dirname, "../character page.html"));
  });

  app.get("/battle", function(req, res) {
    res.sendFile(path.join(__dirname, "../battle page.html"));
  });
}