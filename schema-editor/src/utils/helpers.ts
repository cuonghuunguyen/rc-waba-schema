import type { BotConfig, Connection, IBotResponse } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getConnections = (config: BotConfig): Connection[] => {
  const connections: Connection[] = [];
  
  Object.keys(config).forEach(sourceId => {
    const nodeData = config[sourceId];

    // Handle Reference Nodes
    if (nodeData && !Array.isArray(nodeData) && 'ref' in nodeData) {
      connections.push({
        id: `${sourceId}-ref-${nodeData.ref}`,
        source: sourceId,
        target: nodeData.ref,
        label: "Ref",
        type: "reference"
      });
      return;
    }

    // Handle Standard Array Nodes
        const responses: IBotResponse[] = Array.isArray(nodeData) ? nodeData : [];
    responses.forEach((resp: IBotResponse, rIdx: number) => {
      // Check buttons
      if (resp.buttons) {
        resp.buttons.forEach((btn, bIdx) => {
          if (btn.payload) {
            connections.push({
              id: `${sourceId}-${rIdx}-${bIdx}`,
              source: sourceId,
              target: btn.payload,
              label: typeof btn.title === 'string' ? btn.title : btn.title?.en || 'Link',
              type: "standard"
            });
          }
        });
      }
      
      // Check list items
      if (resp.list) {
        resp.list.forEach((item, iIdx) => {
          if (item.payload) {
            connections.push({
              id: `${sourceId}-list-${rIdx}-${iIdx}`,
              source: sourceId,
              target: item.payload,
              label: typeof item.title === 'string' ? item.title : item.title?.en || 'Link',
              type: "standard"
            });
          }
        });
      }
    });
  });
  
  return connections;
};
