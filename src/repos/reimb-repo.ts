import {Reimbursments} from '../models/reimb';
import { PoolClient } from 'pg';
import { connectionPool } from '../index';
import { InternalServerError } from '../errors/errors';
import { mapReimbResultSet } from '../util/result-set-mapper';

export class ReimbRepository {

    /**
     * Returns array of all Reimbursments in the database
     */

    async getAll(): Promise<Reimbursments[]> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from reimbursements';
            let rs = await client.query(sql);
            return rs.rows.map(mapReimbResultSet);
        } catch(e){
            throw new InternalServerError('Server error happened when trying to get all reimbursements');
        } finally{
            client && client.release();
        }

    }

    /**
     * Returns a Reimbursment given its unique ID
     * @param id {number} Unique ID of a Reimbursment
     */

    async getById(id: number): Promise<Reimbursments>{

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from reimbursements where reimb_id = $1';
            let rs = await client.query(sql, [id]);
            return mapReimbResultSet(rs.rows[0]);
        } catch (e){
            throw new InternalServerError('Server error happened when trying to get reimbursement by ID');
        } finally{
            client && client.release();
        }

    }

    /**
     * Retrieves a Reimbursment given a key in the Reimbursment object, and its value
     * @param key {string} Key in the Reimbursment object
     * @param val {string} Value based on the given key
     */

    async getByUniqueKey(key: string, val: string): Promise<Reimbursments> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = `select * from reimbursements where ${key} = $1`;
            let rs =  await client.query(sql, [val]);
            return mapReimbResultSet(rs.rows[0]); 
        } catch(e){
            throw new InternalServerError('Server error happened when trying to get reimbursements by unique key');
        } finally{
            client && client.release();
        }

    }

    /**
     * Returns an array of Reimbursments given an author ID
     * @param id Unique ID given to an author
     */

    async getByAuthorId(id: number): Promise<Reimbursments[]> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from reimbursements where author_id = $1'
            let rs = await client.query(sql, [id]);
            return rs.rows.map(mapReimbResultSet);
        } catch (e){
            throw new InternalServerError('Server error when trying to get reimbursment by author ID');
        } finally {
            client && client.release();
        }

    }

    /**
     * Adds a new Reimbursment to the database.
     * @param newUser {Reimbursment} Reimbursment Object
     */

    async save(newReimbursment: Reimbursments): Promise<Boolean>{

        let client:PoolClient;

        let timeSubmitted = new Date();
        
        try{
            client = await connectionPool.connect();
            let sql = `
                insert into reimbursements (amount, submitted, resolved, description, author_id, resolver_id, reimb_status_id, reimb_type_id)
                values
                    ($1,$2,$3,$4,$5,$6,$7,$8)
            `;
            await client.query(sql, [
                newReimbursment.amount,
                timeSubmitted,
                null,
                newReimbursment.description,
                newReimbursment.authorId,
                null,
                1,
                newReimbursment.reimbTypeId
            ]);
            return true;
        } catch(e){
            throw new InternalServerError('Server error happened when trying to add new reimbursement');
        } finally{
            client && client.release();
        }

    }

    /**
     * Updates an existing reimbursment based on the values given in the user passed in.
     * @param updatedUser {Reimbursments} Reimbursment Object
     */

    async update(updatedReimbursment: Reimbursments): Promise<boolean>{

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = `
                update reimbursements
                    set
                        amount = $2,
                        description = $3,
                        reimb_type_id = $4
                    where reimb_id = $1
            `;
            await client.query(sql, [updatedReimbursment.id, updatedReimbursment.amount, updatedReimbursment.description, updatedReimbursment.reimbTypeId]);
            return true;
        } catch(e){
            console.log(e);
            throw new InternalServerError('Server error happened when trying to update a reimbursement');
        } finally{
            client && client.release();
        }

    }

    /**
     * Resolves a reimbursment based on the changed reimbStatusId
     * @param updatedReimb {Reimbursment} Resolved Reimbursment
     */

    async resolveReimb(updatedReimb: Reimbursments): Promise<boolean>{

        let client: PoolClient;

        let resolvedTime = new Date();

        try{
            client = await connectionPool.connect();
            let sql = `
                update reimbursements
                set
                    resolved = $2,
                    resolver_id = $3,
                    reimb_status_id = $4
                where reimb_id = $1
            `;
            await client.query(sql, [updatedReimb.id, resolvedTime, updatedReimb.resolverId, updatedReimb.reimbStatusId]);
            return true;
        } catch(e){
            throw new InternalServerError('Server error happened when resolving a reimb');
        }

    }

}