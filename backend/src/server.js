const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/environment');
const { testConnection } = require('./config/database');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const laboratoryRoutes = require('./routes/laboratoryRoutes');
const billingRoutes = require('./routes/billingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hospital Management System API',
    database: config.db.database,
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.error('[FATAL] Failed to connect to MySQL database hospital_management_system. Please check credentials in .env.');
  }

  const server = app.listen(config.port, () => {
    console.log(`[HMS Server] REST API is live on http://localhost:${config.port}`);
    console.log(`[HMS Server] Environment: ${config.nodeEnv}`);
    console.log(`[HMS Server] CORS Allowed Origin: ${config.frontendUrl}`);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
