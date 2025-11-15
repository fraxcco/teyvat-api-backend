import Artifact from "../../../components/models/media/Artifact";
import { IArtifact } from "../../../components/interfaces/";
import { environment } from "../../../shared/config/environment";
import { ArtifactQueryDto } from "../../../components/interfaces/";
import { applyDateLikeFilter } from "../../../shared/utils/dateFilters";
import { buildMongoPagination } from "../../../shared/utils/pagination";
import { applyExactMatchFilter } from "../../../shared/utils/mongoFilters";
import { normalizeDocumentId } from "../../../shared/utils/mongoSanitizer";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

export class ArtifactRepository {
    // CRUD Operations
    public async create(artifactData: Partial<IArtifact>): Promise<IArtifact> {
        const artifact = new Artifact(artifactData);
        return await artifact.save();
    };

    public async delete(id: string): Promise<IArtifact | null> {
        const filter = normalizeDocumentId({ id }, "id");
        return await Artifact.findOneAndDelete(filter);
    };

    public async update(id: string, updateData: UpdateQuery<IArtifact>): Promise<IArtifact | null> {
        const filter = normalizeDocumentId({ id }, "id");
        return await Artifact.findOneAndUpdate(filter, updateData, { new: true, runValidators: true });
    };

    // Read Operations
    public async findById(id: string): Promise<IArtifact | null> {
        const filter = normalizeDocumentId({ id }, "id");
        return await Artifact.findOne(filter).lean<IArtifact>();
    };

    public async findOne(filter: FilterQuery<IArtifact>): Promise<IArtifact | null> {
        const normalizedFilter = normalizeDocumentId(filter, "id");
        return await Artifact.findOne(normalizedFilter).lean<IArtifact>();
    };

    /**
     * sortBy: name, rarity, region, releaseDate, versionAdded
     * sortOrder: asc, desc
     */
    public async findWithPagination(query: ArtifactQueryDto, filter: FilterQuery<IArtifact> = {}): Promise<{ artifacts: IArtifact[]; total: number }> {
        const { page, limit, rarity, region, sortBy, sortOrder } = query;

        const queryAny = query as Record<string, unknown>;
        const nameFilter = typeof queryAny.name === "string" ? queryAny.name : undefined;
        const versionAddedFilter = typeof queryAny.versionAdded === "string" ? queryAny.versionAdded : undefined;
        const releaseDateFilter = queryAny.releaseDate;

        const normalizedFilter: FilterQuery<IArtifact> = { ...filter };
        const filterRecord = normalizedFilter as Record<string, unknown>;

        if(rarity !== undefined && rarity !== null) {
            normalizedFilter.rarity = Number(rarity);
        };

        applyExactMatchFilter(filterRecord, "name", nameFilter);
        applyExactMatchFilter(filterRecord, "region", region);
        applyExactMatchFilter(filterRecord, "versionAdded", versionAddedFilter);
        applyDateLikeFilter<IArtifact>(normalizedFilter, "releaseDate", releaseDateFilter);

        const options: QueryOptions = {
            collation: { locale: "en", strength: 2 },
        };

        const { skip, limit: pageLimit, sort } = buildMongoPagination({
            page: Number(page) || 1,
            limit: Number(limit) || environment.DEFAULT_PAGE_SIZE,
            sortBy: (sortBy as string) || "name",
            sortOrder: (sortOrder as "asc" | "desc") || "asc",
            secondarySort: "name",
        });

        const [rows, total] = await Promise.all([
            Artifact.find(normalizedFilter, null, options).sort(sort).skip(skip).limit(pageLimit).lean<IArtifact[]>(),
            Artifact.countDocuments(normalizedFilter),
        ]);

        const artifacts = (rows ?? []).map((artifact: any) => normalizeDocumentId(artifact)) as IArtifact[];

        return { artifacts, total };
    };
};