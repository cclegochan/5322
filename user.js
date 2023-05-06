const connection = require("./database");

 function deposit(amount,userId){
    try {
        connection.query("INSERT INTO crypto_exchange.user_wallet (user_id,fiat_amount) VALUES (?,?) ON DUPLICATE KEY UPDATE fiat_amount = fiat_amount + ? ",
            [Number(userId),Number(amount),Number(amount)]
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
        return "OK";
    }catch(e){
        return "Failed";
    }


}
module.exports = deposit;