import express from 'express';
import appConfig from '../config/app-config';

export const ReimbRouter = express.Router();

const reimbService = appConfig.reimbService;

ReimbRouter.get('', async (req, resp) =>{

    try{
        let pl = await reimbService.getAllReimbs();
        resp.status(200).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

});