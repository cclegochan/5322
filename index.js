require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database');

app.get('/', (req, res) => res.send('Try: /class, /class/1, or /section, /section/1, or /section/result/1'));

app.get('/status', (req, res) => res.send('Success.'));

app.get('/class', (req, res) => {
  connection.query(
    "SELECT * FROM `class`",
    (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    }
  );
});
app.route('/class/:id')
  .get((req, res, next) => {
    connection.query(
      "SELECT * FROM `class` WHERE id = ?", req.params.id,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });


app.get('/class_section', (req, res) => {
  connection.query(
    "SELECT c.*,cs.id as 'section_id',cs.date,cs.limit FROM `class_section` cs,`class` c where cs.class_id = c.id",
    (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    }
  );
});

app.route('/class_section/:id')
  .get((req, res, next) => {
    connection.query(
      "SELECT * FROM `class_section` WHERE id = ?", req.params.id,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

app.route('/section/result/:id')
  .get((req, res, next) => {
    connection.query(
      "SELECT * FROM `form` WHERE class_section_id = ?", req.params.id,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
//const port = 80;

app.listen(port, () => {
  console.log(`App is running at: http://localhost:${port}`);
});