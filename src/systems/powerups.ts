import { Bomb, Snowflake, Sparkles, MoveHorizontal } from 'lucide-react';
import { BlockData, SpecialType } from '../types';

export interface Special {
  id: SpecialType;
  type: SpecialType;
  icon: any;
  description: string;
  color: string;
}

export const specials: Record<SpecialType, Special> = {
  bomb: {
    id: "bomb",
    type: "bomb",
    icon: Bomb,
    description: "Explode 3x3 blocos",
    color: "from-red-400 to-red-600",
  },
  freeze: {
    id: "freeze",
    type: "freeze",
    icon: Snowflake,
    description: "Congela blocos por 3 turnos",
    color: "from-blue-300 to-blue-500",
  },
  double: {
    id: "double",
    type: "double",
    icon: Sparkles,
    description: "Duplica valor do bloco alvo",
    color: "from-yellow-300 to-yellow-500",
  },
  teleport: {
    id: "teleport",
    type: "teleport",
    icon: MoveHorizontal,
    description: "Move bloco para outra coluna",
    color: "from-purple-300 to-purple-500",
  }
};
