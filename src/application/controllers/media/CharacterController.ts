import { Request, Response } from "express";
import { buildPaginatedListResponse } from "../../../shared/utils";
import { CharacterService, cacheService } from "../../services";
import { CharacterQueryDto } from "../../../components/interfaces";
import { asyncHandler } from "../../../infrastructure/middleware";
import { HTTP_STATUS } from "../../../shared/config";

export class CharacterController {
    private characterService: CharacterService = new CharacterService();

    public createCharacter = asyncHandler(async (req: Request, res: Response) => {
        const character = await this.characterService.createCharacter(req.body);

        cacheService.flush();
        res.status(HTTP_STATUS.CREATED).json({ success: true, data: character });
    });

    public deleteCharacter = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await this.characterService.deleteCharacter(id);

        cacheService.flush();
        res.sendStatus(HTTP_STATUS.NO_CONTENT);
    });

    public updateCharacter = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const character = await this.characterService.updateCharacter(id, req.body);

        cacheService.flush();
        res.status(HTTP_STATUS.OK).json({ success: true, data: character });
    });

    public getAllCharacters = asyncHandler(async (req: Request, res: Response) => {
        const query: CharacterQueryDto = req.query;
        const cacheKey = `characters_${JSON.stringify(query)}`;
        const cachedResult = cacheService.get(cacheKey);

        if(cachedResult) {
            res.status(HTTP_STATUS.OK).json(cachedResult);

            return;
        }

        const result = await this.characterService.getAllCharacters(query);
        const response = buildPaginatedListResponse(result.characters.map((character) => character.id), result.page, result.limit, result.total);

        cacheService.set(cacheKey, response);
        res.status(HTTP_STATUS.OK).json(response);
    });

    public getCharacterById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const cacheKey = `character_${id}`;
        const cachedResult = cacheService.get(cacheKey);

        if(cachedResult) {
            res.status(HTTP_STATUS.OK).json(cachedResult);
            return;
        }

        const character = await this.characterService.getCharacterById(String(id));
        const response = { success: true, data: character };

        cacheService.set(cacheKey, response);
        res.status(HTTP_STATUS.OK).json(response);
    });
}