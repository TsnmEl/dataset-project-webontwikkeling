export type Difficulty = 'easy' | 'medium' | 'hard';

export type RolePlaystyle = 'offensive' | 'tactical' | 'support' | 'defensive';

export interface AgentRole {
    id: string;
    name: string;
    playstyle: RolePlaystyle;
    iconUrl: string;
}

export interface Agent {
    id: string;
    agentNumber: number;
    name: string;
    description: string;
    origin: string;
    race: boolean;
    releaseDate: string;
    imageUrl: string;
    fullImageUrl: string;
    difficulty: Difficulty;
    abilities: string[];
    role: AgentRole;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    playstyle: RolePlaystyle;
    recommendedForBeginners: boolean;
    primaryResponsibility: string;
}