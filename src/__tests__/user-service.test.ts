import {UserService} from '../services/user-services';
import {UserRepository} from '../repos/user-repo';
import {User} from '../models/user';
import Validator from '../util/validators';
import {ResourceNotFoundError, InvalidInputError, AuthenticationError, ResourceConflictError} from '../errors/errors';

jest.mock('../repos/user-repo', () => {

    return new class UserRepository{
        getAll = jest.fn();
        getById = jest.fn();
        getByUniqueKey = jest.fn();
        save = jest.fn();
        update = jest.fn();
        deleteById = jest.fn();
        getByUsername = jest.fn();
        getByCredentials = jest.fn();
        getByRole = jest.fn();
    };

});

describe('tests for the User Service', () => {

    let sut: UserService;
    let mockRepo;

    let mockUsers = [
        new User(1, 'Wagenheim', 'password', 'Kevin', 'Wagenheim', 'wagenheimk@me.com', 1),
        new User(2, 'CameraGuyJohn', 'password', 'John', 'Egan', 'jvemedia@gmail.com', 3),
        new User(3, 'Vacseal', 'password', 'Nick', 'Aliantro', 'naliantro@live.com', 2),
        new User(4, 'LzM', 'password', 'Louis', 'Monacello', 'LzM_@me.com', 3),
        new User(5, 'MuffErickson', 'password','Tyler', 'Erickson', 'MuffErickson@gmail.com', 3)
    ];

    beforeEach(() => {

        mockRepo = jest.fn(() => {  
            return {
                getAll: jest.fn(),
                getById: jest.fn(),
                getUserByUniqueKey: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                deleteById: jest.fn(),
                getByUsername: jest.fn(),
                getByCredentials: jest.fn()
            };
        });

        sut = new UserService(mockRepo);

    });

    test('should return a User[] when getAllUsers is called', async () => {

        //Arrange
        expect.hasAssertions();
        mockRepo.getAll = jest.fn().mockReturnValue(mockUsers);

        //Act
        let result = await sut.getAllUsers();

        //Assert
        expect(result).toBeTruthy();
        expect(result.length).toBe(5);

    });

    test('should return a ResourceNotFoundError when getAllUsers is called and db is empty', async () => {

        //Arrange
        expect.assertions(1);
        mockRepo.getAll = jest.fn().mockReturnValue([]);

        try{
            //Act
            await sut.getAllUsers();
        } catch (e){
            //Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
        
    });

    test('should return a User[] when getByRole is called', async () => {

        //Arrange
        expect.hasAssertions();

        let users: User[] = [];

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(true);

        mockRepo.getByRole = jest.fn().mockImplementation((id: number) => {
            return new Promise<User[]>((resolve) => {
                let roles = mockUsers.filter(user => user.roleId === id);
                for (let role of roles){
                    users.push(role);                    
                }
                resolve(users);
            })
        });

        //Act
        let result = await sut.getByRole(3);

        //Assert
        expect(result).toBeTruthy();
        expect(result.length).toBe(3);

    });

    test('should throw invalid input error when getByRole is called with invalid id', async () => {

        //Arrange
        expect.hasAssertions();

        let users: User[] = [];

        Validator.isValidId = jest.fn().mockReturnValue(false);
        Validator.isEmptyObject = jest.fn().mockReturnValue(true);

        mockRepo.getByRole = jest.fn().mockImplementation((id: number) => {
            return new Promise<User[]>((resolve) => {
                let roles = mockUsers.filter(user => user.roleId === id);
                for (let role of roles){
                    users.push(role);                    
                }
                resolve(users);
            })
        });

        try{
            await sut.getByRole(-1);
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should throw ResourceNotFoundError when getByRole is called with invalid id', async () => {

        //Arrange
        expect.hasAssertions();

        let users: User[] = [];

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);

        mockRepo.getByRole = jest.fn().mockImplementation((id: number) => {
            return new Promise<User[]>((resolve) => {
                let roles = mockUsers.filter(user => user.roleId === id);
                for (let role of roles){
                    users.push(role);                    
                }
                resolve(users);
            })
        });

        try{
            await sut.getByRole(500);
        } catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should return a user when getById is called with correct ID', async () => {

        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User>((resolve) => resolve(mockUsers[id-1]));
        });

        let result = await sut.getUserById(1);

        expect(result).toBeTruthy();
        expect(result.id).toBe(1);

    });

    test('should return InvalidInputError when getById is given an invalid id(decimal)', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(false);

        try{
            await sut.getUserById(3.14);
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when getById is given an invalid id(0)', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(false);

        try{
            await sut.getUserById(0);
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when getById is given an invalid id(NaN)', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(false);

        try{
            await sut.getUserById(NaN);
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when getById is given an invalid id(negative)', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(false);

        try{
            await sut.getUserById(-1);
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when getById is given an id that does not exist in db', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(true);

        try{
            await sut.getUserById(9000);
        } catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should return a user when getByUsername is called with correct ID', async () => {

        expect.assertions(2);

        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getByUsername = jest.fn().mockImplementation((un: string) => {
            return new Promise<User>((resolve) => resolve(mockUsers.find(mockuser => mockuser.username === un)));
        });

        let result = await sut.getByUsername('Vacseal');

        expect(result).toBeTruthy();
        expect(result.id).toBe(3);

    });

    test('should return a ResourceNotFoundError when checking for a username that doesnt exist', async () => {

        expect.assertions(1);

        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getByUsername = jest.fn().mockImplementation((un: string) => {
            return new Promise<User>((resolve) => resolve(mockUsers.find(mockuser => mockuser.username === un)));
        });

        try{
            await sut.getByUsername('Meow');
        }catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should return a InvalidInputError when checking for a username that is falsy', async () => {

        expect.assertions(1);

        Validator.isValidString = jest.fn().mockReturnValue(false);

        mockRepo.getByUsername = jest.fn().mockImplementation((un: string) => {
            return new Promise<User>((resolve) => resolve(mockUsers.find(mockuser => mockuser.username === un)));
        });

        try{
            await sut.getByUsername('');
        }catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return a user when authenticate is given valid credentials', async () => {

        expect.assertions(2);

        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getByCredentials = jest.fn().mockImplementation((un: string, pw: string) => {
            return new Promise<User>((resolve) => resolve(mockUsers.find(mockuser => mockuser.username === un && mockuser.password === pw)));
        });

        let result = await sut.authenticate('Vacseal', 'password');

        expect(result).toBeTruthy();
        expect(result.id).toBe(3);

    });

    test('should return a AuthenticationError when given invalid credentials', async () => {

        expect.assertions(1);

        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getByCredentials = jest.fn().mockImplementation((un: string, pw: string) => {
            return new Promise<User>((resolve) => resolve(mockUsers.find(mockuser => mockuser.username === un && mockuser.password === pw)));
        });

        try{
            await sut.authenticate('Meow', 'Meow');
        }catch(e){
            expect(e instanceof AuthenticationError).toBe(true);
        }

    });

    test('should return a InvalidInput error when given a falsy username', async () => {

        expect.assertions(1);

        Validator.isValidString = jest.fn().mockReturnValue(false);

        mockRepo.getByCredentials = jest.fn().mockImplementation((un: string, pw: string) => {
            return new Promise<User>((resolve) => resolve(mockUsers.find(mockuser => mockuser.username === un && mockuser.password === pw)));
        });

        try{
            await sut.authenticate('','password');
        }catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return a InvalidInput error when given a falsy password', async () => {

        expect.assertions(1);

        Validator.isValidString = jest.fn().mockReturnValue(false);

        mockRepo.getByCredentials = jest.fn().mockImplementation((un: string, pw: string) => {
            return new Promise<User>((resolve) => resolve(mockUsers.find(mockuser => mockuser.username === un && mockuser.password === pw)));
        });

        try{
            await sut.authenticate('username','');
        }catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should add a new user when addNewUser is given a valid User Obj', async () => {

        expect.assertions(2);

        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);

        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User> ((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        let result = await sut.addNewUser(new User(0,'test','test','test','test','test',3));

        expect(result).toBeTruthy();
        expect(mockUsers.length).toBe(6);

    });

    test('should throw ResourceConflictError when passing in to addNewUsser a user that has a username that already exists', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(false);

        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User> ((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        try{
            await sut.addNewUser(new User(0,'Vacseal','test','test','test','test',3));
        } catch (e){
            expect(e instanceof ResourceConflictError).toBe(true);
        }

    });

    test('should throw ResourceConflictError when passing in to addNewUsser a user that has a email that already exists', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);

        sut.isEmailAvailable = jest.fn().mockReturnValue(false);

        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User> ((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        try{
            await sut.addNewUser(new User(0,'test','test','test','test','wagenheimk@me.com',3));
        } catch (e){
            expect(e instanceof ResourceConflictError).toBe(true);
        }

    });

    test('should throw ResourceConflictError when passing in to addNewUsser a falsy user(un)', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);

        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User> ((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        try{
            await sut.addNewUser(new User(0,'','test','test','test','test',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should throw ResourceConflictError when passing in to addNewUsser a falsy user(first name)', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);

        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User> ((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        try{
            await sut.addNewUser(new User(0,'test','test','','test','test',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should throw ResourceConflictError when passing in to addNewUsser a falsy user(last name)', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);

        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User> ((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        try{
            await sut.addNewUser(new User(0,'test','test','test','','test',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should throw ResourceConflictError when passing in to addNewUsser a falsy user(email)', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);

        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User> ((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        try{
            await sut.addNewUser(new User(0,'test','test','test','test','',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should throw ResourceConflictError when passing in to addNewUsser a falsy user(password)', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);

        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User> ((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        try{
            await sut.addNewUser(new User(0,'test','','test','test','test',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return correct user when given correct key and value for getByUniqueKey', async () => {

        expect.assertions(2);

        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(true);
        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user[key] === val));
            });
        });

        let result = await sut.getUserByUniqueKey({username: 'Vacseal'});

        expect(result).toBeTruthy();
        expect(result.id).toBe(3);

    });

    test('should return ResourceNotFoundError when given a value for getByUniqueKey that does not exist', async () => {

        expect.assertions(1);

        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);
        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user[key] === val));
            });
        });

        try{
            await sut.getUserByUniqueKey({username: 'Meow'});
        } catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should return InvalidInputError when given a key for getByUniqueKey that does not exist', async () => {

        expect.assertions(1);

        Validator.isPropertyOf = jest.fn().mockReturnValue(false);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);
        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user[key] === val));
            });
        });

        try{
            await sut.getUserByUniqueKey({meow: 'Vacseal'});
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when given a key and value for getByUniqueKey that does not exist', async () => {

        expect.assertions(1);

        Validator.isPropertyOf = jest.fn().mockReturnValue(false);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);
        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user[key] === val));
            });
        });

        try{
            await sut.getUserByUniqueKey({meow: 'Meow'});
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when given a falsy value for val', async () => {

        expect.assertions(1);

        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(true);
        Validator.isValidString = jest.fn().mockReturnValue(false);

        mockRepo.getByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user[key] === val));
            });
        });

        try{
            await sut.getUserByUniqueKey({Username: ''});
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return a user when getByUniqueKey is given an id key and a correct value', async () => {

        expect.assertions(3);

        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(true);
        Validator.isValidString = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User>((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.getByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user[key] === val));
            });
        });

        let result = await sut.getUserByUniqueKey({id: 3});
        expect(result).toBeTruthy();
        expect(result.id).toBe(3);
        expect(result.username).toBe('Vacseal');

    });

    test('should update a new user when updateUser is given a correct User that exists', async () => {

        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        let result = await sut.updateUser(new User(3,'test','test','test','test','test',3));

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should throw a ResourceNotFoundError when given an id to update that doesnt exist', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateUser(new User(50,'test','test','test','test','test',3));
        } catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
    });

    test('should throw a ResourceConflictError when updating to a username that already exists', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(false);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateUser(new User(3,'Wagenheim','test','test','test','test',3));
        } catch(e){
            expect(e instanceof ResourceConflictError).toBe(true);
        }
    });

    test('should throw a ResourceConflictError when updating to a email that already exists', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(false);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateUser(new User(3,'test','test','test','test','wagenheimk@me.com',3));
        } catch(e){
            expect(e instanceof ResourceConflictError).toBe(true);
        }
    });

    test('should still update when a user wants to keep their username but change everything else', async () => {

        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(false);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        let result = await sut.updateUser(new User(3,'Vacseal','test','test','test','test',3));

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should still update when a user wants to keep their email but change everything else', async () => {

        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(false);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        let result = await sut.updateUser(new User(1,'test','test','test','test','wagenheimk@me.com',1));

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('Should throw InvalidInputError when given an invalid ID in the updated User', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(false);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateUser(new User(-1,'test','test','test','test','test',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('Should throw InvalidInputError when given an invalid User object in the updated User(username)', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateUser(new User(3,'','test','test','test','test',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('Should throw InvalidInputError when given an invalid User object in the updated User(first name)', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateUser(new User(3,'test','test','','test','test',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('Should throw InvalidInputError when given an invalid User object in the updated User(last name)', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateUser(new User(3,'test','test','test','','test',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('Should throw InvalidInputError when given an invalid User object in the updated User(email)', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateUser(new User(3,'test','test','test','test','',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('Should throw InvalidInputError when given an invalid User object in the updated User(password)', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(false);

        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        sut.isEmailAvailable = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.update = jest.fn().mockImplementation((updateUser: User) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateUser(new User(3,'test','','test','test','test',3));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return true when delete user is given a valid id of a user to be deleted', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.deleteById = jest.fn().mockImplementation((id:number) => {
            return new Promise<boolean> ((resolve) => {
                mockUsers = mockUsers.slice(0,id).concat(mockUsers.slice(id+1,mockUsers.length));
                resolve(true);
            });
        });

        let result = await sut.deleteUser({id: 3});

        expect(result).toBe(true);

    });

    test('should return ResourceNotFoundError when id given does not exist', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(false);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.deleteById = jest.fn().mockImplementation((id:number) => {
            return new Promise<boolean> ((resolve) => {
                mockUsers = mockUsers.slice(0,id).concat(mockUsers.slice(id+1,mockUsers.length));
                resolve(true);
            });
        });

        try{
            await sut.deleteUser({id: 3000});
        } catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should return InvalidInputError when id is not a valid ID', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(false);

        sut.getUserById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User> ((resolve) => {
                resolve(mockUsers.find(user => user.id === id));
            });
        });

        mockRepo.deleteById = jest.fn().mockImplementation((id:number) => {
            return new Promise<boolean> ((resolve) => {
                mockUsers = mockUsers.slice(0,id).concat(mockUsers.slice(id+1,mockUsers.length));
                resolve(true);
            });
        });

        try{
            await sut.deleteUser({id: -1});
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

});