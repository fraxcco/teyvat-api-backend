import { Request, Response } from "express";
import { ArtifactService } from "../../services/";
import { ArtifactQueryDto } from "../../../components/interfaces/";
import { asyncHandler } from "../../../infrastructure/middleware/errorHandler";
import { HTTP_STATUS } from "../../../shared/config/constants";
import { buildPaginatedListResponse } from "../../../shared/utils/httpResponses";

export class ArtifactController {
	private artifactService: ArtifactService = new ArtifactService();

    // CRUD Operations
	public createArtifact = asyncHandler(async (req: Request, res: Response) => {
		const artifact = await this.artifactService.createArtifact(req.body);

		res.status(HTTP_STATUS.CREATED).json({ success: true, data: artifact });
	});
    
	public deleteArtifact = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await this.artifactService.deleteArtifact(id);

        res.sendStatus(HTTP_STATUS.NO_CONTENT);
    });

    public updateArtifact = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		const artifact = await this.artifactService.updateArtifact(id, req.body);

		res.status(HTTP_STATUS.OK).json({ success: true, data: artifact });
	});

    // Read Operations
    public getAllArtifacts = asyncHandler(async (req: Request, res: Response) => {
        const query: ArtifactQueryDto = req.query;
        const result = await this.artifactService.getAllArtifacts(query);

        res.status(HTTP_STATUS.OK).json(buildPaginatedListResponse(result.artifacts.map((artifact) => artifact.id), result.page, result.limit, result.total));
    });

	public getArtifactById = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		const artifact = await this.artifactService.getArtifactById(String(id));

		res.status(HTTP_STATUS.OK).json({ success: true, data: artifact });
	});
};