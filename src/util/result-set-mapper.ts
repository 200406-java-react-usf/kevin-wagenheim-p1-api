import {UserSchema, ReimbSchema} from './schemas';
import {User} from '../models/user';
import {Reimbursments} from '../models/reimb';

export function mapUserResultSet(resultSet: UserSchema): User{

    if(!resultSet){
        return {} as User;
    }

    return new User(

        resultSet.user_id,
        resultSet.username,
        resultSet.password,
        resultSet.first_name,
        resultSet.last_name,
        resultSet.email,
        resultSet.user_role_id

    );

}

export function mapReimbResultSet(resultSet: ReimbSchema): Reimbursments{

    if(!resultSet){
        return {} as Reimbursments;
    }

    return new Reimbursments(

        resultSet.reimb_id,
        resultSet.amount,
        resultSet.submitted,
        resultSet.resolved,
        resultSet.description,
        resultSet.author_id,
        resultSet.resolver_id,
        resultSet.reimb_status_id,
        resultSet.reimb_type_id

    );

}