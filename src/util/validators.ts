/**
 * Checks to see if ID is valid: a truthy value of type number, and is an integer above 0;
 * @param id {number} The ID being checked
 */

export const isValidId = (id: number): boolean => {

    if (id && typeof id === 'number' && Number.isInteger(id) && id > 0){
        return true;
    }

    return false;

};

/**
 * Checks to see if string(s) is/are valid: truthy and of type string
 * @param input {...string} String(s) being checked
 */

export const isValidString = (...input: string[]): boolean => {

    for (let i of input){
        if (!i || typeof i !== 'string'){
            return false;
        }
    }

    return true;
    
};

/**
 * Checks to see if Object is valid: every key has a truthy value
 * @param obj {Object} Object being checked
 * @param nullableVal {...string} Values you want this to ignore  
 */

export const isValidObject = (obj: Object, ...nullableVal: string[]) => {

    return obj && Object.keys(obj).every(key => {

        if (nullableVal.includes(key)){
            return true;
        }

        return obj[key];

    });

};

/**
 * Checks to see if the object is empty
 * @param obj {Object} object being checked
 */

export const isEmptyObject = (obj: any) => {

    if(!obj || Object.keys(obj).length === 0){
        return false;
    }

    return true;

};

/**
 * Checks if a property is apart of the keys in the object of a specified type.
 * @param prop {string} Property you want to check
 * @param type {any} Object Type you want to check
 */

export const isPropertyOf = (prop: string, type: any) => {

    if(!prop || !type){

        return false;

    }

    let typeCreator = <T>(Type: (new () => T)): T => {

        return new Type();

    };

    let tempInstance;
    try{
        tempInstance = typeCreator(type);
    } catch {
        return false;
    }

    return Object.keys(tempInstance).includes(prop);

};

export default {
    isValidId,
    isValidObject,
    isValidString,
    isEmptyObject,
    isPropertyOf
};