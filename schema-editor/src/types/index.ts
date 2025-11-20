// Type definitions for the Bot Flow Builder application
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import botSchema from '../../../bot-response.json';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateSchema = ajv.compile(botSchema);

export type Localizable = { [lang: string]: string } | string;

export interface IWhatsAppButton {
  payload: string;
  title: Localizable;
}

export interface IWhatsAppListItem {
  payload: string;
  title: Localizable;
  description?: Localizable;
}

export interface ActionTransferRoom {
  department: string;
  fallbackDepartment?: string;
  conditions?: {
    startBusinessHour?: string; // Format: HH:MM
    stopBusinessHour?: string;  // Format: HH:MM
    workDays?: ('mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa' | 'su')[];
  };
  welcomeMessage?: Localizable;
}

export interface ActionCloseRoom {
  reason?: Localizable;
}

export interface ActionSelectLanguage {
  language: 'ar' | 'en';
}

export interface IBotResponse {
  text?: Localizable;
  buttons?: IWhatsAppButton[];
  list?: IWhatsAppListItem[];
  image?: Localizable;
  imageCaption?: Localizable;
  transfer?: ActionTransferRoom;
  close?: ActionCloseRoom;
  selectLanguage?: ActionSelectLanguage;
}

export interface IBotResponseRef {
  ref: string;
}

export type BotNode = IBotResponse[] | IBotResponseRef;

export interface BotConfig {
  greeting: IBotResponse[];
  selectLanguage: IBotResponse[];
  wrongSelection: IBotResponse[];
  technicalError: IBotResponse[];
  [nodeId: string]: BotNode;
}

// UI-specific types
export interface Connection {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'standard' | 'reference';
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export interface VisualNode extends NodePosition {
  data: BotNode;
  preview: string;
  isRef: boolean;
}

export interface FlowCanvasProps {
  nodes: VisualNode[];
  connections: Connection[];
  onNodeSelect: (nodeId: string) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  selectedNodeId: string | null;
}

export interface NodeInspectorProps {
  nodeId: string | null;
  data: BotNode;
  allNodeIds: string[];
  onChange: (nodeId: string, newData: BotNode) => void;
  onDelete: (nodeId: string) => void;
  onRename: (oldId: string, newId: string) => void;
}

export interface ChatSimulatorProps {
  config: BotConfig;
  isOpen: boolean;
  onClose: () => void;
}

export interface LocalizedInputProps {
  value: Localizable;
  onChange: (value: Localizable) => void;
  label: string;
  rows?: number;
}

export interface ChatMessage {
  type: 'bot' | 'user';
  text?: string;
  data?: IBotResponse;
}

// Validation utilities using AJV
export const validateBotConfig = (config: BotConfig): { valid: boolean; errors: string[] } => {
  const isValid = validateSchema(config);
  
  if (isValid) {
    return { valid: true, errors: [] };
  }
  
  const errors = validateSchema.errors?.map(err => {
    const path = err.instancePath || '/';
    const message = err.message || 'Unknown error';
    return `${path}: ${message}`;
  }) || ['Validation failed'];
  
  return { valid: false, errors };
};
