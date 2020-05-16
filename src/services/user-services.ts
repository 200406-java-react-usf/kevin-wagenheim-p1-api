import { UserRepository } from "../repos/user-repo";
import { User } from "../models/user";
import { ResourceNotFoundError, InvalidInputError, ResourceConflictError } from "../errors/errors";
import { isValidId, isEmptyObject, isPropertyOf, isValidString, isValidObject } from "../util/validators";

export class UserService {

    constructor(private userRepo: UserRepository){

        this.userRepo = userRepo;

    }

    async getAllUsers(): Promise<User[]>{

        let result = await this.userRepo.getAll();

        if(result.length === 0){
            throw new ResourceNotFoundError('No users in the database.');
        }

        return result;

    }

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

    async authenticate(username: string, password: string): Promise<User>{

        try{

            if(!isValidString(username, password)){
                throw new InvalidInputError('Invalid credentials given');
            }

            let authUser: User;

            authUser = await this.userRepo.getByCredentials(username, password);
            
            if(!isEmptyObject(authUser)){
                throw new ResourceNotFoundError('No user found with those credentials');
            }

            return authUser;

        } catch(e){
            throw e;
        }

    }

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

    private async isUsernameAvailable(username: string){

        try{
            await this.getUserByUniqueKey({'username': username});
        } catch (e){
            return true;
        }

        return false;

    }

    private async isEmailAvailable(email: string){

        try{
            await this.getUserByUniqueKey({'email': email});
        } catch (e){
            return true;
        }

        return false;

    }

}