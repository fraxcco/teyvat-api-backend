import { FilterQuery } from "mongoose";
import { HTTP_STATUS } from "../../../shared/config/";
import { UserPublic, UserRepository } from "../../repositories/";
import { CustomError } from "../../../infrastructure/middleware";
import { IUser } from "../../../components/interfaces";

export class UserService {
    private userRepository: UserRepository = new UserRepository();

    public async updateUser(id: string, updateData: { username?: string; email?: string }): Promise<UserPublic> {
        const existingUser = await this.userRepository.findById(id);

        if(!existingUser) {
            throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
        }

        if(updateData.email || updateData.username) {
            const baseFilter: FilterQuery<IUser> = { _id: { $ne: id } };

            if(updateData.email && updateData.username) {
                baseFilter.$or = [{ email: updateData.email }, { username: updateData.username }];
            } else if(updateData.email) {
                baseFilter.email = updateData.email;
            } else if(updateData.username) {
                baseFilter.username = updateData.username;
            }

            const conflict = await this.userRepository.findOne(baseFilter);

            if(conflict) {
                throw new CustomError("Email or username already exists", HTTP_STATUS.CONFLICT);
            }
        }

        return (await this.userRepository.update(id, updateData)) as UserPublic;
    }

    public async getUserById(id: string): Promise<UserPublic> {
        const user = await this.userRepository.findById(id);

        if(!user) {
            throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
        }

        return user;
    }

    public async getAllUsers(): Promise<UserPublic[]> {
        return await this.userRepository.findAll();
    }
}