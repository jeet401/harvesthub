const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { connectToDatabase } = require('./lib/mongo');

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: '50mb' })); // Increase payload limit for images
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Also increase URL encoded limit
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ 
  message: 'HarvestHub API Server', 
  status: 'running',
  timestamp: new Date().toISOString()
}));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// API routes (to be implemented)
app.use('/api/auth', require('./routes/auth')); // signup/login/logout
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/chat', require('./routes/chat')); // Chat routes

// Socket.io connection handling
require('./lib/socket')(io);

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Server with Socket.io listening on ${PORT}`));
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
