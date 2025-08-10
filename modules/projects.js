/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Ashish Dilipbhai Solanki Student ID: 128266228 Date: 07/26/2025
*
*  Published URL: https://a5-hr6m6k3q1-ashish-solankis-projects.vercel.app/
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

/* -------------------- Service functions -------------------- */

// Initialize DB (A5)
function initialize() {
  return sequelize.sync();
}

// Read
function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

function getProjectById(id) {
  return Project.findAll({
    where: { id },
    include: [Sector]
  }).then(rows => {
    if (rows.length > 0) return rows[0];
    throw 'Unable to find requested project';
  });
}

function getProjectsBySector(sectorName) {
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Op.iLike]: `%${sectorName}%`
      }
    }
  }).then(rows => {
    if (rows.length > 0) return rows;
    throw 'Unable to find requested projects';
  });
}

// Create
function addProject(projectData) {
  return Project.create(projectData)
    .then(() => {})
    .catch(err => {
      throw (err?.errors?.[0]?.message || err);
    });
}

// Update
function editProject(id, projectData) {
  return Project.update(projectData, { where: { id } })
    .then(() => {})
    .catch(err => {
      throw (err?.errors?.[0]?.message || err);
    });
}

// Delete
function deleteProject(id) {
  return Project.destroy({ where: { id } })
    .then(() => {})
    .catch(err => {
      throw (err?.errors?.[0]?.message || err);
    });
}

// Sectors list
function getAllSectors() {
  return Sector.findAll();
}

/* -------------------- Exports -------------------- */
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
