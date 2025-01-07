const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Books = sequelize.define("books", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING,
  author: Sequelize.STRING,
  publicationYear: Sequelize.INTEGER,
  pdfUrl: Sequelize.STRING, // URL path for uploaded PDF
});

module.exports = Books;
