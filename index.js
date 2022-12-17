require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database');
const e = require('express');

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
app.get('/', (req, res) => res.send('Try: 122344555/class, /class/1, or /section, /section/1, or /section/result/1'));

app.get('/status', (req, res) => res.send('Success.'));

app.get('/class', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  connection.query(
    "SELECT * FROM class",
    (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    }
  );
 
});
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
      "SELECT f.*,c.*,cs.limit FROM `form` f, class_section cs , class c WHERE f.class_section_id = cs.id and cs.class_id = c.id and  f.class_section_id = ?", req.params.id,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });


  app.route('/section/result/:id')
  .post((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    connection.query(
      "SELECT * FROM `form` WHERE class_section_id = ?", req.params.id,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

//   app.get('/create', function(req, res){
//     res.render('create', {
//         title: '建立新的使用者'
//     });
// });
app.post('/create', function(req, res){
        if(req.body == null){
          var _class_section_id =   1;
          var _name= "Chan Tai Man";
          var _phone=  "12345678";
          var _email= "test@abc.com";
        }else{
          var _class_section_id =  req.body.class_section_id;
          var _name= req.body.name ;
          var _phone= req.body.phone;
          var _email= req.body.email;
        }
        
        connection.query('insert into form set ?', {
            class_section_id: _class_section_id,
            name: _name,
            phone: _phone,
            email: _email
        }, function(err, fields){
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