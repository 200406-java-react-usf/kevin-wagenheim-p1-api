import {Request, Response} from 'express';

export function corsFilter(req: Request, resp: Response, next){

    resp.header('Access-Control-Allow-Origin', '*'); 
    resp.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    resp.header('Access-Control-Allow-Credentials', 'true');
    resp.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

    if(req.method === 'OPTIONS'){
        resp.status(200);
    } else{
        next();
    }

}