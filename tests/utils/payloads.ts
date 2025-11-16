export const buildCharacterPayload = (overrides: Record<string, unknown> = {}) => ({
    id: "template_character",
    name: "Template Character",
    rarity: 4,
    region: "Mondstadt",
    element: "Anemo",
    weaponType: "Sword",
    versionAdded: "1.0",
    releaseDate: "2020-09-28",
    description: "Automated test character payload.",
    constellations: [
        { level: 1, name: "C1", description: "Constellation one." },
        { level: 2, name: "C2", description: "Constellation two." },
    ],
    stats: {
        baseHP: 1000,
        baseATK: 20,
        baseDEF: 60,
        ascensionStats: {
            hpPercentage: 0.1,
            attackPercentage: 0.1,
            defensePercentage: 0.1,
            elementalMastery: 20,
            energyRecharge: 0.1,
            healingBonus: 0,
            critRate: 0.05,
            critDMG: 0.5,
            bonusDMG: 0.1,
        },
    },
    talents: {
        normalAttack: { name: "Normal Attack", description: "Performs consecutive strikes." },
        chargedAttack: { name: "Charged Attack", description: "Performs a charged attack." },
        plungingAttack: { name: "Plunging Attack", description: "Performs a plunging attack." },
        elementSkill: { name: "Elemental Skill", description: "Deals elemental damage.", energyCost: 0, duration: 0, cooldown: 10 },
        elementalBurst: { name: "Elemental Burst", description: "Massive elemental damage.", energyCost: 40, duration: 0, cooldown: 12 },
    },
    ...overrides,
});

export const buildArtifactPayload = (overrides: Record<string, unknown> = {}) => ({
    id: "template_artifact",
    name: "Template Artifact",
    rarity: 5,
    versionAdded: "1.0",
    releaseDate: "2020-09-28",
    region: "Mondstadt",
    setBonus: {
        twoPiece: "Template two-piece bonus.",
        fourPiece: "Template four-piece bonus.",
    },
    ...overrides,
});