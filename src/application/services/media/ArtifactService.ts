import { IArtifact } from "../../../components/interfaces/";
import { ArtifactQueryDto } from "../../../components/interfaces/";
import { ArtifactRepository } from "../../repositories/";
import { CustomError } from "../../../infrastructure/middleware/errorHandler";
import { HTTP_STATUS } from "../../../shared/config/constants";
import { removeMongoID } from "../../../shared/utils/mongoSanitizer";
import { normalizePaginationQuery } from "../../../shared/utils/pagination";

export class ArtifactService {
    private artifactRepository: ArtifactRepository = new ArtifactRepository();

    // CRUD Operations
    public async createArtifact(artifactData: Partial<IArtifact>): Promise<IArtifact> {
        const existingArtifact = await this.artifactRepository.findOne({ id: artifactData.id });
        
        if(existingArtifact) {
            throw new CustomError("Artifact with this ID already exists", HTTP_STATUS.CONFLICT);
        };

        const created = await this.artifactRepository.create(artifactData);
        const plain = typeof created.toObject === "function" ? created.toObject({ versionKey: false }) : created;
        return removeMongoID<IArtifact>(plain as IArtifact);
    };
    
    public async deleteArtifact(id: string): Promise<void> {
        const existingArtifact = await this.artifactRepository.findById(id);
        
        if(!existingArtifact) {
            throw new CustomError("Artifact not found", HTTP_STATUS.NOT_FOUND);
        };

        const deletedArtifact = await this.artifactRepository.delete(id);
        
        if(!deletedArtifact) {
            throw new CustomError("Failed to delete artifact", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        };
    };

    public async updateArtifact(id: string, updateData: Partial<IArtifact>): Promise<IArtifact> {
        const existingArtifact = await this.artifactRepository.findById(id);
        
        if(!existingArtifact) {
            throw new CustomError("Artifact not found", HTTP_STATUS.NOT_FOUND);
        };

        if(updateData.id && String(updateData.id).toLowerCase() !== String(id).toLowerCase()) {
            throw new CustomError("Artifact ID cannot be modified", HTTP_STATUS.BAD_REQUEST);
        };

        const updatedArtifact = await this.artifactRepository.update(id, updateData);
        
        if(!updatedArtifact) {
            throw new CustomError("Failed to update artifact", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        };

        const plain = typeof updatedArtifact.toObject === "function" ? updatedArtifact.toObject({ versionKey: false }) : updatedArtifact;
        return removeMongoID<IArtifact>(plain as IArtifact);
    };

    // Read Operations
    public async getAllArtifacts(query: ArtifactQueryDto): Promise<{ artifacts: IArtifact[]; total: number; page: number; limit: number; totalPages: number }> {
        const { page, limit, sortBy, sortOrder } = normalizePaginationQuery(query, {
            allowedSortFields: ["name", "rarity", "region", "releaseDate", "versionAdded"] as const,
            defaultSortBy: "name",
        });

        const { artifacts, total } = await this.artifactRepository.findWithPagination({
            ...query,
            page,
            limit,
            sortBy,
            sortOrder,
        });

        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        return { artifacts, total, page, limit, totalPages };
    };

    public async getArtifactById(id: string): Promise<IArtifact> {
        const artifact = await this.artifactRepository.findById(String(id).toLowerCase());
        
        if(!artifact) {
            throw new CustomError("Artifact not found", HTTP_STATUS.NOT_FOUND);
        };

        return removeMongoID<IArtifact>(artifact);
    };
};