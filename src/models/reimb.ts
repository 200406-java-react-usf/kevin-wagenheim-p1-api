export class Reimbursments{

    id: number;
    amount: number;
    submitted: string;
    resolved: string;
    description: string;
    authorId: number;
    resolverId: number;
    reimbStatusId: number;
    reimbTypeId: number;

    constructor(id: number, amount: number, submitted: string, resolved: string, description: string, authorId: number, resolverId: number, reimbStatusId: number, reimbTypeId: number){

        this.id = id;
        this.amount = amount;
        this.submitted = submitted;
        this.resolved = resolved;
        this.description = description;
        this.authorId = authorId;
        this.resolverId = resolverId;
        this.reimbStatusId = reimbStatusId;
        this.reimbTypeId = reimbTypeId;

    }

}