import express from 'express';
import {UserRepository} from '../repos/user-repo';
import appConfig from '../config/app-config';
import { adminGaurd } from '../middleware/admin-middleware';

export const UserRouter = express.Router();

let userService = appConfig.userService;

UserRouter.get('', adminGaurd, async (req, resp) => {

    try{
        let pl = await userService.getAllUsers();
        resp.status(200).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

});

UserRouter.get('/id/:id',adminGaurd , async (req, resp) => {

    let id = +req.params.id;

    try{
        let pl = await userService.getUserById(id);
        resp.status(200).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

});

UserRouter.post('', adminGaurd, async (req, resp) => {

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