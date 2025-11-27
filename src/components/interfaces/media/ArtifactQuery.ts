import { ArtifactName, ArtifactRarity, ArtifactRegion } from "../../enums/";

export interface ArtifactQueryDto {
    page?: number;
    limit?: number;
    name?: ArtifactName;
    rarity?: ArtifactRarity;
    region?: ArtifactRegion;
    releaseDate?: string;
    versionAdded?: string;
    sortBy?: "name" | "rarity" | "region" | "releaseDate" | "versionAdded";
    sortOrder?: "asc" | "desc";
}