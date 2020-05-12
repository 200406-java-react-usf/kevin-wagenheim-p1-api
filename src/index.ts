import express from 'express';
import dotenv from 'dotenv';
import {Pool} from 'pg';
import {UserRouter} from './routers/user-router';

dotenv.config();

export const connectionPool: Pool =  new Pool({

    host: process.env['DB_HOST'],
    port: +process.env['DB_PORT'],
    database: process.env['DB_NAME'],
    user: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    max: 5

});

let app = express();
app.use('/', express.json());

app.use('/users', UserRouter);

app.get('/', (req,resp) => {

    resp.send('THIS WORKS');

});

app.listen(8080, () => {

    console.log('App running on port 8080');

});