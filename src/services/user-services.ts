import { UserRepository } from "../repos/user-repo";
import { User } from "../models/user";
import { ResourceNotFoundError, InvalidInputError, ResourceConflictError, AuthenticationError } from "../errors/errors";
import { isValidId, isEmptyObject, isPropertyOf, isValidString, isValidObject } from "../util/validators";

export class UserService {

    constructor(private userRepo: UserRepository){

        this.userRepo = userRepo;

    }

    /** 
     * Retrieves an Array of Cards from the database
    */

    async getAllUsers(): Promise<User[]>{

        let result = await this.userRepo.getAll();

        if(result.length === 0){
            throw new ResourceNotFoundError('No users in the database.');
        }

        return result;

    }

    /**
     * Retrieves a Card given an ID
     * @param id {string} id : Unique number given to each card for Identification
     */

    async getUserById(id: number): Promise<User>{

        if (!isValidId(id)){
            throw new InvalidInputError('Invalid ID was input.');
        }

        let result = await this.userRepo.getById(id);

        if (!isEmptyObject(result)){
            throw new ResourceNotFoundError('No user with that ID was found');
        }

        return result;

    }

    /**
     * Retrives a User from the database given a correct Key/Value pair.
     * @param queryObj {any} Object with the key and value to search for 
     */

    async getUserByUniqueKey(queryObj: any): Promise<User>{

        try{

            let queryKeys = Object.keys(queryObj);

            if(!queryKeys.every(key => isPropertyOf(key, User))){
                throw new InvalidInputError('Key is not a property of a User');
            }

            let key = queryKeys[0];
            let val = queryObj[key];

            if(key === 'id'){
                return await this.getUserById(val);
            }

            if(!isValidString(val)){
                throw new InvalidInputError('Value is not a string');
            }

            let user = await this.userRepo.getByUniqueKey(key, val);

            if(!isEmptyObject(user)){
                throw new ResourceNotFoundError('No user found with given properties');
            }

            return user;

        } catch(e){
            throw e;
        }

    }
    
    /**
     * Retrieves a user given the username of the user.
     * @param un {string} Username of the User
     */


    async getByUsername(un: string): Promise<User>{

        if(!isValidString(un)){
            throw new InvalidInputError('Invalid username was input');
        }

        let result = await this.userRepo.getByUsername(un);

        if(!isValidObject(result)){
            throw new ResourceNotFoundError('User with that Username was not found');
        }

        return result;

    }

    /**
     * Retrieves a user given the user's username and password
     * @param un {string} Username
     * @param pw {string} Password
     */

    async authenticate(username: string, password: string): Promise<User>{

        try{

            if(!isValidString(username, password)){
                throw new InvalidInputError('Invalid credentials given');
            }

            let authUser: User;

            authUser = await this.userRepo.getByCredentials(username, password);
            
            if(!isEmptyObject(authUser)){
                throw new AuthenticationError('No user found with those credentials');
            }

            return authUser;

        } catch(e){
            throw e;
        }

    }

    /**
     * Returns an array of users of a certain role 
     * @param roleId {number} Unique ID of the role
     * 
     */

    async getByRole(roleId: number): Promise<User[]> {

        if(!isValidId(roleId)){
            throw new InvalidInputError('Invalid role ID was input');
        }

        let result = await this.userRepo.getByRole(roleId);

        if(!isEmptyObject(result)){
            throw new ResourceNotFoundError('Role with that ID does not exist');
        }

        return result;

    }

    /**
     * Adds a new User to the database.
     * @param newUser {User} User Object
     */

    async addNewUser(newUser: User): Promise<boolean>{

        try{
            if(!isValidObject(newUser, 'id')){
                throw new InvalidInputError('Invalid User object was input');
            }

            let usernameConflict = await this.isUsernameAvailable(newUser.username);

            if(!usernameConflict){
                throw new ResourceConflictError('Username is already taken');
            }

            let emailConflict = await this.isEmailAvailable(newUser.email);

            if(!emailConflict){
                throw new ResourceConflictError('Email is already in use');
            }

            await this.userRepo.save(newUser);

            return true;
        } catch(e){
            throw e;
        }    
        
    }

    /**
     * Updates an existing user based on the values given in the user passed in. Uses ID to find and update the existing user.
     * @param updateUser {User} User Object
     */


    async updateUser(updatedUser: User): Promise<boolean>{

        try{

            if(!isValidObject(updatedUser, 'id') || !isValidId(updatedUser.id)){
                throw new InvalidInputError('Invalid User was input');
            }

            let userToUpdate = await this.getUserById(updatedUser.id);

            if(!userToUpdate){
                throw new ResourceNotFoundError('No user found to update');
            }

            let emailConflict = await this.isEmailAvailable(updatedUser.email);

            if(userToUpdate.email === updatedUser.email){
                emailConflict = true;
            }

            if(!emailConflict){
                throw new ResourceConflictError('Email is already taken');
            }

            let usernameConflict = await this.isUsernameAvailable(updatedUser.username);

            if(userToUpdate.username === updatedUser.username){
                usernameConflict = true;
            }

            if(!usernameConflict){
                throw new ResourceConflictError('Username is already taken');
            }

            await this.userRepo.update(updatedUser);

            return true;

        } catch(e){
            throw e;
        }

    }

    /**
     * Deletes a card given the JSON object from the DELETE HTTP request
     * @param jsonObj {Object} JSON object from the DELETE HTTP request
     */

    async deleteUser (jsonObj: object): Promise<boolean>{

        let keys = Object.keys(jsonObj);
        let val = keys[0];

        let id = +jsonObj[val];

        if(!isValidId(id)){
            throw new InvalidInputError('Invalid ID was input');
        }

        let userToDelete = await this.getUserById(id);

        if(!userToDelete){
            throw new ResourceNotFoundError('User does not exist, or was already deleted');
        }

        let result = await this.userRepo.deleteById(id);

        return result;

    }

    /**
     * Checks to see if the username exists in the database
     * @param username {string} Username
     */

    async isUsernameAvailable(username: string){

        try{
            await this.getUserByUniqueKey({'username': username});
        } catch (e){
            return true;
        }

        return false;

    }

    /**
     * Checks to see if the email exists in the database
     * @param email {string} Email
     */

    async isEmailAvailable(email: string){

        try{
            await this.getUserByUniqueKey({'email': email});
        } catch (e){
            return true;
        }

        return false;

    }

}