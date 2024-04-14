const express = require('express')
const webpush = require('web-push')
const path = require('path')
const app = express();

app.use(express.static(path.join(__dirname,"client")));
app.use(express.json())


const publicVapidKey = 'BHQO-kq0tkpv7iBJ7d3dRG4IZCyT3XWwvvA0HkM44ycntL2FLwuSJWwqftZQ1RLlM5AM7eJ-sNkkP5NfFOlTQdk';
const privateVapidKey = 'ULd0IqE1Zn5jP6iVVCYx2lg0LKBm9htvlN3Hb7RLs1g';

webpush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);


// Subscribe routes 
app.post('/subscribe', (req, res) => {
    const subscription = req.body;


    //send 201 - resource created 
    res.status(201).json({});

    //create playLoad
    const playload = JSON.stringify({ title :'Lets code' });
    
    // pass the object into sendNotification
    webpush.sendNotification(subscription,playload).catch(err => console.error(err));
});


const port = 5000;
app.listen(port , () => console.log (`http://localhost:${port}`));



