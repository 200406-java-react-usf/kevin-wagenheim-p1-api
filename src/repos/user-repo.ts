import {User} from '../models/user.js';
import { PoolClient } from 'pg';
import { connectionPool } from '../index.js';
import { InternalServerError } from '../errors/errors.js';
import { mapUserResultSet } from '../util/result-set-mapper.js';

export class UserRepository {

    async getAll(): Promise<User[]> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from app_users';
            let rs = await client.query(sql);
            return rs.rows.map(mapUserResultSet);
        } catch(e){
            throw new InternalServerError('Server error happened when trying to get all users');
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
            return mapUserResultSet(rs.rows[0]);
        } catch (e){
            throw new InternalServerError('Server error happened when trying to get user by ID');
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
            return mapUserResultSet(rs.rows[0]); 
        } catch(e){
            throw new InternalServerError('Server error happened when trying to get user by unique key');
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
            return mapUserResultSet(rs.rows[0]);
        } catch(e){
            throw new InternalServerError('Server error happened when trying to get user by username');
        } finally{
            client && client.release();
        }

    }

    async getByCredentials(username: string, password: string): Promise<User>{

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from app_users where username = $1 and password = $2';
            let rs = await client.query(sql, [username, password]);
            return mapUserResultSet(rs.rows[0]);
        } catch(e){
            throw new InternalServerError('Server error happened when trying to get user by credentials');
        } finally {
            client && client.release();
        }

    }

    async getByRole(roleId: number): Promise<User[]>{

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'select * from app_users where user_role_id = $1';
            let rs = await client.query(sql, [roleId]);
            return rs.rows.map(mapUserResultSet);
        } catch(e){
            throw new InternalServerError('Server error happened when trying to get users by role');
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
            throw new InternalServerError('Server error happened when trying to add new user');
        } finally{
            client && client.release();
        }

    }

    async update(updatedUser: User): Promise<boolean>{

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = `
                update app_users
                    set
                        username = $2,
                        password = $3,
                        first_name = $4,
                        last_name = $5,
                        email = $6
                    where user_id = $1
            `;
            await client.query(sql, [updatedUser.id, updatedUser.username, updatedUser.password, updatedUser.firstName, updatedUser.lastName, updatedUser.email]);
            return true;
        } catch(e){
            throw new InternalServerError('Server error happened when trying to update a user');
        } finally{
            client && client.release();
        }

    }

}