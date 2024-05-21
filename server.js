const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const path = require('path');

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'task_management',
    charset: 'utf8mb4'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

// Route to get the server port
app.get('/api/config', (req, res) => {
    res.json({ port });
});

// Middleware funkcija za verifikaciju tokena
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, 'secretkey', function(err, decoded) {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

        // ako je token validan, sačuvaj korisnički id u request za upotrebu u drugim rutama
        req.userId = decoded.id;
        next();
    });
}

// Ruta za prijavu
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).send('Error on the server.');
        }

        if (results.length === 0) {
            return res.status(404).send('No user found.');
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Error on the server.');
            }

            if (!isMatch) {
                return res.status(401).send('Invalid password.');
            }

            const token = jwt.sign({ id: user.id }, 'secretkey', {
                expiresIn: 86400 // 24 hours
            });

            res.status(200).send({
                auth: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        });
    });
});

// Dodajte ostale rute sa verifyToken middleware

// Routes for authentication
app.post('/register', [
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    check('email').isEmail().withMessage('Email must be valid'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = 'INSERT INTO users (username, email, password, role, active) VALUES (?, ?, ?, "user", 1)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).send('Error registering user');
        }
        const token = jwt.sign({ id: result.insertId }, 'secretkey', { expiresIn: '1h' });
        res.json({ auth: true, token });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error on the server');
        }
        if (results.length === 0) {
            return res.status(404).send('No user found');
        }
        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send('Invalid password');
        }
        const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
        res.json({ auth: true, token, user: user.username });
    });
});

// Routes for tasks
app.get('/tasks', verifyToken, (req, res) => {
    const sql = `
        SELECT tasks.*, users.username AS creator, task_types.name AS task_type_name, clients.name AS client_name
        FROM tasks 
        JOIN users ON tasks.user_id = users.id
        LEFT JOIN task_types ON tasks.task_type_id = task_types.id
        LEFT JOIN clients ON tasks.client_id = clients.id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).send('Error fetching tasks');
        }
        res.json(results);
    });
});

app.get('/tasks/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).send('Error fetching task');
        }
        if (result.length === 0) {
            return res.status(404).send('Task not found');
        }
        res.json(result[0]);
    });
});

app.post('/tasks', verifyToken, (req, res) => {
    const newTask = { ...req.body, user_id: req.userId };
    console.log('New task data:', newTask); // Log za proveru podataka zadatka
    const sql = 'INSERT INTO tasks SET ?';
    db.query(sql, newTask, (err, result) => {
        if (err) {
            console.error('Error inserting task:', err);
            return res.status(500).send('Error inserting task');
        }
        res.json({ id: result.insertId, ...newTask });
    });
});

app.put('/tasks/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const updatedTask = req.body;
    const sql = 'UPDATE tasks SET ? WHERE id = ?';
    db.query(sql, [updatedTask, id], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).send('Error updating task');
        }
        res.json(result);
    });
});

app.put('/tasks/:id/complete', verifyToken, (req, res) => {
    const { id } = req.params;
    const { completion_time } = req.body;
    const sql = 'UPDATE tasks SET completion_time = ? WHERE id = ?';
    db.query(sql, [completion_time, id], (err, result) => {
        if (err) {
            console.error('Error completing task:', err);
            return res.status(500).send('Error completing task');
        }
        res.json(result);
    });
});

app.delete('/tasks/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const sqlSelect = 'SELECT status FROM tasks WHERE id = ?';
    db.query(sqlSelect, [id], (err, results) => {
        if (err) {
            console.error('Error fetching task status:', err);
            return res.status(500).send('Error fetching task status');
        }
        if (results.length === 0) {
            return res.status(404).send('Task not found');
        }
        const task = results[0];
        if (task.status !== 'Pending') {
            return res.status(400).send('Only tasks with status "Pending" can be deleted');
        }

        const sqlDelete = 'DELETE FROM tasks WHERE id = ?';
        db.query(sqlDelete, [id], (err, result) => {
            if (err) {
                console.error('Error deleting task:', err);
                return res.status(500).send('Error deleting task');
            }
            res.json(result);
        });
    });
});

// Routes for clients
app.get('/clients', verifyToken, (req, res) => {
    const sql = 'SELECT * FROM clients';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching clients:', err);
            return res.status(500).send('Error fetching clients');
        }
        res.json(results);
    });
});

app.post('/clients', verifyToken, (req, res) => {
    const newClient = { ...req.body, user_id: req.userId };
    const sql = 'INSERT INTO clients SET ?';
    db.query(sql, newClient, (err, result) => {
        if (err) {
            console.error('Error inserting client:', err);
            return res.status(500).send('Error inserting client');
        }
        res.json({ id: result.insertId, ...newClient });
    });
});

// Serve the main index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
