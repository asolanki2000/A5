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

const express = require('express');
const app = express();
const path = require('path');
const projectService = require('./modules/projects');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// ROUTES

// Home (Optional)
app.get("/", (req, res) => {
  res.redirect("/solutions/projects");
});

// View All Projects
app.get("/solutions/projects", (req, res) => {
  projectService.getAllProjects()
    .then(projects => {
      res.render("projects", { projects });
    })
    .catch(err => {
      res.render("500", { message: err });
    });
});

// View by Sector
app.get("/solutions/sector/:name", (req, res) => {
  projectService.getProjectsBySector(req.params.name)
    .then(projects => {
      res.render("projects", { projects });
    })
    .catch(err => {
      res.status(404).render("404", { message: err });
    });
});

// Add Project (form)
app.get("/solutions/addProject", (req, res) => {
  projectService.getAllSectors()
    .then(sectors => {
      res.render("addProject", { sectors });
    })
    .catch(err => {
      res.render("500", { message: `Error loading form: ${err}` });
    });
});

// Handle Add Project POST
app.post("/solutions/addProject", (req, res) => {
  projectService.addProject(req.body)
    .then(() => res.redirect("/solutions/projects"))
    .catch(err => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// Edit Project (form)
app.get("/solutions/editProject/:id", (req, res) => {
  Promise.all([
    projectService.getProjectById(req.params.id),
    projectService.getAllSectors()
  ])
    .then(([project, sectors]) => {
      res.render("editProject", { project, sectors });
    })
    .catch(err => {
      res.status(404).render("404", { message: err });
    });
});

// Handle Edit POST
app.post("/solutions/editProject", (req, res) => {
  projectService.editProject(req.body.id, req.body)
    .then(() => res.redirect("/solutions/projects"))
    .catch(err => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// Handle Delete
app.get("/solutions/deleteProject/:id", (req, res) => {
  projectService.deleteProject(req.params.id)
    .then(() => res.redirect("/solutions/projects"))
    .catch(err => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).render("404", { message: "Page Not Found" });
});

// Start the server
projectService.initialize()
  .then(() => {
    app.listen(8080, () => {
      console.log("Server listening on port 8080");
    });
  })
  .catch(err => {
    console.log("Failed to start server:", err);
  });

// Delete Project by ID
app.get("/solutions/deleteProject/:id", (req, res) => {
  projectService.deleteProject(req.params.id)
    .then(() => res.redirect("/solutions/projects"))
    .catch(err => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});
