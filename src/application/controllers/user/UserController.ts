import { Request, Response } from "express";
import { asyncHandler } from "../../../infrastructure/middleware/errorHandler";
import { HTTP_STATUS } from "../../../shared/config/constants";
import { UserService } from "../../services/";

interface AuthRequest extends Request {
    user: { id: string; email: string; username: string; role: string };
};

const toProfile = (user: any) => ({
    id: user._id,
    role: user.role,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
});

export class UserController {
    constructor(private readonly userService: UserService = new UserService()){};

    public getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
        const users = await this.userService.getAllUsers();
        res.status(HTTP_STATUS.OK).json({ success: true, data: users });
    });

    public getUserById = asyncHandler(async (req: Request, res: Response) => {
        const user = await this.userService.getUserById(req.params.id);
        res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    });

    public getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await this.userService.getUserById(req.user.id);
        res.status(HTTP_STATUS.OK).json({ success: true, data: toProfile(user) });
    });

    public updateCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { username, email } = req.body;
        const user = await this.userService.updateUser(req.user.id, { username, email });
        res.status(HTTP_STATUS.OK).json({ success: true, data: toProfile(user) });
    });
};