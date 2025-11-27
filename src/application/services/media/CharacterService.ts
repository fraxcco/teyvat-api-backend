import { removeMongoID, normalizePaginationQuery } from "../../../shared/utils";
import { ICharacter, CharacterQueryDto } from "../../../components/interfaces/";
import { CharacterRepository } from "../../repositories/";
import { CustomError } from "../../../infrastructure/middleware";
import { HTTP_STATUS } from "../../../shared/config/constants";

export class CharacterService {
    private characterRepository: CharacterRepository = new CharacterRepository();

    public async createCharacter(characterData: Partial<ICharacter>): Promise<ICharacter> {
        const existingCharacter = await this.characterRepository.findOne({ id: characterData.id });
        
        if(existingCharacter) {
            throw new CustomError("Character with this ID already exists", HTTP_STATUS.CONFLICT);
        }

        const created = await this.characterRepository.create(characterData);
        const plain = typeof created.toObject === "function" ? created.toObject({ versionKey: false }) : created;
        return removeMongoID<ICharacter>(plain as ICharacter);
    }
    
    public async deleteCharacter(id: string): Promise<void> {
        const existingCharacter = await this.characterRepository.findById(id);
        
        if(!existingCharacter) {
            throw new CustomError("Character not found", HTTP_STATUS.NOT_FOUND);
        }

        const deletedCharacter = await this.characterRepository.delete(id);
        
        if(!deletedCharacter) {
            throw new CustomError("Failed to delete character", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    
    public async updateCharacter(id: string, updateData: Partial<ICharacter>): Promise<ICharacter> {
        const existingCharacter = await this.characterRepository.findById(id);
        
        if(!existingCharacter) {
            throw new CustomError("Character not found", HTTP_STATUS.NOT_FOUND);
        }

        if(updateData.id && String(updateData.id).toLowerCase() !== String(id).toLowerCase()) {
            throw new CustomError("Character ID cannot be modified", HTTP_STATUS.BAD_REQUEST);
        }

        const updatedCharacter = await this.characterRepository.update(id, updateData);
        
        if(!updatedCharacter) {
            throw new CustomError("Failed to update character", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const plain = typeof updatedCharacter.toObject === "function" ? updatedCharacter.toObject({ versionKey: false }) : updatedCharacter;
        return removeMongoID<ICharacter>(plain as ICharacter);
    }

    public async getAllCharacters(query: CharacterQueryDto): Promise<{ characters: ICharacter[]; total: number; page: number; limit: number; totalPages: number }> {
        const { page, limit, sortBy, sortOrder } = normalizePaginationQuery(query, {
            allowedSortFields: ["name", "rarity", "region", "element", "weaponType", "releaseDate", "versionAdded"] as const,
            defaultSortBy: "name",
        });

        const { characters, total } = await this.characterRepository.findWithPagination({
            ...query,
            page,
            limit,
            sortBy,
            sortOrder,
        });

        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        return { characters, total, page, limit, totalPages };
    }

    public async getCharacterById(id: string): Promise<ICharacter> {
        const character = await this.characterRepository.findById(String(id).toLowerCase());

        if(!character) {
            throw new CustomError("Character not found", HTTP_STATUS.NOT_FOUND);
        }

        return removeMongoID<ICharacter>(character);
    }
}