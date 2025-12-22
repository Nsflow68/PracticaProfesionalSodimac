'use strict';
let net = require('net');
let https = require('https');
let fs = require('fs');

export const createServer = (handler: any) => {

    let server = net.createServer((socket:any) => {
        socket.once('data', (buffer:any) => {
            
            socket.pause();

            
            let byte = buffer[0];

            let protocol: any;
            if (byte === 22) {
                protocol = 'https';
            } else if (32 < byte && byte < 127) {
                protocol = 'http';
            }

            let proxy = server[protocol];
            if (proxy) {
                
                socket.unshift(buffer);

                
                proxy.emit('connection', socket);
            }

            
            
            
            
            
            process.nextTick(() => socket.resume());
        });
    });

    const options = {
        key: fs.readFileSync("/var/node/ssl/certificados/private_key.key"),
        cert: fs.readFileSync("/var/node/ssl/certificados/domain_dda_sodimac_cl.crt"),
        ca: [
            fs.readFileSync("/var/node/ssl/certificados/bundle.crt"),
            fs.readFileSync("/var/node/ssl/certificados/DigiCertCA.crt")
        ]
    }

    
    server.https = https.createServer(options, handler);
    return server;
};
