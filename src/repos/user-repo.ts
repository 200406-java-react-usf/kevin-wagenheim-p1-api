import {User} from '../models/user.js';
import { PoolClient } from 'pg';
import { connectionPool } from '../index.js';
import { InternalServerError } from '../errors/errors.js';

export class UserRepository {

    async getAll(): Promise<User[]> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from app_users';
            let rs = await client.query(sql);
            return rs.rows;
        } catch(e){
            throw new InternalServerError();
        } finally{
            client && client.release();
        }

    }

    async getById(id: number): Promise<User>{

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from app_users where user_id = $1'
            let rs = await client.query(sql, [id]);
            return rs.rows[0];
        } catch (e){
            throw new InternalServerError();
        } finally{
            client && client.release();
        }

    }

    async getByUniqueKey(key: string, val: string): Promise<User> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = `select * from app_users where ${key} = $1`;
            let rs =  await client.query(sql, [val]);
            return rs.rows[0]; 
        } catch(e){
            throw new InternalServerError();
        } finally{
            client && client.release();
        }

    }

}