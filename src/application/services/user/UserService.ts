import { CustomError } from "../../../infrastructure/middleware/errorHandler";
import { HTTP_STATUS } from "../../../shared/config/constants";
import { UserRepository } from "../../repositories/";

export class UserService {
    private userRepository: UserRepository = new UserRepository();

    public async updateUser(id: string, updateData: { username?: string; email?: string }): Promise<any> {
        const existingUser = await this.userRepository.findById(id);

        if(!existingUser) {
            throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
        };

        if(updateData.email || updateData.username) {
            const baseFilter: any = { _id: { $ne: id } };

            if(updateData.email && updateData.username) {
                baseFilter.$or = [{ email: updateData.email }, { username: updateData.username }];
            } else if(updateData.email) {
                baseFilter.email = updateData.email;
            } else if(updateData.username) {
                baseFilter.username = updateData.username;
            };

            const conflict = await this.userRepository.findOne(baseFilter);

            if(conflict) {
                throw new CustomError("Email or username already exists", HTTP_STATUS.CONFLICT);
            };
        };

        return await this.userRepository.update(id, updateData);
    };

    public async getUserById(id: string): Promise<any> {
        const user = await this.userRepository.findById(id);

        if(!user) {
            throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
        };

        return user;
    };

    public async getAllUsers(): Promise<any[]> {
        return await this.userRepository.findAll();
    };
}