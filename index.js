require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database');
const e = require('express');

const userJs = require('./user');
const getBtcAddress = require("./btc");
const getAddrs = require("./btc");
const {getNewAddrs, getBalance} = require("./btc");


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

/**** User Section ***/
app.post('/login', jsonParser, function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');

        var _login_name = req.body.loginname;
        var _password = req.body.password;

        connection.query(
            "SELECT id,name FROM `user` WHERE login_name = ? and login_password = ?",
                [_login_name,_password],
            (error, results, fields) => {
                if (error) throw error;

                res.json(results);
            }
        );
    });
app.route('/user/:id')
    .get((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');

        connection.query(
            "SELECT * FROM `user` WHERE id = ?", req.params.id,
            (error, results, fields) => {
                if (error) throw error;


                //console.log(addrs);
                res.json(results);
            }
        );

    });
app.route('/user_wallet/:id')
    .get((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');

        connection.query(
            "SELECT * FROM `user_wallet` WHERE user_id = ?", req.params.id,
            async (error, results, fields) => {
                if (error) throw error;

                let tmp = await getBalance(req.params.id, results[0].bitcoin_addr, results[0].dogecoin_addr);
                results[0] = Object.assign(results[0], tmp);
                console.log(results);
                res.json(results);
            }
        );
    });
app.post('/create_user', jsonParser, function (req, res, next) {
    console.log("enter create_user");
    console.log(req.params);
    console.log(req.body);

    var _name = req.body.name;
    var _hkid = req.body.hkid;
    var _addr = req.body.addr;
    var _login_name = req.body.loginname;
    var _password = req.body.password;


    connection.query("insert into crypto_exchange.user set ?",
        {
            name: _name,
            addr: _addr,
            hkid: _hkid,
            login_name: _login_name,
            login_password: _password
        }
        , function (err, fields) {
            if (err)
                throw err;
        });
    connection.query(
        "SELECT id FROM `user` WHERE login_name = ? and login_password = ?",
        [_login_name,_password],
        (error, results, fields) => {
            if (error) throw error;
            var addrs = getNewAddrs(results[0].id);
            //res.json(results);
        }
    );


    res.json("OK");

});

app.post('/deposit', jsonParser, function (req, res, next) {
    console.log("enter deposit");
    console.log(req.params);
    console.log(req.body);

    var amount = req.body.amount;
    var userId = req.body.userId;


    var result = userJs.deposit(amount,userId);

    res.json(result);

});



/**** End User Section ***/


/**** Order Section ***/
app.get('/order', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    //var btcAddr = getBtcAddress();

    connection.query(
        "SELECT *  FROM `order_book` order by  created_at desc ",
        (error, results, fields) => {
            if (error) throw error;
            res.json(results);
        }
    );
});

app.get('/order/:id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    //var btcAddr = getBtcAddress();

    connection.query(
        "SELECT *  FROM `order_book` where id = ?",req.params.id,
        (error, results, fields) => {
            if (error) throw error;
            res.json(results);
        }
    );
});

app.post('/order/create', jsonParser, function (req, res, next) {
    console.log("enter order/create");
    console.log(req.params);
    console.log(req.body);


    var crypto_type = req.body.crypto_type;
    var category = req.body.category;
    var volume = req.body.volume;
    var price = req.body.price;
    var from = req.body.from;


    connection.query("insert into crypto_exchange.order_book set ?",
        {
            crypto_type: crypto_type,
            category: category,
            volume: volume,
            price: price,
            from: from
        }
        , function (err, fields) {
            if (err)
                throw err;
        });
    /*   connection.query('SELECT * FROM `user` WHERE login_name = ? and login_password = ?', _login_name, _password
           (error, results, fields) => {
               if (error) throw error;
               res.json(results);
           }
       );*/

    res.json("OK");

});

app.post('/order/action', jsonParser, function (req, res, next) {
    console.log("enter order/action");
    console.log(req.params);
    console.log(req.body);

    var crypto_type = req.body.crypto_type;
    var orderId = req.body.orderId;
    var category = req.body.category;
    var volume = req.body.volume;
    var tx_fee =  req.body.tx_fee;
    var price = req.body.price;
    var tx_id = "";
    var to = req.body.to;
    var from = req.body.from;


    connection.query("insert into crypto_exchange.trade set ? ",
        {
            crypto_type: crypto_type,
            category: category,
            volume: volume,
            price: price,
            from: from,
            to: to,
            tx_id:tx_id,
            tx_fee: tx_fee
        }
        , function (err, fields) {
            if (err)
                throw err;
        });
    /*   connection.query('SELECT * FROM `user` WHERE login_name = ? and login_password = ?', _login_name, _password
           (error, results, fields) => {
               if (error) throw error;
               res.json(results);
           }
       );*/

    res.json("OK");

});
app.get('/trade', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    //var btcAddr = getBtcAddress();

    connection.query(
        "SELECT *  FROM `trade` order by  created_at desc ",
        (error, results, fields) => {
            if (error) throw error;
            res.json(results);
        }
    );
});


/**** End Order Section ***/



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