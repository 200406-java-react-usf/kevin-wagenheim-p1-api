import {ReimbServices} from '../services/reimb-services';
import {UserRepository} from '../repos/user-repo';
import {Reimbursments} from '../models/reimb';
import Validator from '../util/validators';
import {ResourceNotFoundError, InvalidInputError, AuthenticationError, ResourceConflictError} from '../errors/errors';

jest.mock('../repos/reimb-repo', () => {

    return new class UserRepository{
        getAll = jest.fn();
        getById = jest.fn();
        getByUniqueKey = jest.fn();
        getByAuthorId = jest.fn();
        save = jest.fn();
        update = jest.fn();
        deleteById = jest.fn();
        resolveReimb = jest.fn();
    };

});

describe('tests for the Reimb Service', () => {

    let sut: ReimbServices;
    let mockRepo;

    let mockReimbs = [
        new Reimbursments(1, 500, '10/10/20', '10/15/20', 'Description1', 1, 1, 3, 4),
        new Reimbursments(2, 200, '11/11/20', '11/15/20', 'Description2', 1, 1, 2, 3),
        new Reimbursments(3, 500, '11/15/20', null, 'Description3', 1, null, 1, 2),
        new Reimbursments(4, 500, '12/5/20', '12/10/20', 'Description4', 1, 1, 3, 1),
        new Reimbursments(5, 500, '1/1/20', '1/5/20', 'Description5', 3, 1, 3, 4)
    ];

    beforeEach(() => {

        mockRepo = jest.fn(() => {  
            return {
                getAll: jest.fn(),
                getById: jest.fn(),
                getByUniqueKey: jest.fn(),
                getByAuthorId: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                deleteById: jest.fn(),
                resolveReimb: jest.fn()
            };
        });

        sut = new ReimbServices(mockRepo);

    });

    test('should return a Reimb[] when getAllReimb is called', async () => {

        //Arrange
        expect.hasAssertions();
        mockRepo.getAll = jest.fn().mockReturnValue(mockReimbs);

        //Act
        let result = await sut.getAllReimbs();

        //Assert
        expect(result).toBeTruthy();
        expect(result.length).toBe(5);

    });

    test('should return a ResourceNotFoundError when getAllReimbs is called and db is empty', async () => {

        //Arrange
        expect.assertions(1);
        mockRepo.getAll = jest.fn().mockReturnValue([]);

        try{
            //Act
            await sut.getAllReimbs();
        } catch (e){
            //Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
        
    });

    test('should return a user when getById is called with correct ID', async () => {

        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        let result = await sut.getReimbById(1);

        expect(result).toBeTruthy();
        expect(result.id).toBe(1);

    });

    test('should return InvalidInputError when getById is given an invalid id(decimal)', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(false);

        try{
            await sut.getReimbById(3.14);
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when getById is given an invalid id(0)', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(false);

        try{
            await sut.getReimbById(0);
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when getById is given an invalid id(NaN)', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(false);

        try{
            await sut.getReimbById(NaN);
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when getById is given an invalid id(negative)', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(false);

        try{
            await sut.getReimbById(-1);
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return InvalidInputError when getById is given an id that does not exist in db', async () => {

        expect.assertions(1);
        mockRepo.getById = jest.fn().mockReturnValue(true);

        try{
            await sut.getReimbById(9000);
        } catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should add a new user when addNewReimb is given a valid Reimb Obj', async () => {

        expect.assertions(2);

        Validator.isValidObject = jest.fn().mockReturnValue(true);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.save = jest.fn().mockImplementation((newReimb: Reimbursments) => {
            return new Promise<Reimbursments> ((resolve) => {
                mockReimbs.push(newReimb);
                resolve(newReimb);
            });
        });

        let result = await sut.addNewReimb(new Reimbursments(0,500,'test','test','test',1,2,3,4));

        expect(result).toBeTruthy();
        expect(mockReimbs.length).toBe(6);

    });

    test('should throw ResourceConflictError when passing in to addNewReimb a falsy describe', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(false);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.save = jest.fn().mockImplementation((newReimb: Reimbursments) => {
            return new Promise<Reimbursments> ((resolve) => {
                mockReimbs.push(newReimb);
                resolve(newReimb);
            });
        });

        try{
            await sut.addNewReimb(new Reimbursments(0,500,'test','test','',1,2,3,4));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should throw ResourceConflictError when passing in to addNewReimb an invalid authorid', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(true);

        Validator.isValidId = jest.fn().mockReturnValue(false);

        mockRepo.save = jest.fn().mockImplementation((newReimb: Reimbursments) => {
            return new Promise<Reimbursments> ((resolve) => {
                mockReimbs.push(newReimb);
                resolve(newReimb);
            });
        });

        try{
            await sut.addNewReimb(new Reimbursments(0,500,'test','test','test',-1,2,3,4));
        } catch (e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should throw ResourceConflictError when passing in to addNewReimb a invalid type id', async () => {

        expect.assertions(1);

        Validator.isValidObject = jest.fn().mockReturnValue(true);

        Validator.isValidId = jest.fn().mockReturnValue(false);

        mockRepo.save = jest.fn().mockImplementation((newReimb: Reimbursments) => {
            return new Promise<Reimbursments> ((resolve) => {
                mockReimbs.push(newReimb);
                resolve(newReimb);
            });
        });

        try{
            await sut.addNewReimb(new Reimbursments(0,500,'test','test','test',1,2,3,-1));
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
            return new Promise<Reimbursments> ((resolve) => {
                resolve(mockReimbs.find(reimb => reimb[key] === val));
            });
        });

        let result = await sut.getReimbByUniqueKey({description: 'Description3'});

        expect(result).toBeTruthy();
        expect(result.id).toBe(3);

    });

    test('should return ResourceNotFoundError when given a value for getByUniqueKey that does not exist', async () => {

        expect.assertions(1);

        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);
        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<Reimbursments> ((resolve) => {
                resolve(mockReimbs.find(reimb => reimb[key] === val));
            });
        });

        try{
            await sut.getReimbByUniqueKey({description: 'Meow'});
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
            return new Promise<Reimbursments> ((resolve) => {
                resolve(mockReimbs.find(reimb => reimb[key] === val));
            });
        });

        try{
            await sut.getReimbByUniqueKey({meow: 'Vacseal'});
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
            return new Promise<Reimbursments> ((resolve) => {
                resolve(mockReimbs.find(reimb => reimb[key] === val));
            });
        });

        try{
            await sut.getReimbByUniqueKey({meow: 'Meow'});
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
            return new Promise<Reimbursments> ((resolve) => {
                resolve(mockReimbs.find(reimb => reimb[key] === val));
            });
        });

        try{
            await sut.getReimbByUniqueKey({description: ''});
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('should return a user when getByUniqueKey is given an id key and a correct value', async () => {

        expect.assertions(3);

        Validator.isPropertyOf = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(true);
        Validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.getByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<Reimbursments> ((resolve) => {
                resolve(mockReimbs.find(reimb => reimb[key] === val));
            });
        });

        let result = await sut.getReimbByUniqueKey({id: 3});
        expect(result).toBeTruthy();
        expect(result.id).toBe(3);
        expect(result.description).toBe('Description3');

    });

    test('should update a new user when updateReimb is given a correct Reimb that exists', async () => {

        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.update = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        let result = await sut.updateReimb(new Reimbursments(3, 500, '11/15/20', null, 'test3', 1, null, 1, 2));

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should throw a ResourceNotFoundError when given an id to update that doesnt exist', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.update = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateReimb(new Reimbursments(50, 500, '11/15/20', null, 'test3', 1, null, 1, 2));
        } catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
    });

    test('should throw a ResourceConflictError when updating a reimb in nonpending state', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.update = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateReimb(new Reimbursments(1, 500, '10/10/20', '10/15/20', 'Description1', 1, 1, 3, 4));
        } catch(e){
            expect(e instanceof ResourceConflictError).toBe(true);
        }
    });

    test('should throw a ResourceConflictError when updating an author id', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.update = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateReimb(new Reimbursments(3, 500, '11/15/20', null, 'test3', 2, null, 1, 2));
        } catch(e){
            expect(e instanceof ResourceConflictError).toBe(true);
        }
    });

    test('should throw ResourceNotFoundError when trying to update resolved time', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.update = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateReimb(new Reimbursments(3, 500, '11/15/20', 'test', 'test3', 2, null, 1, 2));
        } catch(e){
            expect(e instanceof ResourceConflictError).toBe(true);
        }

    });

    test('should still update when a user wants to keep their email but change everything else', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.update = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.updateReimb(new Reimbursments(3, 500, '11/15/20', null, 'test3', 2, 3, 1, 2));
        } catch(e){
            expect(e instanceof ResourceConflictError).toBe(true);
        }

    });

    test('Should return true when resolveReimb resolves a reimb', async () => {

        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(true);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.resolveReimb = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        let result = await sut.resolveReimb(new Reimbursments(3, 500, '11/15/20', '11/20/20', 'test3', 1, 1, 1, 2));

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('Should return InvalidInputError when given an invalid ID', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(false);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(true);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.resolveReimb = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.resolveReimb(new Reimbursments(-1, 500, '11/15/20', '11/20/20', 'test3', 1, 1, 1, 2))
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('Should return InvalidInputError when given a falsy description', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(false);
        Validator.isEmptyObject = jest.fn().mockReturnValue(true);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.resolveReimb = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.resolveReimb(new Reimbursments(3, 500, '11/15/20', '11/20/20', '', 1, 1, 1, 2))
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }

    });

    test('Should return ResourceNotFoundError when given an id that doesnt exist', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        Validator.isEmptyObject = jest.fn().mockReturnValue(false);

        sut.getReimbById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimbursments>((resolve) => resolve(mockReimbs[id-1]));
        });

        mockRepo.resolveReimb = jest.fn().mockImplementation((updateReimb: Reimbursments) => {
            return new Promise<boolean> ((resolve) => {
                resolve(true);
            });
        });

        try{
            await sut.resolveReimb(new Reimbursments(500, 500, '11/15/20', '11/20/20', 'test3', 1, 1, 1, 2))
        } catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should return an array of reimbs when getting by authorID', async () => {

        expect.assertions(2);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getByAuthorId = jest.fn().mockImplementation((id: number) => {

            return new Promise<Reimbursments[]>((resolve) => {

                let results = mockReimbs.filter(reimbs => reimbs.authorId === id);
                resolve(results);

            })

        });

        let result = await sut.getReimbByAuthorId({id: 3});

        expect(result).toBeTruthy();
        expect(result.length).toBe(1);

    });

    test('should return InvalidInputError when given a falsy id', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(false);

        mockRepo.getByAuthorId = jest.fn().mockImplementation((id: number) => {

            return new Promise<Reimbursments[]>((resolve) => {

                let results = mockReimbs.filter(reimbs => reimbs.authorId === id);
                resolve(results);

            })

        });

        try{
            await sut.getReimbByAuthorId({id: -3})
        } catch(e){
            expect(e instanceof InvalidInputError).toBe(true);
        }
    });

    test('should return ResourceNotFoundError when given an id that doesnt exist', async () => {

        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getByAuthorId = jest.fn().mockImplementation((id: number) => {

            return new Promise<Reimbursments[]>((resolve) => {

                let results = mockReimbs.filter(reimbs => reimbs.authorId === id);
                resolve(results);

            })

        });

        try{
            await sut.getReimbByAuthorId({id: 500})
        } catch(e){
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
    });

});