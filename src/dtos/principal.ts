export class Principal{

    id: number;
    username: string;
    roleId: number;

    constructor(id: number, un: string, roleId: number){

        this.id = id;
        this.username = un;
        this.roleId = roleId;

    }

}