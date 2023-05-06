const {ECPairFactory, ECPairAPI, TinySecp256k1Interface } =require('ecpair');
const tinysecp = require('tiny-secp256k1');

const https = require("https");
// You need to provide the ECC library. The ECC library must implement
// all the methods of the `TinySecp256k1Interface` interface.
const ECPair = ECPairFactory(tinysecp);

const pin = 'EGy27HU_z8BKjQgUKb_Ot78jb3k54aRb3UI80Ebuxu42UGt1Gt7j3EhMXNnV8wBctbCQicLwMJIFW-ef';
const BlockIo = require('block_io');
const {createWallet} = require("./user");
const block_io_btc_testnet = new BlockIo('99d3-3690-863c-da92',pin);
const block_io_doge_testnet = new BlockIo('bfb7-bef7-80b0-5a8e',pin);

 function getBtcAddress() {
    try {

        var bitcoin = require('bitcoinjs-lib')
        const keyPair = ECPair.makeRandom();
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        console.log("Addr: "+ address);
        console.log("PK: "+ keyPair.toWIF());


        // bitcoin P2PKH addresses start with a '1'
        //assert.strictEqual(address!.startsWith('1'), true);

        let result =null;
        https.get('https://blockchain.info/rawaddr/' + address, (resp) => {

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                result += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                console.log(result);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });

        // random private keys [probably!] have no transactions
        //assert.strictEqual((result as any).n_tx, 0);
        //assert.strictEqual((result as any).total_received, 0);
        //assert.strictEqual((result as any).total_sent, 0);

        return {"btcAddr": address, "btcPk": keyPair.toWIF()};

    } catch (e) {
        throw e;
        //return "Failed";
    }


}

async function getNewAddrs(userId) {
    let btcData;
    let dogeData;

    /*data = await block_io_btc_testnet.get_balance();
    console.log(JSON.stringify(data, null, 2));
*/
    // create a new address
    try {
        btcData = await block_io_btc_testnet.get_new_address({label:  Math.random()+'_user_'+ userId});
        console.log(JSON.stringify(btcData, null, 2));
        dogeData= await block_io_doge_testnet.get_new_address({label:  Math.random()+'_user_'+ userId});
        console.log(JSON.stringify(dogeData, null, 2));
        //console.log(btcData);
        //console.log(dogeData.address);
        var result = createWallet(userId,btcData.data.address,dogeData.data.address);
        console.log(result);
    } catch (err) {
        var result = createWallet(userId,"2MsbHviSNUD7jXL1nZHuSRU5QN6Rp3Sq2gu","2NDAzkVutMTDmRYPx2y3Kp8p16wUbsusVfK");
        console.log(err);
    }
}
async function getBalance(userId,btcAddr,dogeAddr) {
    let btcData;
    let dogeData;

    try {
        btcData = await block_io_btc_testnet.get_address_balance({address:btcAddr});
        dogeData = await block_io_doge_testnet.get_address_balance({address:dogeAddr});
        /*data.forEach(element => {
            if(element.)
        });  */
        console.log(JSON.stringify(btcData, null, 2));

        console.log(JSON.stringify(dogeData, null, 2));

        return {"btcBalance": btcData.data.available_balance , "dogeBalance": dogeData.data.available_balance}
    } catch (err) {
        console.log(err);
    }
}
async function transaction(type, pin, amount, fromAddr,toAddr) {
    let btcData;
    let dogeData;

    try {
        if(type==="BTC_USD") {
            let prepareResponse = btcData.prepare_transaction({
                amounts: amount,
                from_addresses: fromAddr,
                to_addresses: toAddr
            });
            let createResponse = btcData.create_and_sign_transaction({data: prepareResponse, pin: pin});
            let txResponse = btcData.submit_transaction({transaction_data: createResponse});
        }
        else if(type==="DOGE_USD"){
            let prepareResponse = dogeData.prepare_transaction({
                amounts: amount,
                from_addresses: fromAddr,
                to_addresses: toAddr
            });
            let createResponse = dogeData.create_and_sign_transaction({data: prepareResponse, pin: pin});
            let txResponse = dogeData.submit_transaction({transaction_data: createResponse});
        }



        return {"btcBalance": btcData.data.available_balance , "dogeBalance": dogeData.data.available_balance}
    } catch (err) {
        console.log(err);
    }
}
module.exports = {getNewAddrs, getBalance};
