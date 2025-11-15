import User from "../../../components/models/user/User";
import { IUser } from "../../../components/interfaces/user/IUser";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

type UserPublic = Omit<IUser, "password">;

const toPublic = (user: any): UserPublic => {
    if(!user) return user;
    const obj = typeof user.toObject === "function" ? user.toObject() : user;

    delete (obj as any).password;
    return obj;
};

export class UserRepository {
    public async create(userData: Partial<IUser>): Promise<UserPublic> {
        const user = await User.create(userData);
        return toPublic(user);
    };

    public async delete(id: string): Promise<UserPublic | null> {
        const deleted = await User.findByIdAndDelete(id).lean<IUser>();
        return deleted ? toPublic(deleted) : null;
    };

    public async update(id: string, updateData: UpdateQuery<IUser>): Promise<UserPublic | null> {
        const updated = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean<IUser>();
        return updated ? toPublic(updated) : null;
    };

    public async findById(id: string): Promise<UserPublic | null> {
        const user = await User.findById(id).select("-password").lean<IUser>();
        return user ? toPublic(user) : null;
    };

    public async findOne(filter: FilterQuery<IUser>): Promise<UserPublic | null> {
        const user = await User.findOne(filter).select("-password").lean<IUser>();
        return user ? toPublic(user) : null;
    };

    public async findAll(filter: FilterQuery<IUser> = {}, options: QueryOptions = {}): Promise<UserPublic[]> {
        const users = await User.find(filter, null, options).select("-password").lean<IUser[]>();
        return users.map(toPublic);
    };
};