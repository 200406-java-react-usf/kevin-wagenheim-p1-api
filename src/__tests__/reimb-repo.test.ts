import {ReimbRepository} from '../repos/reimb-repo';
import * as mockIndex from '..';
import * as mockMapper from '../util/result-set-mapper';
import {Reimbursments} from '../models/reimb';
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
        mapReimbResultSet: jest.fn()
    };
});

describe('testing for userRepo', () => {

    let sut = new ReimbRepository();
    let mockConnect = mockIndex.connectionPool.connect;

    beforeEach(() =>{
        (mockConnect as jest.Mock).mockClear().mockImplementation(() =>{
            return {
                query: jest.fn().mockImplementation(() => {
                    return {

                        rows: [

                            {
                                reimb_id: 1,
                                amount: 500,
                                submitted: '10/10/20',
                                resolved: '10/15/20',
                                description: 'Description',
                                author_id: 1,
                                resolver_id: 1,
                                reimb_status_id: 1,
                                reimb_type_id: 1
                            }
                        ]
                    };
                }),
                release: jest.fn()
            };
        });
        (mockMapper.mapReimbResultSet as jest.Mock).mockClear();
    });

    test('should resolve to an array of Reimbs when getAll is called', async () => {

        //Arrange
        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);

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

    test('should resolve to an array of Reimbs when getByAuthorId is called', async () => {

        //Arrange
        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);

        //Act
        let result = await sut.getByAuthorId(mockReimb.authorId);

        //Assert
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should return InternalServerError when getbyAuthorId is called with an id that doesnt exist', async () => {

        //Arrange
        expect.hasAssertions();
        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return false ;}),
                release: jest.fn()
            };
        });

        //Act
        try{
            await sut.getByAuthorId(mockReimb.id);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

    test('should return true when resolve is successfully called', async () => {

        //Arrange
        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return false;}),
                release: jest.fn()
            };
        });

        //Act
        let result = await sut.resolveReimb(mockReimb);

        //Assert
        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should throw InternalServerError when it couldnt resolve', async () => {

        //Arrange
        expect.hasAssertions();
        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { throw new Error();}),
                release: jest.fn()
            };
        });

        try{
            await sut.resolveReimb(mockReimb);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

    test('should return a Reimb Object when getById gets a Reimb from the db', async () => {

        //Arrange
        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);

        //Act
        let result = await sut.getById(1);

        //Assert
        expect(result).toBeTruthy();
        expect(result instanceof Reimbursments).toBeTruthy();        

    });

    test('should return InternalServerError when getbyId does not find a Reimb with specified ID', async () => {

        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return false;
                }),
                release: jest.fn()
            };
        });

        try{
            await sut.getById(mockReimb.id);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });
    
    test('should return true when save adds a new Reimb to the db', async () => {

        //Arrange
        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);

        //Act
        let result = await sut.save(mockReimb);

        //Assert
        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should return InternalServerError when save runs into an error adding to the db', async () => {

        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    throw new Error();
                }),
                release: jest.fn()
            };
        });

        try{
            await sut.save(mockReimb);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

    test('should return true when update is given a valid Reimb to update', async() => {

        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return true;
                }),
                release: jest.fn()
            };
        });

        let result = await sut.update(mockReimb);

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should return InternalServerError when update is given a invalid Reimb to update', async() => {

        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    throw new Error();
                }),
                release: jest.fn()
            };
        });

        try{
            await sut.update(mockReimb);
        } catch (e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

    test('should return a Reimb when getByUniqueKey is given valid key and value', async() => {

        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);

        let result = await sut.getByUniqueKey('description', mockReimb.description);

        expect(result).toBeTruthy();
        expect(result instanceof Reimbursments).toBe(true);

    });

    test('should return a Reimb when getByUniqueKey is given invalid key and value', async() => {

        expect.hasAssertions();

        let mockReimb = new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3);
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return false;
                }),
                release: jest.fn()
            };
        });

        try{
            await sut.getByUniqueKey('', mockReimb.description);
        } catch(e){
            expect(e instanceof InternalServerError).toBe(true);
        }

    });

});