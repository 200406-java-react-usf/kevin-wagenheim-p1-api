import { UserRepository } from "../repos/user-repo";
import { UserService } from "../services/user-services";
import { ReimbRepository } from "../repos/reimb-repo";
import { ReimbServices } from "../services/reimb-services";

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

const reimbRepo = new ReimbRepository();
const reimbService = new ReimbServices(reimbRepo);

export default {
    userService,
    reimbService
}