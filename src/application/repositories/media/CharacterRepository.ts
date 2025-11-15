import Character from "../../../components/models/media/Character";
import { ICharacter } from "../../../components/interfaces/";
import { environment } from "../../../shared/config/environment";
import { CharacterQueryDto } from "../../../components/interfaces/";
import { applyDateLikeFilter } from "../../../shared/utils/dateFilters";
import { buildMongoPagination } from "../../../shared/utils/pagination";
import { normalizeDocumentId } from "../../../shared/utils/mongoSanitizer";
import { applyExactMatchFilter } from "../../../shared/utils/mongoFilters";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

export class CharacterRepository {
    // CRUD Operations
    async create(characterData: Partial<ICharacter>): Promise<ICharacter> {
        const character = new Character(characterData);
        return await character.save();
    };

    async delete(id: string): Promise<ICharacter | null> {
        const filter = normalizeDocumentId({ id }, "id");
        return await Character.findOneAndDelete(filter);
    };

    async update(id: string, updateData: UpdateQuery<ICharacter>): Promise<ICharacter | null> {
        const filter = normalizeDocumentId({ id }, "id");
        return await Character.findOneAndUpdate(filter, updateData, { new: true, runValidators: true });
    };

    // Read Operations
    async findById(id: string): Promise<ICharacter | null> {
        const filter = normalizeDocumentId({ id }, "id");
        return await Character.findOne(filter).lean<ICharacter>();
    };

    async findOne(filter: FilterQuery<ICharacter>): Promise<ICharacter | null> {
        const normalizedFilter = normalizeDocumentId(filter, "id");
        return await Character.findOne(normalizedFilter).lean<ICharacter>();
    };

    /**
     * sortBy: name, rarity, region, element, weaponType, releaseDate, versionAdded
     * sortOrder: asc, desc
     */
    async findWithPagination(query: CharacterQueryDto, filter: FilterQuery<ICharacter> = {}): Promise<{ characters: ICharacter[]; total: number }> {
        const { page, limit, rarity, region, element, weaponType, sortBy, sortOrder } = query;
        const queryAny = query as Record<string, unknown>;
        const nameFilter = typeof queryAny.name === "string" ? queryAny.name : undefined;
        const versionAddedFilter = typeof queryAny.versionAdded === "string" ? queryAny.versionAdded : undefined;
        const releaseDateFilter = queryAny.releaseDate;

        const normalizedFilter: FilterQuery<ICharacter> = { ...filter };
        const filterRecord = normalizedFilter as Record<string, unknown>;

        if(rarity !== undefined && rarity !== null) {
            normalizedFilter.rarity = Number(rarity);
        };

        applyExactMatchFilter(filterRecord, "name", nameFilter);
        applyExactMatchFilter(filterRecord, "region", region);
        applyExactMatchFilter(filterRecord, "element", element);
        applyExactMatchFilter(filterRecord, "weaponType", weaponType);
        applyExactMatchFilter(filterRecord, "versionAdded", versionAddedFilter);
        applyDateLikeFilter<ICharacter>(normalizedFilter, "releaseDate", releaseDateFilter);

        const options: QueryOptions = {
            collation: { locale: "en", strength: 2 },
        };

        const { skip, limit: limitNum, sort } = buildMongoPagination({
            page: page ?? 1,
            limit: limit ?? environment.DEFAULT_PAGE_SIZE,
            sortBy: sortBy ?? "name",
            sortOrder: sortOrder ?? "asc",
            secondarySort: "name",
        });

        const [rows, total] = await Promise.all([
            Character.find(normalizedFilter, null, options).sort(sort).skip(skip).limit(limitNum).lean<ICharacter[]>(),
            Character.countDocuments(normalizedFilter),
        ]);

        const characters = (rows ?? []).map((character: any) => normalizeDocumentId(character)) as ICharacter[];

        return { characters, total };
    };
};