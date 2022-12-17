require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database');
const e = require('express');


// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/', (req, res) => res.send('Success.'));
app.route('/class/:id')
  .get((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    connection.query(
      "SELECT * FROM `class` WHERE id = ?", req.params.id,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
});


app.get('/class_section', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

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
    res.setHeader('Access-Control-Allow-Origin', '*');

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
      "SELECT f.*,c.*,cs.limit,f.id as 'form_id' FROM `form` f, class_section cs , class c WHERE f.class_section_id = cs.id and cs.class_id = c.id and  f.class_section_id = ?", req.params.id,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });


app.post('/create', jsonParser, function (req, res, next) {
  console.log("enter create");
  console.log(req.params);
  console.log(req.body);

  var _class_section_id = req.body.class_section_id;
  var _name = req.body.name;
  var _phone = req.body.phone;
  var _email = req.body.email;

  connection.query('insert into form set ?', {
    class_section_id: _class_section_id,
    name: _name,
    phone: _phone,
    email: _email
  }, function (err, fields) {
    if (err)
      throw err;
  });

  res.json("OK");

});
app.post('/deleteEnrolment', jsonParser, function (req, res, next) {
  console.log("enter delete");
  console.log(req.params);
  console.log(req.body);

  var _form_id = req.body.form_id;


  connection.query('delete from form where id = ' + _form_id
  , function (err, fields) {
    if (err)
      throw err;
  });

  res.json("OK");

});


// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
//const port = 80;

app.listen(port, () => {
  console.log(`App is running at: http://localhost:${port}`);
});