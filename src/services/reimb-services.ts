import { ReimbRepository } from "../repos/reimb-repo";
import { Reimbursments } from "../models/reimb";
import { ResourceNotFoundError, InvalidInputError, ResourceConflictError } from "../errors/errors";
import { isValidId, isEmptyObject, isPropertyOf, isValidString, isValidObject } from "../util/validators";

export class ReimbServices{

    constructor(private reimbRepo: ReimbRepository){

        this.reimbRepo = reimbRepo;

    }

    /**
     * Returns array of all Reimbursments in the database
     */

    async getAllReimbs(): Promise<Reimbursments[]>{

        let result = await this.reimbRepo.getAll();

        if(result.length === 0){
            throw new ResourceNotFoundError('No Reimbursments found in the database');
        }

        return result;

    }
    
    /**
     * Returns a Reimbursment given its unique ID
     * @param id {number} Unique ID of a Reimbursment
     */

    async getReimbById(id: number): Promise<Reimbursments>{

        if (!isValidId(id)){
            throw new InvalidInputError('Invalid ID was input.');
        }

        let result = await this.reimbRepo.getById(id);

        if (!isEmptyObject(result)){
            throw new ResourceNotFoundError('No reimbursment with that ID was found');
        }

        return result;

    }

    /**
     * Retrieves a Reimbursment given a key in the Reimbursment object, and its value
     * @param key {string} Key in the Reimbursment object
     * @param val {string} Value based on the given key
     */


    async getReimbByUniqueKey(queryObj: any): Promise<Reimbursments>{

        try{

            let queryKeys = Object.keys(queryObj);

            if(!queryKeys.every(key => isPropertyOf(key, Reimbursments))){
                throw new InvalidInputError('Key is not a property of a Reimbursments');
            }

            let key = queryKeys[0];
            let val = queryObj[key];

            if(key === 'id'){
                return await this.getReimbById(val);
            }

            if(!isValidString(val)){
                throw new InvalidInputError('Value is not a string');
            }

            let reimb = await this.reimbRepo.getByUniqueKey(key, val);

            if(!isEmptyObject(reimb)){
                throw new ResourceNotFoundError('No reimbursment found with given properties');
            }

            return reimb;

        } catch(e){
            throw e;
        }

    }

    /**
     * Returns an array of Reimbursments given an author ID
     * @param id Unique ID given to an author
     */

    async getReimbByAuthorId(jsonObj: object): Promise<Reimbursments[]>{

        let keys = Object.keys(jsonObj);
        let val = keys[0];

        let id = +jsonObj[val];

        if (!isValidId(id)){
            throw new InvalidInputError('Invalid ID was input.');
        }

        let result = await this.reimbRepo.getByAuthorId(id);

        if (result.length === 0){
            throw new ResourceNotFoundError('No reimbursments with that author ID was found');
        }

        return result;

    }

    /**
     * Adds a new Reimbursment to the database.
     * @param newUser {Reimbursment} Reimbursment Object
     */

    async addNewReimb(newReimbursment: Reimbursments): Promise<boolean>{

        try{

            if(!isValidObject(newReimbursment, 'id', 'submitted', 'resolved', 'resolverId', 'reimbStatusId')){
                throw new InvalidInputError('Invalid Reimbursment was input')
            }

            if(!isValidId(newReimbursment.authorId)){
                throw new InvalidInputError('Invalid author ID was input');
            }


            if(!isValidId(newReimbursment.reimbTypeId)){
                throw new InvalidInputError('Invalid type ID was input');
            }

            await this.reimbRepo.save(newReimbursment);

            return true;

        } catch(e){
            throw e;
        }

    }

    /**
     * Updates an existing reimbursment based on the values given in the user passed in.
     * @param updatedUser {Reimbursments} Reimbursment Object
     */

    async updateReimb(updatedReimb: Reimbursments): Promise<boolean>{

        try{

            if(!isValidObject(updatedReimb, 'id', 'submitted', 'resolved', 'resolverId') || !isValidId(updatedReimb.id)){
                throw new InvalidInputError('Invalid Reimbursment was input');
            }

            let reimbToUpdate = await this.getReimbById(updatedReimb.id);

            if(!isEmptyObject(reimbToUpdate)){
                throw new ResourceNotFoundError('No Reimb with that id');
            }

            if(updatedReimb.reimbStatusId !== 1){
                throw new ResourceConflictError('Cannot update a non-pending Reimbursment');
            }

            if(updatedReimb.authorId !== reimbToUpdate.authorId){
                throw new ResourceConflictError('Cannot update author ID');
            }

            if(updatedReimb.resolved){
                throw new ResourceConflictError('Cannot update resolved time');
            }

            if(updatedReimb.resolverId){
                throw new ResourceConflictError('Cannot update resolver');
            }

            await this.reimbRepo.update(updatedReimb);

            return true;

        } catch(e){
            throw e;
        }

    }

    /**
     * Resolves a reimbursment based on the changed reimbStatusId
     * @param updatedReimb {Reimbursment} Resolved Reimbursment
     */

    async resolveReimb(updatedReimb: Reimbursments): Promise<boolean>{

        try{

            if(!isValidObject(updatedReimb, 'id', 'resolved') || !isValidId(updatedReimb.id)){
                throw new InvalidInputError('Invalid Reimbursment was input');
            }

            let reimbToUpdate = await this.getReimbById(updatedReimb.id);

            if(!isEmptyObject(reimbToUpdate)){
                throw new ResourceNotFoundError('Could not find reimb to resolve');
            }

            await this.reimbRepo.resolveReimb(updatedReimb);

            return true;

        } catch(e){
            throw e;
        }

    }

}