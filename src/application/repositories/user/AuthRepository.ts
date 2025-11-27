import { FilterQuery } from "mongoose";
import { escapeRegex } from "../../../shared/utils";
import { IUser } from "../../../components/interfaces/";
import User from "../../../components/models/user/User";

export class AuthRepository {
    public async create(userData: Partial<IUser>): Promise<IUser> {
        const user = await User.create(userData);
        return user.toObject();
    }

    public async findByIdWithPassword(id: string): Promise<IUser | null> {
        return await User.findById(id).select("+password").lean<IUser>();
    }

    public async findOne(filter: FilterQuery<IUser>): Promise<IUser | null> {
        return await User.findOne(filter).select("+password").lean<IUser>();
    }

    public async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
        await User.updateOne({ _id: userId }, { $set: { refreshToken } });
    }

    public async clearRefreshTokenByToken(refreshToken: string): Promise<void> {
        await User.updateOne({ refreshToken }, { $unset: { refreshToken: "" } }).exec();
    }

    public async clearRefreshTokenByUserId(userId: string): Promise<void> {
        await User.updateOne({ _id: userId }, { $unset: { refreshToken: "" } }).exec();
    }

    public async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
        return await User.findOne({ refreshToken }).select("+password").lean<IUser>();
    }

    public async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
    }

    public async findByCredential(credential: string): Promise<IUser | null> {
        const trimmed = credential.trim();
        
        if(!trimmed) return null;

        const isEmail = trimmed.includes("@");
        const query = isEmail ? { email: trimmed.toLowerCase() } : { username: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, "i") } };

        return User.findOne(query).select("+password").lean<IUser>().exec();
    }
}