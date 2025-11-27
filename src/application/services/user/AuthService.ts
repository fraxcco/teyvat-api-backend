import bcrypt from "bcrypt";
import { AuthRepository } from "../../repositories/";
import { HTTP_STATUS, environment } from "../../../shared/config/";
import { CustomError } from "../../../infrastructure/middleware";
import { hashToken } from "../../../shared/utils/hashToken";
import { IUser } from "../../../components/interfaces/";

export class AuthService {
    private readonly authRepository = new AuthRepository();

    public async registerUser(userData: { username: string; email: string; password: string; role?: string }): Promise<IUser> {
        const existing = await this.authRepository.findOne({ $or: [{ email: userData.email }, { username: userData.username }] });

        if(existing) {
            throw new CustomError("User with this email or username already exists", HTTP_STATUS.CONFLICT);
        }

        const isTestEnv = environment.NODE_ENV === "test";
        const normalizedRole = userData.role ? String(userData.role).toLowerCase() : undefined;

        if(!isTestEnv && normalizedRole) {
            throw new CustomError("Role assignment is only allowed in test environment", HTTP_STATUS.FORBIDDEN);
        }

        if(normalizedRole && !["user", "admin"].includes(normalizedRole)) {
            throw new CustomError("Invalid role supplied", HTTP_STATUS.BAD_REQUEST);
        }

        const payload: Partial<IUser> = {
            email: userData.email,
            username: userData.username,
            password: userData.password,
            role: isTestEnv && normalizedRole ? normalizedRole : "user",
        };

        return await this.authRepository.create(payload);
    }

    public async authenticateUser(credential: string, password: string): Promise<IUser> {
        const user = await this.authRepository.findByCredential(credential);

        if(!user) {
            throw new CustomError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            throw new CustomError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
        }

        return user;
    }

    public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.authRepository.findByIdWithPassword(userId);

        if(!user) {
            throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
        }

        if(!newPassword || newPassword.length < 8) {
            throw new CustomError("New password must be at least 8 characters long", HTTP_STATUS.BAD_REQUEST);
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if(!isCurrentPasswordValid) {
            throw new CustomError("Current password is incorrect", HTTP_STATUS.BAD_REQUEST);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, environment.BCRYPT_SALT_ROUNDS);
        await this.authRepository.updatePassword(userId, hashedNewPassword);
    }

    public async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
        await this.authRepository.setRefreshToken(userId, refreshToken);
    }

    public async revokeRefreshToken(refreshToken: string): Promise<void> {
        const hashed = hashToken(refreshToken);
        await this.authRepository.clearRefreshTokenByToken(hashed);
    }

    public async revokeRefreshTokenForUser(userId: string): Promise<void> {
        await this.authRepository.clearRefreshTokenByUserId(userId);
    }

    public async findByRefreshToken(hashedToken: string): Promise<IUser | null> {
        return await this.authRepository.findByRefreshToken(hashedToken);
    }
}