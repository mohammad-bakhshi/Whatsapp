const express = require('express');
const bodyParser = require("body-parser");
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { join } = require('path');
const logger = require('morgan');
const client = new Client();


client.on('qr', (qr) => {
    console.log('QR RECEIVED');
    fs.writeFile(join(__dirname, './last_qr'), qr, (err) => {
        if (err) {
            console.log(err);
        }
    })
});

client.on("authenticated", () => {
    console.log("AUTH!");
    fs.unlink(join(__dirname, './last_qr'), (err) => {
        if (err) {
            console.log(err);
        }
    })
});

client.on("auth_failure", () => {
    console.log("AUTH Failed !");
    process.exit();
});

client.on('ready', async () => {
    console.log('Client is ready!');
});

client.on("disconnected", () => {
    console.log("disconnected");
});


client.initialize();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger('dev'));



app.get('/getqr', (req, res) => {
    client
        .getState()
        .then((data) => {
            if (data) {
                res.write("<html><body><h2>Already Authenticated</h2></body></html>");
                res.end();
            } else sendQr(res);
        })
        .catch(() => sendQr(res));
})

app.post('/send', async (req, res) => {
    try {
        const phoneNumber = req.body.phone;
        const message = req.body.message;
        const result = await client.sendMessage(phoneNumber + '@c.us', message);
        if (result) {
            res.send('Message send successfully.')
        }
        else {
            res.send('error');
        }
    } catch (error) {
        console.log(error);
    }
})


app.listen(3000, () => console.log('Server is running on port 3000...'));


function sendQr(res) {
    fs.readFile(join(__dirname, './last_qr'), (err, last_qr) => {
        if (!err && last_qr) {
            var page = `
                      <html>
                          <body>
                              <script type="module">
                              </script>
                              <div id="qrcode"></div>
                              <script type="module">
                                  import QrCreator from "https://cdn.jsdelivr.net/npm/qr-creator/dist/qr-creator.es6.min.js";
                                  let container = document.getElementById("qrcode");
                                  QrCreator.render({
                                      text: "${last_qr}",
                                      radius: 0.5, // 0.0 to 0.5
                                      ecLevel: "H", // L, M, Q, H
                                      fill: "#536DFE", // foreground color
                                      background: null, // color or null for transparent
                                      size: 256, // in pixels
                                  }, container);
                              </script>
                          </body>
                      </html>
                  `;
            res.write(page);
            res.end();
        }
        else if (err) {
            console.log(err);
        }
    });
}



