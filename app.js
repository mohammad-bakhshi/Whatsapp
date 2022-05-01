const express = require('express');
const bodyParser = require("body-parser");
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const client = new Client();


client.on('qr', (qr) => {
    console.log('QR RECEIVED');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');
});


client.initialize();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.post('/:phone', async (req, res) => {
    const phoneNumber = req.params.phone;
    const message = req.body.message;
    const result = await client.sendMessage(phoneNumber + '@c.us', message);
    if (result) {
        res.send('Message send successfully.')
    }
    else {
        res.send('error');
    }
})


app.listen(3000, () => console.log('Server is running on port 3000...'));



