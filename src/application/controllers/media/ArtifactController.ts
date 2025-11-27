import { Request, Response } from "express";
import { buildPaginatedListResponse } from "../../../shared/utils";
import { ArtifactService, cacheService } from "../../services";
import { ArtifactQueryDto } from "../../../components/interfaces";
import { asyncHandler } from "../../../infrastructure/middleware";
import { HTTP_STATUS } from "../../../shared/config";

export class ArtifactController {
	private artifactService: ArtifactService = new ArtifactService();

	public createArtifact = asyncHandler(async (req: Request, res: Response) => {
		const artifact = await this.artifactService.createArtifact(req.body);

		cacheService.flush();
		res.status(HTTP_STATUS.CREATED).json({ success: true, data: artifact });
	});

	public deleteArtifact = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		await this.artifactService.deleteArtifact(id);

		cacheService.flush();
		res.sendStatus(HTTP_STATUS.NO_CONTENT);
	});

	public updateArtifact = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		const artifact = await this.artifactService.updateArtifact(id, req.body);

		cacheService.flush();
		res.status(HTTP_STATUS.OK).json({ success: true, data: artifact });
	});

	public getAllArtifacts = asyncHandler(async (req: Request, res: Response) => {
		const query: ArtifactQueryDto = req.query;
		const cacheKey = `artifacts_${JSON.stringify(query)}`;
		const cachedResult = cacheService.get(cacheKey);

		if(cachedResult) {
			res.status(HTTP_STATUS.OK).json(cachedResult);
			return;
		}

		const result = await this.artifactService.getAllArtifacts(query);
		const response = buildPaginatedListResponse(result.artifacts.map((artifact) => artifact.id), result.page, result.limit, result.total);

		cacheService.set(cacheKey, response);
		res.status(HTTP_STATUS.OK).json(response);
	});

	public getArtifactById = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		const cacheKey = `artifact_${id}`;
		const cachedResult = cacheService.get(cacheKey);

		if(cachedResult) {
			res.status(HTTP_STATUS.OK).json(cachedResult);
			return;
		}

		const artifact = await this.artifactService.getArtifactById(String(id));
		const response = { success: true, data: artifact };

		cacheService.set(cacheKey, response);
		res.status(HTTP_STATUS.OK).json(response);
	});
}