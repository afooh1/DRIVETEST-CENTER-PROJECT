const express = require('express');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

// Models
const User = require('./models/User');
const BlogPost = require('./models/BlogPost');
const Appointment = require('./models/Appointment');

// Initialize Express App
const app = express();

// View Templating Engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(methodOverride('_method'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Make session available in all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:admin@cluster0.3460p.mongodb.net/DriveTest?retryWrites=true&w=majority')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import Controllers
const homeController = require('./controllers/homeController');
const authController = require('./controllers/authController');
const newUserController = require('./controllers/newUserController');
const storeUserController = require('./controllers/storeUserController');
const loginController = require('./controllers/loginController');
const g2Controller = require('./controllers/g2Controller');
const gController = require('./controllers/gController');
const appointmentController = require('./controllers/appointmentController');
const newPostController = require('./controllers/newPostController');
const storePostController = require('./controllers/storePostController');

// Middleware for route protection
const { isAuthenticated, isDriver, isAdmin } = require('./middlewares/authMiddleware');

// Routes
app.get('/', homeController);

// Authentication Routes
app.get('/auth', authController);
app.get('/auth/register', newUserController);
app.post('/users/register', storeUserController);
app.route('/auth/login')
    .get(authController)
    .post(loginController);
app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// G2 Test Routes
app.get('/g2_page', isAuthenticated, isDriver, g2Controller.getG2Page);
app.post('/g2_page/book/:id', isAuthenticated, isDriver, g2Controller.bookAppointment);
app.post('/g2_page/submit', isAuthenticated, isDriver, g2Controller.submitUserInfo);
app.post('/g2_page/cancel/:id', isAuthenticated, isDriver, g2Controller.cancelAppointment);

// G License Routes
app.get('/g_page', isAuthenticated, isDriver, gController.getGPage);
app.post('/g_page/search', isAuthenticated, isDriver, gController.searchByLicense);

// Appointment Routes
app.get('/appointment', isAuthenticated, isAdmin, appointmentController.getAppointments);
app.post('/appointment/create', isAuthenticated, isAdmin, appointmentController.createAppointment);
app.delete('/appointment/:id', isAuthenticated, isAdmin, appointmentController.deleteAppointment);

// Blog Post Routes
app.get('/posts/new', isAuthenticated, newPostController);
app.post('/posts/store', isAuthenticated, storePostController);

// Start Server
app.listen(4000, () => console.log('App is listening on port 4000'));