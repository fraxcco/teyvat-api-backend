import { Request, Response } from "express";
import { CharacterService } from "../../services/";
import { CharacterQueryDto } from "../../../components/interfaces/";
import { asyncHandler } from "../../../infrastructure/middleware/errorHandler";
import { HTTP_STATUS } from "../../../shared/config/constants";
import { buildPaginatedListResponse } from "../../../shared/utils/httpResponses";

export class CharacterController {
    private characterService: CharacterService = new CharacterService();

    // CRUD Operations
    public createCharacter = asyncHandler(async (req: Request, res: Response) => {
        const character = await this.characterService.createCharacter(req.body);
        
        res.status(HTTP_STATUS.CREATED).json({ success: true, data: character });
    });

    public deleteCharacter = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await this.characterService.deleteCharacter(id);
        
        res.sendStatus(HTTP_STATUS.NO_CONTENT);
    });

    public updateCharacter = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const character = await this.characterService.updateCharacter(id, req.body);
        
        res.status(HTTP_STATUS.OK).json({ success: true, data: character });
    });

    // Read Operations
    public getAllCharacters = asyncHandler(async (req: Request, res: Response) => {
        const query: CharacterQueryDto = req.query;
        const result = await this.characterService.getAllCharacters(query);

        res.status(HTTP_STATUS.OK).json(buildPaginatedListResponse(result.characters.map((character) => character.id), result.page, result.limit, result.total ));
    });

    public getCharacterById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const character = await this.characterService.getCharacterById(String(id));
        
        res.status(HTTP_STATUS.OK).json({ success: true, data: character });
    });
};