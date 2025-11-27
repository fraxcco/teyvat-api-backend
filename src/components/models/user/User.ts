import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { IUser } from "../../interfaces/";
import { environment } from "../../../shared/config/";

const UserSchema = new mongoose.Schema<IUser>({
    role: { type: String, enum: ["user", "admin"], lowercase: true, default: "user" },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    password: { type: String, required: true, minlength: 8, select: false },
    refreshToken: { type: String, default: null }
}, { timestamps: true, versionKey: false });

UserSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, environment.BCRYPT_SALT_ROUNDS);
    next();
});

export default mongoose.model<IUser>("User", UserSchema);