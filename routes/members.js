const express = require('express');
const router = express.Router();
const path = require('path'); // Import the path module
const db = require('../db'); // Importing database connection
const multer = require('multer');

// Rest of your code...

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Uploads will be stored in the 'uploads/' directory
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    ); // Use the current timestamp as the filename
  },
});

// Initialize multer middleware
const upload = multer({ storage: storage });

// Route to handle member creation
// Get all blogs
router.get('/members', (req, res) => {
  db.query(
    'SELECT *, DATE(created_at) AS date, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS fullDate FROM members',
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.json(results);
    }
  );
});

// Add a new member
router.post('/members', upload.single('image'), (req, res) => {
  const {
    id,
    name,
    surname,
    age,
    email,
    dateOfBirth,
    baptised,
    memberOf,
    localChurch,
    fromDate,
    father,
    mother,
  } = req.body;

  const image = `${req.protocol}://${req.get('host')}/uploads/${
    req.file.filename
  }`;

  const newMember = {
    id: id,
    name: name,
    surname: surname,
    age: age,
    email: email,
    image: image,
    dateOfBirth: dateOfBirth,
    baptised: baptised,
    memberOf: memberOf,
    localChurch: localChurch,
    fromDate: fromDate,
    father: father,
    mother: mother,
  };

  db.query('INSERT INTO members SET ?', newMember, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json({ message: 'Member added successfully', id: result.insertId });
  });
});

// Update a member
router.put('/members/:id', (req, res) => {
  const {
    name,
    surname,
    age,
    email,
    dateOfBirth,
    baptised,
    memberOf,
    localChurch,
    fromDate,
    father,
    mother,
  } = req.body;

  const updatedMember = {
    name,
    surname,
    age,
    email,
    dateOfBirth,
    baptised,
    memberOf,
    localChurch,
    fromDate,
    father,
    mother,
  };

  db.query(
    'UPDATE members SET ? WHERE id = ?',
    [updatedMember, req.params.id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.json({ message: 'Member updated successfully' });
    }
  );
});

// Delete a member
router.delete('/members/:id', (req, res) => {
  db.query(
    'SELECT * FROM members WHERE id = ?',
    req.params.id,
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'Member not found' });
      }

      const imageFilename = result[0].image.split('/').pop();
      const imagePath = `./uploads/${imageFilename}`;

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }

        db.query('DELETE FROM members WHERE id = ?', req.params.id, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
          }
          res.json({ message: 'Member deleted successfully' });
        });
      });
    }
  );
});

module.exports = router;
