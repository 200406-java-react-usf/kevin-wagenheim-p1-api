import {Request, Response} from 'express';
import {AuthenticationError, AuthorizationError} from '../errors/errors';

export const adminGaurd = (req: Request, resp: Response, next) => {

    if(!req.session.principal) {
        resp.status(401).json(new AuthenticationError('No session found, please login'));
    } else if(req.session.principal.roleId === 1){
        next();
    } else{
        resp.status(403).json(new AuthorizationError());
    }

}

