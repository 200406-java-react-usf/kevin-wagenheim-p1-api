import {User} from '../models/user.js';
import { PoolClient } from 'pg';
import { connectionPool } from '../index.js';

export class UserRepository {

    async getAll(): Promise<User[]> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from app_users';
            let rs = await client.query(sql);
            return rs.rows;
        } catch(e){
            throw new Error();
        } finally{
            client && client.release();
        }

    }

}