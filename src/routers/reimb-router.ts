import express from 'express';
import appConfig from '../config/app-config';
import { financialManagerGaurd } from '../middleware/financial-manager-middleware';

export const ReimbRouter = express.Router();

const reimbService = appConfig.reimbService;

ReimbRouter.get('', financialManagerGaurd, async (req, resp) =>{

    try{
        let pl = await reimbService.getAllReimbs();
        resp.status(200).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

});

ReimbRouter.get('/id/:id', financialManagerGaurd, async (req, resp) => {

    let id = +req.params.id;

    try{
        let pl = await reimbService.getReimbById(id);
        resp.status(200).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

})

ReimbRouter.post('', async (req, resp) => {

    try{
        let pl = await reimbService.addNewReimb(req.body);
        resp.status(201).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

});

ReimbRouter.put('', async (req, resp) => {

    try{
        let pl = await reimbService.updateReimb(req.body);
        resp.status(204).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

});

ReimbRouter.put('/resolve', financialManagerGaurd, async (req, resp) => {

    try{
        let pl = await reimbService.resolveReimb(req.body);
        resp.status(204).json(pl);
    } catch(e){
        resp.status(e.statusCode).json(e);
    }

});