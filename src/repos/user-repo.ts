import {User} from '../models/user.js';
import { PoolClient } from 'pg';
import { connectionPool } from '../index.js';
import { InternalServerError } from '../errors/errors.js';
import { query } from 'express';

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

    async getByUsername(un: string): Promise<User> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from app_users where username = $1';
            let rs = await client.query(sql, [un]);
            return rs.rows[0];
        } catch(e){
            throw new InternalServerError();
        } finally{
            client && client.release();
        }

    }

    async getByRole(roleId: number): Promise<User[]>{

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from app_users where user_role_id = $1';
            let rs = await client.query(sql, [roleId]);
            return rs.rows;
        } catch(e){
            throw new InternalServerError();
        } finally{
            client && client.release();
        }

    }

    async save(newUser: User): Promise<Boolean>{

        let client:PoolClient;
        
        try{
            client = await connectionPool.connect();
            let sql = `
                insert into app_users (username, password, first_name, last_name, email, user_role_id)
                values
                    ($1,$2,$3,$4,$5,$6)
            `;
            await client.query(sql, [newUser.username, newUser.password, newUser.firstName, newUser.lastName, newUser.email, newUser.roleId]);
            return true;
        } catch(e){
            throw new InternalServerError();
        } finally{
            client && client.release();
        }

    }

}