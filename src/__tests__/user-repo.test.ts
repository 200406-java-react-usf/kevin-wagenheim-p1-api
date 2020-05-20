import {UserRepository} from '../repos/user-repo';
import * as mockIndex from '..';
import * as mockMapper from '../util/result-set-mapper';
import {User} from '../models/user';
import {InternalServerError } from '../errors/errors';

//Mock Connection Pool
jest.mock('..', () => {
    return {
        connectionPool: {
            connect: jest.fn()
        }
    };
});

//Mock result set mapper
jest.mock('../util/result-set-mapper', () => {
    return {
        mapUserResultSet: jest.fn()
    };
});

describe('testing for userRepo', () => {

    let sut = new UserRepository();
    let mockConnect = mockIndex.connectionPool.connect;

    beforeEach(() =>{
        (mockConnect as jest.Mock).mockClear().mockImplementation(() =>{
            return {
                query: jest.fn().mockImplementation(() => {
                    return {

                        rows: [

                            {
                                id: 1,
                                username: 'Wagenheim',
                                password: 'password',
                                email: 'wagenheimk@me.com',
                                first_name: 'Kevin',
                                last_name: 'Wagenheim'
                            }
                        ]
                    };
                }),
                release: jest.fn()
            };
        });
        (mockMapper.mapUserResultSet as jest.Mock).mockClear();
    });

    test('should resolve to an array of Users when getAll is called', async () => {

        //Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        //Act
        let result = await sut.getAll();

        //Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should return an empty array when get all is called with no data in the db', async () => {

        //Arrange
        expect.hasAssertions();
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return {rows: []};}),
                release: jest.fn()
            };
        });

        //Act
        let result = await sut.getAll();

        //Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should resolve to an array of Users when getByRole is called', async () => {

        //Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        //Act
        let result = await sut.getByRole(1);

        //Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should return an empty array when getByRole is called with no data in the db', async () => {

        //Arrange
        expect.hasAssertions();
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return {rows: []};}),
                release: jest.fn()
            };
        });

        //Act
        let result = await sut.getByRole(50);

        //Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should return a User Object when getById gets a User from the db', async () => {

        //Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        //Act
        let result = await sut.getById(1);

        //Assert
        expect(result).toBeTruthy();
        expect(result instanceof User).toBeTruthy();        

    });

    test('should return InternalServerError when getbyId does not find a user with specified ID', async () => {

        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return false;
                }),
                release: jest.fn()
            };
        });

        try{
            await sut.getById(mockUser.id);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });
    
    test('should return true when save adds a new user to the db', async () => {

        //Arrange
        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        //Act
        let result = await sut.save(mockUser);

        //Assert
        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should return InternalServerError when save runs into an error adding to the db', async () => {

        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    throw new Error();
                }),
                release: jest.fn()
            };
        });

        try{
            await sut.save(mockUser);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

    test('should return true when update is given a valid user to update', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return true;
                }),
                release: jest.fn()
            };
        });

        let result = await sut.update(mockUser);

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should return InternalServerError when update is given a invalid user to update', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    throw new Error();
                }),
                release: jest.fn()
            };
        });

        try{
            await sut.update(mockUser);
        } catch (e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

    test('should return true when deleteById is given a valid id to delete', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return true;
                }),
                release: jest.fn()
            };
        });

        let result = await sut.deleteById(mockUser.id);

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should return InternalServerError when deleteById fails to delete a user', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    throw new Error;
                }),
                release: jest.fn()
            };
        });

        try{
            await sut.deleteById(mockUser.id);
        } catch(e){
            expect( e instanceof InternalServerError).toBe(true);
        }

    });

    test('should return a user when getByUsername is given a valid ID', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        let result = await sut.getByUsername(mockUser.username);

        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);

    });

    test('should return a user when getByUsername is given a falsy value', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, '', 'pw', 'fn', 'ln', 'email', 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return false;
                }),
                release: jest.fn()
            };
        });
        try{
            await sut.getByUsername(mockUser.username);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

    test('should return a user when getByCredentials is given a valid un/pw', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 1);
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        let result = await sut.getByCredentials(mockUser.username, mockUser.password);

        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);

    });

    test('should return a user when getByCredentials is given a falsy value', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, '', 'pw', 'fn', 'ln', 'email', 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return false;
                }),
                release: jest.fn()
            };
        });
        try{
            await sut.getByCredentials(mockUser.username,mockUser.password);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

    test('should return a user when getByUniqueKey is given valid key and value', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, '', 'pw', 'fn', 'ln', 'email', 1);
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        let result = await sut.getByUniqueKey('username', mockUser.username);

        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);

    });

    test('should return a user when getByUniqueKey is given invalid key and value', async() => {

        expect.hasAssertions();

        let mockUser = new User(1, '', 'pw', 'fn', 'ln', 'email', 1);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return false;
                }),
                release: jest.fn()
            };
        });

        try{
            await sut.getByUniqueKey('', mockUser.username);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

});