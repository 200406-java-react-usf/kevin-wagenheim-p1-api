import { UserRepository } from "../repos/user-repo";
import { UserService } from "../services/user-services";

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export default {
    userService
}