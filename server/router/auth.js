const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const db = require('../db/conn');

const cookieParser = require("cookie-parser");
router.use(cookieParser()); 

const authenticate = require('../middleware/authenticate');

// ---------------------------------------  Admin - Controls ----------------------------------------


// Admin - Login
router.post('/admin-login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const correctUserId = process.env.ADMIN_ID;
    const correctPassword = process.env.ADMIN_PASS;
    const isAuthenticated = userId === correctUserId && password === correctPassword;
    if (isAuthenticated) {
      console.log("Admin Login Successful");
      res.status(200).json({ message: 'Authentication successful' });
    } else {
      console.log("Admin Login Failed");
      res.status(401).json({ error: 'Authentication failed' });
      
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 

// To access all hospitals from hospital databases
router.get('/all-hospitals', (req, res) => {
    db.query('SELECT * FROM HOSPITAL', (error, results) => {
      if (error) throw error;
      res.json(results);
      console.log("Retreival successful from hospital_table");
    });
});

// To access all specializations
router.get('/full-specializations', (req, res) => {
  db.query('SELECT * FROM SPECIALIZATION', (error, results) => {
    if (error) throw error;
    res.json(results);
    console.log("Retreival successful from hospital_table");
  });
});

// To add a new hospital and map it to multiple specializations
router.post('/add-hospital', async (req, res) => {
  const { Hospital_name, Username, Location, password, address, Gmap, specializations } = req.body;
  if(!Hospital_name || !Username || !Location || !password || !address || !Gmap || !specializations){
    console.log("Some of the information is missing");
      return res.status(400).json({ error: 'Missing values' });
  }
  try {
    const usernameExistsQuery = 'SELECT COUNT(*) AS count FROM HOSPITAL WHERE USERNAME = ?';
    const usernameExistsResult = await queryAsync(usernameExistsQuery, [Username]);
    if (usernameExistsResult && usernameExistsResult[0].count > 0) {
      console.log("Username already exists");
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertHospitalQuery = 'INSERT INTO HOSPITAL (HOSPITAL_NAME, USERNAME, LOCATION, PASSWORD, ADDRESS, GMAP) VALUES (?, ?, ?, ?, ?, ?)';
    const insertHospitalResult = await queryAsync(insertHospitalQuery, [Hospital_name, Username, Location, hashedPassword, address, Gmap]);
    if (insertHospitalResult && insertHospitalResult.insertId) {
      console.log('Hospital Added Successfully');
      const fetchHospitalQuery = 'SELECT HOSPITAL_ID FROM HOSPITAL WHERE USERNAME = ?';
      const hospitalResult = await queryAsync(fetchHospitalQuery, [Username]);
      if (hospitalResult && hospitalResult.length > 0) {
        const hospitalId = hospitalResult[0].HOSPITAL_ID;
        for (const specialization of specializations) {
          const fetchSpecializationQuery = 'SELECT SPECIALIZATION_ID FROM SPECIALIZATION WHERE SPECIALIZATION_NAME = ?';
          const specializationResult = await queryAsync(fetchSpecializationQuery, [specialization]);
          if (specializationResult && specializationResult.length > 0) {
            const specializationId = specializationResult[0].SPECIALIZATION_ID;
            const insertMappingQuery = 'INSERT INTO HOSPITAL_SPECIALIZATION_MAPPING (SPECIALIZATION_ID, HOSPITAL_ID) VALUES (?, ?)';
            await queryAsync(insertMappingQuery, [specializationId, hospitalId]);
          } else {
            console.log(`Specialization '${specialization}' not found`);
          }
        }
        console.log('Mappings added to mapping_table successfully');
        res.json({ message: 'Hospital and mappings added successfully' });
      } else {
        console.log("Hospital not found");
        res.status(404).json({ error: 'Hospital not found' });
      }
    } else {
      console.log("Error adding hospital");
      res.status(500).json({ error: 'Error adding hospital' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper function to promisify the db.query function
function queryAsync(query, values) {
  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

//To change the hospital Username
router.put('/edit-hospital/:hospitalID', async (req, res) => {
  try {
    const hospitalID = req.params.hospitalID;
    const { newUsername } = req.body;
    const result = await db
      .promise()
      .query('UPDATE HOSPITAL SET USERNAME = ? WHERE HOSPITAL_ID = ?', [newUsername, hospitalID]);
    if (result[0].affectedRows > 0) {
      console.log("Hospital username updated successfully");
      res.status(200).json({ message: 'Hospital username updated successfully' });
    } else {
      res.status(404).json({ message: 'Hospital not found' });
    }
  } catch (error) {
    console.error('Error updating hospital username:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});









// ---------------------------------------------- Hospital Management's access and Permission ------------------------------------------------------------

//Hospital-login
router.post('/hospital-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    db.query(
      'SELECT HOSPITAL_ID, USERNAME, PASSWORD FROM HOSPITAL WHERE USERNAME = ?',
      [username],
      async (error, results) => {
        if (error) {
          console.error('Error fetching hospital data:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
          console.log("invalid");
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        const hospitalData = results[0];
        const hashedPassword = hospitalData.PASSWORD;
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        if (passwordMatch) {
          const token = jwt.sign({ HOSPITAL_ID: hospitalData.HOSPITAL_ID }, process.env.SECRET);
          // Set the token in a cookie
          res.cookie("jwtoken", token,{ httpOnly: true });
          console.log("Token stored successfully");
          console.log("Hospital-signup-success");
          res.json({ message: 'Hospital signed up successfully', hospitalData, token });
        } else {
          console.log("Hospital-signup-failure");
          res.status(401).json({ error: 'Invalid credentials' });
        }  
      }  
    );
  } catch (error) {
    console.error('Error comparing passwords:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Fetch all specialization names 
router.get('/all-specializations', authenticate,async (req, res) => {
  try { 
    const hospitalID = req.HOSPITAL_ID; 
    db.query(
      'SELECT SPECIALIZATION_ID FROM HOSPITAL_SPECIALIZATION_MAPPING WHERE HOSPITAL_ID = ?',
      [hospitalID],
      (error, results) => {
        if (error) {
          console.error('Error fetching specialization IDs:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        const specializationIDs = results.map(result => result.SPECIALIZATION_ID);
        db.query(
          'SELECT SPECIALIZATION_NAME FROM SPECIALIZATION WHERE SPECIALIZATION_ID IN (?)',
          [specializationIDs],
          (error, specializationResults) => {
            if (error) {
              console.error('Error fetching specialization names:', error);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
            const specializationNames = specializationResults.map(result => result.SPECIALIZATION_NAME);
            db.query('SELECT * FROM HOSPITAL where HOSPITAL_ID = ?',[hospitalID], (error, hospital_details) => {
              if (error) throw error;
              res.status(200).json({ specializations: specializationNames , hospital_details: hospital_details[0]});
              console.log("Retreival of hospital details and specialization is successful");
            }); 
            
          }
        );
      }
    );
  } catch (err) {
    res.status(500).send('Internal Server Error');
    console.error(err);
  }
});


//To change hospital password
router.post('/change-password', authenticate, async (req, res) => {
  const hospitalID = req.HOSPITAL_ID;
  const { oldPassword, newPassword } = req.body;
  try {
    const selectQuery = 'SELECT PASSWORD FROM HOSPITAL WHERE HOSPITAL_ID = ?';
    db.query(selectQuery, [hospitalID], async(error, result) => {
      if (error) {
        console.error('Error fetching doctors:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const hashedPassword = result[0].PASSWORD;
      const passwordMatch = await bcrypt.compare(oldPassword, hashedPassword);
      if (!passwordMatch) {
        console.log("Incorrect password");
        return res.status(400).json({ error: 'Incorrect old password' });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const updateQuery = 'UPDATE HOSPITAL SET PASSWORD = ? WHERE HOSPITAL_ID = ?';
      db.query(updateQuery, [hashedNewPassword, hospitalID]);
      console.log("Password changed successfully");
      res.json({ message: 'Password changed successfully' });
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
 

//Fetch all doctors of a hospital along 
router.get('/full-doctors', authenticate, (req, res) => {
  const hospital_ID = req.HOSPITAL_ID;
  const query = 'SELECT * FROM DOCTOR WHERE HOSPITAL_ID = ? AND FLAG = 1';
  db.query(query, [hospital_ID], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ doctors: results });
      console.log('Retrieval successful from doctors and specialization_table');
    }
  });
});


// Fetch - all doctors of a specific specialization
router.get('/specialized-doctors/:specializationId', authenticate, async (req, res) => {
  try {
    const hospitalID = req.HOSPITAL_ID;
    const specialization_ID = req.params.specializationId;
    const [specializationResult] = await db.promise().query(
      'SELECT SPECIALIZATION_NAME FROM SPECIALIZATION WHERE SPECIALIZATION_ID = ?',
      [specialization_ID]
    );
    const specializationName = specializationResult[0]?.SPECIALIZATION_NAME || '';
    const [doctorsResult] = await db.promise().query(
      "SELECT * FROM DOCTOR WHERE DOCTOR_ID IN ( SELECT DISTINCT d.DOCTOR_ID FROM DOCTOR_SPECIALIZATION_MAPPING d JOIN HOSPITAL_SPECIALIZATION_MAPPING h ON d.SPECIALIZATION_ID = h.SPECIALIZATION_ID WHERE h.HOSPITAL_ID = ? AND d.SPECIALIZATION_ID = ? ) AND FLAG = 1",
      [hospitalID, specialization_ID]
    );
    const doctors = doctorsResult || [];
    res.status(200).json({ doctors, specializationName });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.error(err);
  }
});


// add a doctor
router.post('/add-doctor', authenticate, async (req, res) => {
  try {
    const {
      DOCTOR_NAME,
      CONTACT_NUMBER,
      USERNAME,
      PASSWORD,
      specializations,
      times
    } = req.body;
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    // Insert the doctor details into the DOCTOR table
    const doctorResult = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO DOCTOR (HOSPITAL_ID, DOCTOR_NAME, CONTACT_NUMBER, USERNAME, PASSWORD) VALUES (?, ?, ?, ?, ?)',
        [req.HOSPITAL_ID, DOCTOR_NAME, CONTACT_NUMBER, USERNAME, hashedPassword],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
    const doctorId = doctorResult.insertId;
    // Insert the SLOT details into the SLOT table for each day
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    for (const day of daysOfWeek) {
      const times1 = times[day];
      if (times1 && times1.length > 0 && times1[0] != '') {
        for (const time of times1) {
           db.query(
            'INSERT INTO SLOT (DOCTOR_ID, DAY_OF_WEEK, OP_START_TIME) VALUES (?, ?, ?)',
            [doctorId, day, time]
          );
        }
      }
    }
    //insert the specializations in the mapping table
    if (specializations && specializations.length > 0) {
      for (const specializationId of specializations) {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO DOCTOR_SPECIALIZATION_MAPPING (DOCTOR_ID, SPECIALIZATION_ID) VALUES (?, ?)',
            [doctorId, specializationId],
            (error, results) => {
              if (error) {
                reject(error);
              } else {
                resolve(results);
              }
            }
          );
        });
      }
    }
    console.log("Doctor added");
    res.status(200).json({ message: 'Doctor added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//TO FETCH SPECIALIZATION WHILE ADDINNG DOCTOR
router.get('/hospital-specializations', authenticate, async (req, res) => {
  try {
    const hospitalId = req.HOSPITAL_ID;
 
    // Fetch specializations based on the HOSPITAL_ID
    db.query(
      'SELECT s.SPECIALIZATION_ID, s.SPECIALIZATION_NAME ' +
      'FROM SPECIALIZATION s ' +
      'JOIN HOSPITAL_SPECIALIZATION_MAPPING h ON s.SPECIALIZATION_ID = h.SPECIALIZATION_ID ' +
      'WHERE h.HOSPITAL_ID = ?',
      [hospitalId], (error, specializations) => {
        if (error) throw error;
        res.status(200).json({ specializations });
        console.log("specializations fetched");
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/doctor/:doctor_ID', (req, res) => {
  const doctor_ID = req.params.doctor_ID;
  // Fetching DOCTOR_NAME, CONTACT_NUMBER, USERNAME from the DOCTOR table
  const doctorQuery = `
    SELECT DOCTOR_NAME, CONTACT_NUMBER, USERNAME
    FROM DOCTOR
    WHERE DOCTOR_ID = ?;
  `;
  // Fetching SPECIALIZATION_IDs from DOCTOR_SPECIALIZATION_MAPPING
  const specializationQuery = `
    SELECT SPECIALIZATION_ID
    FROM DOCTOR_SPECIALIZATION_MAPPING
    WHERE DOCTOR_ID = ?;
  `;
  // Fetching SPECIALIZATION_NAMEs from SPECIALIZATION table
  const specializationNameQuery = `
    SELECT SPECIALIZATION_NAME
    FROM SPECIALIZATION
    WHERE SPECIALIZATION_ID IN (?);
  `;
  // Fetching OP_START_TIME from SLOT table
  const slotQuery = `
    SELECT DAY_OF_WEEK, OP_START_TIME
    FROM SLOT
    WHERE DOCTOR_ID = ? AND FLAG = 1;
  `;
  // Arrays to store OP_START_TIME for each day of the week
  const slotsByDay = [[], [], [], [], [], [], []];
  // Execute the queries sequentially
  db.query(doctorQuery, [doctor_ID], (err, doctorResults) => {
    if (err) {
      console.error('Error fetching doctor details: ', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const doctorDetails = doctorResults[0];
    db.query(specializationQuery, [doctor_ID], (err, specializationResults) => {
      if (err) {
        console.error('Error fetching specialization IDs: ', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const specializationIDs = specializationResults.map((result) => result.SPECIALIZATION_ID);
      db.query(specializationNameQuery, [specializationIDs], (err, specializationNameResults) => {
        if (err) {
          console.error('Error fetching specialization names: ', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        const specializations = specializationNameResults.map((result) => result.SPECIALIZATION_NAME);
        db.query(slotQuery, [doctor_ID], (err, slotResults) => {
          if (err) {
            console.error('Error fetching slots: ', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          const getDayNumber = (dayName) => {
            const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            return daysOfWeek.indexOf(dayName.toUpperCase()) + 1;
          };
          slotResults.forEach((slot) => {
            const dayOfWeek = getDayNumber(slot.DAY_OF_WEEK);
            if (dayOfWeek > 0) {
              slotsByDay[dayOfWeek - 1].push(slot.OP_START_TIME);
            }
          });
          // Combine all the information and send the response
          const response = {
            DOCTOR_NAME: doctorDetails.DOCTOR_NAME,
            CONTACT_NUMBER: doctorDetails.CONTACT_NUMBER,
            USERNAME: doctorDetails.USERNAME,
            SPECIALIZATIONS: specializations,
            SLOTS: slotsByDay,
          };
          res.json(response);
        });
      });
    });
  });
});


router.post('/add-slot/:doctor_ID', async (req, res) => {
  const { doctor_ID } = req.params;
  const { DAY_OF_WEEK, OP_START_TIME } = req.body;

  // Check if the slot already exists
  const checkSlotQuery = `
    SELECT * FROM SLOT
    WHERE DOCTOR_ID = ? AND DAY_OF_WEEK = ? AND OP_START_TIME = ?;
  `;

  db.query(checkSlotQuery, [doctor_ID, DAY_OF_WEEK, OP_START_TIME], async (err, rows) => {
    if (err) {
      console.error('Error checking slot: ', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (rows.length > 0) {
      // Slot already exists, update FLAG to 1
      const updateSlotQuery = `
        UPDATE SLOT
        SET FLAG = 1
        WHERE DOCTOR_ID = ? AND DAY_OF_WEEK = ? AND OP_START_TIME = ?;
      `;

      db.query(updateSlotQuery, [doctor_ID, DAY_OF_WEEK, OP_START_TIME], (err, result) => {
        if (err) {
          console.error('Error updating slot: ', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Slot activated');
        res.json({ message: 'Slot updated successfully' });
      });
    } else {
      // Slot does not exist, add a new slot
      const addSlotQuery = `
        INSERT INTO SLOT (DOCTOR_ID, DAY_OF_WEEK, OP_START_TIME)
        VALUES (?, ?, ?);
      `;

      db.query(addSlotQuery, [doctor_ID, DAY_OF_WEEK, OP_START_TIME], (err, result) => {
        if (err) {
          console.error('Error adding new slot: ', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('New slot added');
        res.json({ message: 'New slot added successfully' });
      });
    }
  });
});


router.delete('/delete-slot/:doctor_ID', (req, res) => {
  const { doctor_ID } = req.params;
  const { DAY_OF_WEEK, OP_START_TIME } = req.body;
  const deleteSlotQuery = `
    UPDATE SLOT SET FLAG = 0
    WHERE DOCTOR_ID = ? AND DAY_OF_WEEK = ? AND OP_START_TIME = ?;`;
  db.query(deleteSlotQuery, [doctor_ID, DAY_OF_WEEK, OP_START_TIME], (err, result) => {
    if (err) {
      console.error('Error deleting slot: ', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("SLOT DELETED");
    res.json({ message: 'Slot deleted successfully' });
  });
});



//To kick the doctor
router.post('/kickDoctor/:doctor_ID', async (req, res) => {
  const doctorId = req.params.doctor_ID;

  try {
    const updateQuery = 'UPDATE DOCTOR SET FLAG = 0 WHERE DOCTOR_ID = ?';
    db.query(updateQuery, [doctorId], (updateErr, updateResults) => {
      if (updateErr) {
        console.error('Error kicking doctor:', updateErr);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log('Doctor kicked successfully');
        res.status(200).json({ message: 'Doctor kicked successfully' });
      }
    });
  } catch (error) {
    console.error('Error kicking doctor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.get('/all-appointments', authenticate, (req, res) => {
  const  HOSPITAL_ID  = req.HOSPITAL_ID;
  const query = `
    SELECT A.APPOINTMENT_ID, A.TOKEN_NUMBER, A.DOC_SLOT_ID, A.DATE, A.APPOINTMENT_STATUS,
           P.PATIENT_NAME, P.CONTACT_NUMBER,
           D.DOCTOR_NAME, S.OP_START_TIME
    FROM APPOINTMENT A
    INNER JOIN PATIENT P ON A.PATIENT_ID = P.PATIENT_ID
    INNER JOIN SLOT S ON A.DOC_SLOT_ID = S.DOC_SLOT_ID
    INNER JOIN DOCTOR D ON S.DOCTOR_ID = D.DOCTOR_ID
    WHERE A.HOSPITAL_ID = ?;
  `;

  db.query(query, [HOSPITAL_ID], (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json( {appointments: results} );
      console.log(results);
    }
  });
});


//to book onspot appointment
router.post('/onspot-appointment', authenticate, async (req, res) => {
  try {
    const patient_name = req.body;
    const hospital_ID = req.HOSPITAL_ID;
    // Step 1: Store patient information in the patient_table
    const patientResult = await new Promise((resolve, reject) => {
      db.query('INSERT INTO patient_table (patient_name, flag) VALUES (?, ?)', [patient_name,"WEB"], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    }); 
    const patient_ID = patientResult.insertId;
    const doctor_ID = 2;

    // Get today's date
    const todayDate = new Date().toISOString().split('T')[0];

    // Check the last value in the token column for the given patient_ID and doctor_ID
    const [rows] = await db.promise().query(
      'SELECT TOKEN FROM day_appointment_table WHERE doctor_ID = ? ORDER BY TOKEN DESC LIMIT 1',
      [doctor_ID]
    );

    

    // Determine the next token value
    const nextToken = (rows.length > 0 ? rows[0].TOKEN : 0) + 1;

    if(nextToken == 1){
      await db.promise().query(
        'INSERT INTO day_appointment_table (doctor_ID, status, TOKEN, hospital_ID) VALUES (?, ?, ?, ?)',
        [doctor_ID, 'Yet_to_start', nextToken, hospital_ID]
      );
    } else{
      await db.promise().query(
        'UPDATE day_appointment_table SET TOKEN = ? WHERE doctor_ID = ? AND TOKEN = ?',
        [nextToken, doctor_ID, nextToken - 1]
      );
    } 

    // Insert data into the appointment_table
    await db.promise().query(
      'INSERT INTO appointment_table (doctor_ID, patient_ID, status, appointment_date, token, hospital_ID) VALUES (?, ?, ?, ?, ?, ?)',
      [doctor_ID, patient_ID, 'Yet_to_start', todayDate, nextToken, hospital_ID]
    );

    res.status(200).send('Data added successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}); 

// Logout route
router.post('/logout1', (req, res) => {
  res.clearCookie('jwtoken', {path: '/'});
  res.status(200).json({ message: 'Logout successful' });
  console.log("User Logged Out");
});

module.exports = router;