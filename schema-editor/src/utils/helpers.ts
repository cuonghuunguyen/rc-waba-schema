import type { BotConfig, Connection } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getConnections = (config: BotConfig): Connection[] => {
  const connections: Connection[] = [];
  
  Object.keys(config).forEach(sourceId => {
    const nodeData = config[sourceId];

    // Handle array of items (each can be IBotResponse or IBotResponseRef)
    if (Array.isArray(nodeData)) {
      nodeData.forEach((item, rIdx) => {
        // Handle reference items
        if ('ref' in item) {
          connections.push({
            id: `${sourceId}-ref-${rIdx}`,
            source: sourceId,
            target: item.ref,
            label: "Ref",
            type: "reference"
          });
          return;
        }
        
        // Handle response items with buttons
        if ('buttons' in item && item.buttons) {
          item.buttons.forEach((btn, bIdx) => {
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
        
        // Handle response items with list
        if ('list' in item && item.list) {
          item.list.forEach((listItem, iIdx) => {
            if (listItem.payload) {
              connections.push({
                id: `${sourceId}-list-${rIdx}-${iIdx}`,
                source: sourceId,
                target: listItem.payload,
                label: typeof listItem.title === 'string' ? listItem.title : listItem.title?.en || 'Link',
                type: "standard"
              });
            }
          });
        }
      });
    }
  });
  
  return connections;
};

