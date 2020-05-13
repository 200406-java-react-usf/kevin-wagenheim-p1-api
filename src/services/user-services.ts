import { UserRepository } from "../repos/user-repo";
import { User } from "../models/user";
import { ResourceNotFoundError, InvalidInputError } from "../errors/errors";
import { isValidId, isEmptyObject, isPropertyOf, isValidString } from "../util/validators";

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

}