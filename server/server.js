require('dotenv').config();          
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

// Database connection
require('./database/connection');      

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/user', require('./routes/userRoutes'));

// Swagger docs (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');
  const swaggerDocs = yaml.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello from my Express server!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
