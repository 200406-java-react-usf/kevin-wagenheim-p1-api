class ResourceNotFoundError {

    message: string;
    statusCode: number;

    constructor(message?: string){

        this.statusCode = 404;

        if(!message){
            this.message = 'Resource not Found';
        } else {
            this.message = message;
        }

    }

}

class InvalidInputError {

    message: string;
    statusCode: number;

    constructor(message?: string){

        this.statusCode = 400;

        if(!message){
            this.message = 'Invalid Inputs';
        } else {
            this.message = message;
        }

    }

}

class ResourceConflictError {

    message: string;
    statusCode: number;

    constructor(reason?: string){

        this.statusCode = 409;

        if(!reason){
            this.message = 'Resource Conflict Error';
        } else{
            this.message = reason;
        }


    }

}

class AuthenticationError {

    message: string;
    statusCode: number;

    constructor(reason?: string){

        this.statusCode = 401;

        if(!reason){
            this.message = 'Invalid Credentials';
        }else{
            this.message = reason;
        }
        
    }

}

class AuthorizationError {

    message: string;
    statusCode: number;

    constructor(reason?: string){

        this.statusCode = 403;

        if(!reason){
            this.message = 'You\'re not Authorized to view this page';
        }else{
            this.message = reason;
        }
        
    }

}

class InternalServerError {

    message: string;
    statusCode: number;

    constructor(reason?: string){

        this.statusCode = 500;

        if(!reason){
            this.message = 'Internal Server Error';
        }else{
            this.message = reason;
        }
        
    }

}

export {
    ResourceNotFoundError,
    AuthenticationError,
    ResourceConflictError,
    InvalidInputError,
    InternalServerError,
    AuthorizationError
};