const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const path = require('path');
dotenv.config({path: './config/config.env'});
const cookieParser = require('cookie-parser');
const cors = require('cors');
connectDB();



// Route Files

const flowers = require('./routes/flowers');
const auth = require('./routes/auth');
const app = express();

// cors middleware
app.use(cors());

app.use(express.json());

app.use(cookieParser());

// Dev Logging Middleware
if(process.env.NODE_ENV == "development"){
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')))

// Mount routers
app.use('/api/v1/flowers', flowers);
app.use('/api/v1/auth', auth);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle unhandled promise rejections

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process

    server.close(() => process.exit(1));
})


