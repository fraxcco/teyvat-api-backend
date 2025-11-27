import { Document } from "mongoose";

export interface IArtifact extends Partial<Document> {
    id: string;
    name: string;
    rarity: 3 | 4 | 5;
    region: "Mondstadt" | "Liyue" | "Inazuma" | "Sumeru" | "Fontaine" | "Natlan" | "Nod-Krai" | "Snezhnaya" | "None";
    versionAdded: string;
    releaseDate: Date;
    setBonus: {
        twoPiece: string;
        fourPiece: string;
    };
}