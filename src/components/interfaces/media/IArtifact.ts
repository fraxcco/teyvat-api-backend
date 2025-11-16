import { Document } from "mongoose";

export interface IArtifact extends Document {
    id: string;
    name:
        | "Initiate" | "Adventurer" | "Lucky Dog" | "Traveling Doctor" | "Resolution of Sojourner" | "Tiny Miracle" | "Berserker" | "Instructor" | "The Exile" | "Defender's Will" | "Brave Heart" | "Martial Artist" | "Gambler" | "Scholar" | "Prayers for Wisdom" | "Prayers for Destiny" | "Prayers for Illumination" | "Prayers to Springtime"
        | "Gladiator's Finale" | "Wanderer's Troupe" | "Maiden Beloved" | "Viridescent Venerer" | "Thundersoother" | "Thundering Fury" | "Blizzard Strayer" | "Heart of Depth"
        | "Pale Flame" | "Lavawalker" | "Archaic Petra" | "Noblesse Oblige" | "Retracing Bolide" | "Bloodstained Chivalry" | "Crimson Witch of Flames" | "Tenacity of the Millelith" | "Vermillion Hereafter" | "Echoes of an Offering"
        | "Shimenawa's Reminiscence" | "Emblem of Severed Fate" | "Husk of Opulent Dreams" | "Ocean-Hued Clam"
        | "Deepwood Memories" | "Gilded Dreams" | "Nymph's Dream" | "Desert Pavilion Chronicle" | "Flower of Paradise Lost" | "Vourukasha's Glow"
        | "Marechaussee Hunter" | "Golden Troupe" | "Song of Days Past" | "Nighttime Whispers in the Echoing Woods" | "Fragment of Harmonic Whimsy" | "Unfinished Reverie"
        | "Scroll of the Hero of Cinder City" | "Obsidian Codex" | "Finale of the Deep Galleries" | "Long Night's Oath"
        | "Night of the Sky's Unveiling" | "Silken Moon's Serenade";
    rarity: 3 | 4 | 5;
    region: "Mondstadt" | "Liyue" | "Inazuma" | "Sumeru" | "Fontaine" | "Natlan" | "Nod-Krai" | "Snezhnaya";
    versionAdded: string;
    releaseDate: Date;
    setBonus: {
        twoPiece: string;
        fourPiece: string;
    };
};