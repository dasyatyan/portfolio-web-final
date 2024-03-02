require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });

// Define user schema
const userSchema = new mongoose.Schema({
    email: String,
    username: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String,
    age: Number,
    country: String,
    gender: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const itemSchema = new mongoose.Schema({
    username: String,
    picture1: String,
    picture2: String,
    picture3: String,
    names: String,
    descriptions: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null }
});

const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema); // Create model for item

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register', { message: '' }); // Pass an empty message initially
});

app.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.render('register', { message: 'User already exists. Choose a different username.' });
        }

        const {email, username, password, firstName, lastName, age, country, gender } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, username, password: hashedPassword, firstName, lastName, age, country, gender });
        await user.save();

        // Send welcome email
        const recipient = email; // Assuming the username is also the email address
        const info = await transporter.sendMail({
            from: 'kadashalalala@gmail.com',
            to: recipient,
            subject: "Welcome to TRADING HUB Tech Hub",
            text: "Thank you for choosing us!"
        });

        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Function to validate password
function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    return passwordRegex.test(password);
}

app.get('/login', (req, res) => {
    res.render('login', { message: '' }); // Pass an empty message initially
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { message: 'Incorrect username or password. Please try again.' });
    }

    req.session.userId = username; // Store username instead of user._id

    if (user.role === 'admin') {
        return res.redirect('/admin');
    } else {
        return res.redirect('/dashboard');
    }
});


// Route to handle adding new items
// Route to handle adding new items
app.post('/admin/add-item', async (req, res) => {
    try {
        const { username, picture1, picture2, picture3, names, descriptions } = req.body;

        const newItem = new Item({
            username,
            picture1,
            picture2,
            picture3,// Store pictures in an array
            names,
            descriptions
        });

        await newItem.save();
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to handle editing existing items

app.post('/admin/edit-item', async (req, res) => {
    let { objectId, names, descriptions } = req.body; // Get objectId, names, and descriptions from the request body
    try {
        // Trim any whitespace from objectId
        objectId = objectId.trim();

        // Check if objectId is a valid ObjectId
        if (!mongoose.isValidObjectId(objectId)) {
            return res.status(400).send('Invalid objectId');
        }

        // Find the item by its ID and update its name and description
        await Item.findByIdAndUpdate(objectId, { names, descriptions, updatedAt: Date.now() });
        res.redirect('/admin'); // Redirect back to the admin dashboard after successful update
    } catch (error) {
        res.status(500).send(error.message); // Send an error response if there's an error
    }
});



// Route to handle soft deletion of items
app.post('/admin/delete-item/:itemId', async (req, res) => {
    const { itemId } = req.params;
    try {
        await Item.findByIdAndDelete(itemId);
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        try {
            // Find items where the username matches the logged-in user's username
            const items = await Item.find({ username: req.session.userId });
            res.render('dashboard', { items });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
});

app.get('/location', (req, res) => {
    res.render('location', { message: '' }); // Pass an empty message initially
});




app.get('/exchange-rates', async (req, res) => {
    try {
        const response = await axios.get('https://openexchangerates.org/api/latest.json?app_id=7c863ad618954be0bd0e580284078fed');
        res.render('exchange-rates', { rates: response.data.rates });
    } catch (error) {
        console.error(error);
        res.send('An error occurred');
    }
});




app.get('/btcChart', (req, res) => {
    res.render('btcChart', (err, html) => {
        if (err) {
            console.log('Error rendering page:', err);
            return res.send('Error rendering page');
        }
        res.send(html);
    });
});

app.get('/admin', async (req, res) => {
    try {
        const items = await Item.find();
        res.render('admin', { items, message: '' }); // Pass an empty message initially
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});
app.get('/crypto-news', async (req, res) => {
    const apiKey = 'pub_391647d16c540091ecfb7c5b8aedde1ea27ce';
    const apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=cryptocurrency`;

    try {
        const response = await axios.get(apiUrl);
        const newsArticles = response.data.results || [];
        res.render('crypto-news', { newsArticles });
    } catch (error) {
        console.error('Failed to fetch crypto news:', error);
        res.render('error', { message: 'Failed to load cryptocurrency news.' });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
