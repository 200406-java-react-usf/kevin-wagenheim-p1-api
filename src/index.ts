import express from 'express';
import dotenv from 'dotenv';
import {Pool} from 'pg';
import {UserRouter} from './routers/user-router';
import {corsFilter} from './middleware/cors-filter';
import { ReimbRouter } from './routers/reimb-router';
import { AuthRouter } from './routers/auth-router';
import { sessionMiddleware } from './middleware/session-middleware';

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
app.use(corsFilter)
app.use('/', express.json());
app.use(sessionMiddleware);
app.use('/auth', AuthRouter);
app.use('/users', UserRouter);
app.use('/reimbursments', ReimbRouter);

app.get('/', (req,resp) => {

    resp.send('THIS WORKS');

});

app.listen(8080, () => {

    console.log('App running on port 8080');

});