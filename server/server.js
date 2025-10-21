require('dotenv').config();

if (!process.env.SECRET_KEY) {
  throw new Error('Missing SECRET_KEY environment variable');
}

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

// Database connection
const { connect } = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (useful for uptime monitors)
app.get('/health', (req, res) => res.status(200).send('OK'));

// Routes
app.use('/api/v1/user', require('./routes/userRoutes'));

// Swagger docs (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  try {
    const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');
    const swaggerDocs = yaml.load(swaggerPath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  } catch (err) {
    console.warn('Swagger file not found or invalid:', err.message);
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello from my Express server!');
});

// Start server only after DB connection is ready
(async () => {
  try {
    await connect();
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB, exiting', err);
    process.exit(1);
  }
})();