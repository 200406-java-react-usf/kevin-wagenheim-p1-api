import {User} from '../models/user';
import { PoolClient } from 'pg';
import { connectionPool } from '../index';
import { InternalServerError } from '../errors/errors';
import { mapUserResultSet } from '../util/result-set-mapper';

export class UserRepository {

    /**
     * Retrieves all Users in the database.
     */

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

    /**
     * Retrives a User given their unique ID
     * @param id {number} Unique ID given to a user when created
     */

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

    /**
     * Retrieves a user given a key in the user object, and its value
     * @param key {string} Key in the User object
     * @param val {string} Value based on the given key
     */

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

    /**
     * Retrieves a user given the username of the user.
     * @param un {string} Username of the User
     */


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

    /**
     * Retrieves a user given the user's username and password
     * @param un {string} Username
     * @param pw {string} Password
     */


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

    /**
     * Returns an array of users of a certain role 
     * @param roleId {number} Unique ID of the role
     * 
     */

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

    /**
     * Adds a new User to the database.
     * @param newUser {User} User Object
     */

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

    /**
     * Updates an existing user based on the values given in the user passed in. Uses ID to find and update the existing user.
     * @param updatedUser {User} User Object
     */


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

    /**
     * Deletes a user given its unique ID
     * @param id {number} Unique ID of the user
     */


    async deleteById(id: number): Promise<boolean>{

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = 'delete from app_users where user_id = $1';
            await client.query(sql, [id]);
            return true;
        } catch(e){
            throw new InternalServerError('Server error happened why trying to delete a user');
        } finally{
            client && client.release();
        }

    }

}