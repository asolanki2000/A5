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

const express = require('express');
const path = require('path');
const clientSessions = require('client-sessions');

const app = express();

// services
const projectService = require(path.join(__dirname, 'modules', 'projects'));
const authData = require(path.join(__dirname, 'modules', 'auth-service'));

// view engine + static + form parsing
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// sessions
app.use(clientSessions({
  cookieName: 'session',
  secret: 'web322-a6-ultra-secret',
  duration: 2 * 60 * 1000,     // 2 minutes
  activeDuration: 60 * 1000     // extend by 1 minute on activity
}));

// inject session into all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// auth guard
function ensureLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

/* ---------------------- Public routes (read-only) ---------------------- */

app.get('/', (req, res) => res.redirect('/solutions/projects'));

app.get('/solutions/projects', (req, res) => {
  projectService.getAllProjects()
    .then(projects => res.render('projects', { projects }))
    .catch(err => res.render('500', { message: err }));
});

app.get('/solutions/sector/:name', (req, res) => {
  projectService.getProjectsBySector(req.params.name)
    .then(projects => res.render('projects', { projects }))
    .catch(err => res.status(404).render('404', { message: err }));
});

/* ---------------------- Auth routes ---------------------- */

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: '', userName: '' });
});

app.get('/register', (req, res) => {
  res.render('register', { errorMessage: '', successMessage: '', userName: '' });
});

app.post('/register', (req, res) => {
  authData.registerUser(req.body)
    .then(() => res.render('register', { errorMessage: '', successMessage: 'User created', userName: '' }))
    .catch(err => res.render('register', { errorMessage: err, successMessage: '', userName: req.body.userName || '' }));
});

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then(user => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/solutions/projects');
    })
    .catch(err => res.render('login', { errorMessage: err, userName: req.body.userName || '' }));
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
});

/* ---------------------- Protected routes (A6 requires these) ---------------------- */

// Add Project
app.get('/solutions/addProject', ensureLogin, (req, res) => {
  projectService.getAllSectors()
    .then(sectors => res.render('addProject', { sectors }))
    .catch(err => res.render('500', { message: `Error loading form: ${err}` }));
});
app.post('/solutions/addProject', ensureLogin, (req, res) => {
  projectService.addProject(req.body)
    .then(() => res.redirect('/solutions/projects'))
    .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

// Edit Project
app.get('/solutions/editProject/:id', ensureLogin, (req, res) => {
  Promise.all([
    projectService.getProjectById(req.params.id),
    projectService.getAllSectors()
  ])
    .then(([project, sectors]) => res.render('editProject', { project, sectors }))
    .catch(err => res.status(404).render('404', { message: err }));
});
app.post('/solutions/editProject', ensureLogin, (req, res) => {
  projectService.editProject(req.body.id, req.body)
    .then(() => res.redirect('/solutions/projects'))
    .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

// Delete Project
app.get('/solutions/deleteProject/:id', ensureLogin, (req, res) => {
  projectService.deleteProject(req.params.id)
    .then(() => res.redirect('/solutions/projects'))
    .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

/* ---------------------- 404 ---------------------- */

app.use((req, res) => {
  res.status(404).render('404', { message: 'Page Not Found' });
});

/* ---------------------- Start server (single init chain) ---------------------- */

const HTTP_PORT = process.env.PORT || 8080;

projectService.initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, () => console.log(`Server listening on ${HTTP_PORT}`));
  })
  .catch(err => {
    console.log(`unable to start server: ${err}`);
  });
