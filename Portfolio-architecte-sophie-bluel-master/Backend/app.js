const express = require('express');
const path = require('path');
const cors = require('cors')
require('dotenv').config();
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
// Load swagger.yaml using an absolute path so it works regardless of the current working directory
const swaggerDocs = yaml.load(path.join(__dirname, 'swagger.yaml'))
const app = express()
// Allow CORS from any origin for local development (adjust in production)
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet({
      crossOriginResourcePolicy: false,
    }));
app.use('/images', express.static(path.join(__dirname, 'images')))
// Serve the FrontEnd folder statically to avoid file:// origin issues during local testing
app.use(express.static(path.join(__dirname, '..', 'FrontEnd')))
// Helpful log for local development: indicate where the FrontEnd is served
console.log(`FrontEnd static files served from: ${path.join(__dirname, '..', 'FrontEnd')} (open http://localhost:${process.env.PORT || 5678}/login.html)`);

const db = require("./models");
const userRoutes = require('./routes/user.routes');
const categoriesRoutes = require('./routes/categories.routes');
const worksRoutes = require('./routes/works.routes');
db.sequelize.sync().then(()=> console.log('db is ready'));
app.use('/api/users', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/works', worksRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
module.exports = app;

