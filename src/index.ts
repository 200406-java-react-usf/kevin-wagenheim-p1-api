import express from 'express';

let app = express();

app.use('/', express.json());

app.get('/', (req,resp) => {

    resp.send('THIS WORKS');

});

app.listen(8080);