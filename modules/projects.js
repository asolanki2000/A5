/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Ashish Dilipbhai Solanki Student ID: 128266228 Date: 07/26/2025
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/

require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');
require('pg');

// Sequelize setup
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  }
);

// Define Sector model
const Sector = sequelize.define('Sector', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: DataTypes.STRING
}, {
  createdAt: false,
  updatedAt: false
});

// Define Project model
const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: DataTypes.STRING,
  feature_img_url: DataTypes.STRING,
  summary_short: DataTypes.TEXT,
  intro_short: DataTypes.TEXT,
  impact: DataTypes.TEXT,
  original_source_url: DataTypes.STRING,
  sector_id: DataTypes.INTEGER
}, {
  createdAt: false,
  updatedAt: false
});

// Define relationship
Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// Function to initialize DB
function initialize() {
  return sequelize.sync();
}

// Get all projects
function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

// Get project by ID
function getProjectById(id) {
  return Project.findAll({
    where: { id },
    include: [Sector]
  }).then(data => {
    if (data.length > 0) return data[0];
    else throw "Unable to find requested project";
  });
}

// Get projects by sector name
function getProjectsBySector(sectorName) {
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Op.iLike]: `%${sectorName}%`
      }
    }
  }).then(data => {
    if (data.length > 0) return data;
    else throw "Unable to find requested projects";
  });
}

// Export functions
module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject,
  getAllSectors,
  editProject,
  deleteProject
};

function deleteProject(id) {
  return Project.destroy({
    where: { id }
  }).then(() => {})
    .catch(err => {
      throw err.errors?.[0]?.message || err;
    });
}
