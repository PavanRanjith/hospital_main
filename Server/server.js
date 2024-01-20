const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;

const db = mysql.createPool({
  connectionLimit:10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'HOSPITAL_APPOINTMENT',
});

const SECRET_KEY = 'DHANUSH@10578AVDHJRUJ@12345VILLUPURAM';


// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL database:', err);
//   } else {
//     console.log('Connected to MySQL database');
//   }
// });

app.use(cors());
app.use(bodyParser.json());





app.post('/signup', async (req, res) => {
  const { name, phoneNumber, password } = req.body;
  console.log("hello");

  if (!name || !phoneNumber || !password) {
    return res.status(400).json({ message: 'Name, phone number, and password are required' });
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user details into the database using promises
    const insertUserQuery = 'INSERT INTO patient (PATIENT_NAME, CONTACT_NUMBER, PASSWORD) VALUES (?, ?, ?)';
    await new Promise((resolve, reject) => {
      db.query(insertUserQuery, [name, phoneNumber, hashedPassword], (insertUserErr) => {
        if (insertUserErr) {
          console.error('Error inserting user into database:', insertUserErr);
          reject(insertUserErr);
        } else {
          console.log('User Registered successfully.');
          resolve();
        }
      });
    });

    res.status(200).json({ message: 'User Registered successfully.' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  
  const { phoneNumber, password } = req.body;
 
  if (!phoneNumber || !password) {
    return res.status(400).json({ message: 'Phone number and password are required' });
  }

  const selectQuery = 'SELECT * FROM patient WHERE CONTACT_NUMBER = ?';
  console.log(selectQuery);
  db.query(selectQuery, [phoneNumber], async (selectErr, result) => {
    if (selectErr) {
      console.error('Error querying database:', selectErr);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: 'Phone number not found. Please sign up.' });
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.PASSWORD);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({phoneNumber: user.phoneNumber }, SECRET_KEY, {
      expiresIn: '1h', // Set the expiration time for the token
    });
    console.log(token);

    console.log('Login successful');
    res.status(200).json({ message: 'Login successful' }, token);
  });
});



app.get('/api/hospitals', async(req, res) => {
  try {
    // Using the connection pool to execute queries
    const [rows] = await db.query('SELECT * FROM hospital');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/hospital_specialization_mapping/:hospitalId', async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;
    console.log(hospitalId);

    const [results] = await db.execute(
      'SELECT * FROM hospital_specialization_mapping WHERE HOSPITAL_ID = ?',
      [hospitalId]
    );

    console.log(results);
    res.json(results);
  } catch (error) {
    console.error('Error fetching specialization mapping:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch specializations based on IDs
app.get('/api/specializations', async (req, res) => {
  try {
    const specializationIds = req.query.ids.split(',').map(id => parseInt(id));
    const query = `SELECT * FROM specialization WHERE SPECIALIZATION_ID IN (${specializationIds.join(',')})`;
    
    const results = await db.query(query);
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  
});


// Assuming doctor_specialization_mapping table has columns DOCTOR_ID and SPECIALIZATION_ID
app.get('/api/doctor_specialization_mapping/:specializationId', async (req, res) => {
  try {
    const specializationId = req.params.specializationId;
    const query = `SELECT DOCTOR_ID FROM doctor_specialization_mapping WHERE SPECIALIZATION_ID = ${specializationId}`;

    const [results] = await db.query(query);
    const doctorIds = results.map(result => result.DOCTOR_ID);
    res.json(doctorIds);
    console.log(doctorIds);
  } catch (error) {
    console.error('Error fetching doctor_ids:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/api/doctors/:doctorId', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const hospitalId = req.query.hospitalId;
    console.log(hospitalId);

    // Assuming doctor table has columns DOCTOR_ID and DOCTOR_NAME
    const query = `SELECT DOCTOR_NAME, DOCTOR_ID FROM doctor WHERE DOCTOR_ID = ${doctorId} AND HOSPITAL_ID = ${hospitalId}`;

    const [results] = await db.query(query);
    res.json(results);
    console.log(results);
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/slots', async (req, res) => {
  try {
    const doctorId = req.query.doctorId;
    const dayOfWeek = req.query.dayOfWeek;
    const currentTime = req.query.currentTime;
    const futureTime = req.query.futureTime;
    
    console.log(doctorId);
    console.log(dayOfWeek);
    console.log(currentTime);
    console.log(futureTime);

    // Assuming your slots table has columns DOCTOR_ID, DAY_OF_WEEK, OP_START_TIME
    const query = `
    SELECT OP_START_TIME, DOC_SLOT_ID
    FROM slot
    WHERE DOCTOR_ID = ${doctorId}
      AND DAY_OF_WEEK = '${dayOfWeek}'
      AND OP_START_TIME > '${currentTime}'
      AND OP_START_TIME <= '${futureTime}'
    ORDER BY OP_START_TIME;
  `;

  const [results] = await db.query(query, [doctorId, dayOfWeek, currentTime, futureTime]);

  console.log(results);

  const slotsData = results.map((slot) => ({
    OP_START_TIME: slot.OP_START_TIME,
    DOC_SLOT_ID: slot.DOC_SLOT_ID,
  }));

  res.json(slotsData);
  console.log(slotsData);
  } catch (error) {
    console.error('Error processing slots request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/book-slot', async (req, res) => {
  try {
    const { docSlotId } = req.body;
    let results;
    // Check if docSlotId exists in the token generator table
    const checkQuery = `SELECT * FROM token_generator WHERE DOC_SLOT_ID = ${docSlotId}`;
    console.log(checkQuery);
    
    try {
      [results] = await db.query(checkQuery);
      console.log(results.length);
    } catch (error) {
      console.error('Error executing query:', error);
    }
    if (results.length > 0) {
      // If docSlotId exists, update the current_token_number
      const updateQuery = `
        UPDATE token_generator
        SET CURRENT_TOKEN_NUMBER = CURRENT_TOKEN_NUMBER + 1
        WHERE DOC_SLOT_ID = ${docSlotId}
      `;
      await db.query(updateQuery);
    } else {
      // If docSlotId doesn't exist, insert a new row
      const insertQuery = `
        INSERT INTO token_generator (DOC_SLOT_ID, DATE, CURRENT_TOKEN_NUMBER)
        VALUES (${docSlotId}, CURRENT_DATE(), 1)
      `;
      await db.query(insertQuery);
    }

    // Return success response
    res.status(200).json({ message: 'Slot booked successfully' });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});