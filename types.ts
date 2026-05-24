export interface Agent {
  id: string;
  agentNumber: number;
  name: string;
  description: string;
  origin: string;
  race: string;
  releaseDate: string;
  role: Role;
  abilities: string[];
  difficulty: string;
  beginnerFriendly: boolean;
  imageUrl: string;
  fullImageUrl: string;
}

export interface Role {
  name: string;
  playstyle: string;
  description: string;
  primaryResponsibility: string;
  iconUrl: string;
}

export interface RoleCounts {
  [key: string]: number;
}

export interface AppData {
  agents: Agent[];
  roles: Role[];
  roleCounts: RoleCounts;
}

export interface User {
    _id?: ObjectId;
    username: string;
    password: string;
    role: 'ADMIN' | 'USER';
}

export type RoleFilter = 'all' | 'Duelist' | 'Controller' | 'Sentinel' | 'Initiator';
export type SortKey = 'name' | 'releaseDate';
export type SortDir = 1 | -1;