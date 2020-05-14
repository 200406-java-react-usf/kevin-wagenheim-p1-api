import express from 'express';
import {UserRepository} from '../repos/user-repo';
import appConfig from '../config/app-config';

export const UserRouter = express.Router();

let userService = appConfig.userService;

UserRouter.get('', async (req, resp) => {

    try{
        let pl = await userService.getAllUsers();
        resp.status(200).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

});

UserRouter.get('/id/:id', async (req, resp) => {

    let id = +req.params.id;

    try{
        let pl = await userService.getUserById(id);
        resp.status(200).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

});

UserRouter.post('', async (req, resp) => {

    try{
        let pl = await userService.addNewUser(req.body);
        resp.status(201).json(pl);
    } catch (e){
        resp.status(e.statusCode).json(e);
    }

});

UserRouter.put('', async (req, resp) => {

    try{
        let pl = await userService.updateUser(req.body);
        resp.status(204).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

})