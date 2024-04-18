const express = require('express');
const cors = require('cors'); // Import cors
const bodyParser = require('body-parser');
const path = require('path'); // Import the path module
const db = require('./db');
const app = express();
const port = 3000;

app.use(cors()); // Use cors middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Use the members router for member-related routes
const membersRouter = require('./routes/members');
app.use('/api', membersRouter); // Mount the router at '/api

app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'church-management-app', 'src', 'App.test.js')
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
