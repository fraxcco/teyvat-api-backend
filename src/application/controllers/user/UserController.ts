import { Request, Response } from "express";
import { AuthRequest } from "../../../components/interfaces";
import { asyncHandler } from "../../../infrastructure/middleware";
import { HTTP_STATUS } from "../../../shared/config/constants";
import { UserPublic } from "../../repositories";
import { UserService } from "../../services/";

const toProfile = (user: UserPublic) => ({
    id: user._id,
    role: user.role,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
});

export class UserController {
    constructor(private readonly userService: UserService = new UserService()){}

    public getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
        const users = await this.userService.getAllUsers();
        res.status(HTTP_STATUS.OK).json({ success: true, data: users });
    });

    public getUserById = asyncHandler(async (req: Request, res: Response) => {
        const user = await this.userService.getUserById(req.params.id);
        res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    });

    public getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await this.userService.getUserById((req as AuthRequest).user.id);
        res.status(HTTP_STATUS.OK).json({ success: true, data: toProfile(user) });
    });

    public updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
        const { username, email } = req.body;
        const user = await this.userService.updateUser((req as AuthRequest).user.id, { username, email });
        res.status(HTTP_STATUS.OK).json({ success: true, data: toProfile(user) });
    });
}