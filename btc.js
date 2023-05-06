const {ECPairFactory, ECPairAPI, TinySecp256k1Interface } =require('ecpair');
const tinysecp = require('tiny-secp256k1');

const https = require("https");
// You need to provide the ECC library. The ECC library must implement
// all the methods of the `TinySecp256k1Interface` interface.
const ECPair = ECPairFactory(tinysecp);

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
module.exports = getBtcAddress;
