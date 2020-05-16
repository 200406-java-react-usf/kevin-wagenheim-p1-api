export class User {

    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId: number;

    constructor(id: number, un: string, pw: string, fn: string, ln: string, email: string, roleId: number){

        this.id = id;
        this.username = un;
        this.password = pw;
        this.firstName = fn;
        this.lastName = ln;
        this.email = email;
        this.roleId = roleId;

    }


}