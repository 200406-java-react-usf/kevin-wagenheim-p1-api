import express from 'express';
import appConfig from '../config/app-config';
import {Principal} from '../dtos/principal';

export const AuthRouter = express.Router();

const userService = appConfig.userService;

AuthRouter.get('', (req, resp) => {

    delete req.session.principal;
    resp.status(204).send();

});

AuthRouter.post('',  async (req, resp) => {

    try{
        const {username, password} = req.body;
        let authUser = await userService.authenticate(username, password);
        let payload = new Principal(authUser.id, authUser.username, authUser.roleId);
        req.session.principal = payload;
        resp.status(200).json(payload);
    } catch(e){
        resp.status(e.statusCode || 500).json(e);
    }

});