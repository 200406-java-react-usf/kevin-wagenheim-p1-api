import express from 'express';
import {UserRepository} from '../repos/user-repo';

export const UserRouter = express.Router();

let userRepo = new UserRepository;

UserRouter.get('', async (req, resp) => {

    try{
        let pl = await userRepo.getAll();
        resp.status(200).json(pl);
    } catch(e){
        resp.status(200).json(e);
    }

});