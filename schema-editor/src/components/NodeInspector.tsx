import { CornerDownRight, Globe, LinkIcon, PhoneForwarded, Plus, Settings, Trash2, X, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { SYSTEM_NODES } from '../constants';
import type { IBotResponse, IBotResponseRef, NodeInspectorProps } from '../types';
import { LocalizedInput } from './LocalizedInput';

export const NodeInspector: React.FC<NodeInspectorProps> = ({ 
  nodeId, 
  data, 
  allNodeIds, 
  onChange, 
  onDelete, 
  onRename 
}) => {
  const [activeTab, setActiveTab] = useState(0); // For multiple response bubbles

  if (!nodeId) {
    return (
      <div className="w-80 bg-white border-l p-6 text-slate-400 text-center mt-20">
        Select a node to edit
      </div>
    );
  }

  const isSystem = SYSTEM_NODES.includes(nodeId);
  const responses = Array.isArray(data) ? data : [];

  // --- Response Handlers ---
  const updateResponse = (index: number, newItem: IBotResponse | IBotResponseRef) => {
    if (!Array.isArray(data)) return;
    const newData = [...data];
    newData[index] = newItem;
    onChange(nodeId, newData);
  };

  const updateResponseField = (index: number, field: string, value: unknown) => {
    if (!Array.isArray(data)) return;
    const currentItem = data[index];
    if ('ref' in currentItem) return; // Don't update fields on ref items
    const newData = [...data];
    newData[index] = { ...currentItem, [field]: value } as IBotResponse;
    onChange(nodeId, newData);
  };

  const addResponse = (isRef: boolean = false) => {
    if (!Array.isArray(data)) return;
    const newItem: IBotResponse | IBotResponseRef = isRef 
      ? { ref: "" } 
      : { text: "New message" };
    const newData = [...data, newItem];
    onChange(nodeId, newData);
    setActiveTab(newData.length - 1);
  };

  const removeResponse = (index: number) => {
    if (!Array.isArray(data)) return;
    const newData = data.filter((_, i) => i !== index);
    onChange(nodeId, newData);
    setActiveTab(Math.max(0, Math.min(activeTab, newData.length - 1)));
  };

  const toggleResponseType = (index: number) => {
    if (!Array.isArray(data)) return;
    const currentItem = data[index];
    const newItem: IBotResponse | IBotResponseRef = 'ref' in currentItem
      ? { text: "New message" }
      : { ref: "" };
    updateResponse(index, newItem);
  };

  const currentItem = responses[activeTab];
  const isCurrentItemRef = currentItem && 'ref' in currentItem;

  return (
    <div className="w-96 bg-white border-l flex flex-col h-full shadow-xl z-20">
      <div className="p-4 border-b bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="font-bold text-lg text-slate-800">Edit Node</h2>
            <div className="text-xs text-slate-500">ID: {nodeId}</div>
          </div>
          {!isSystem && (
            <button onClick={() => onDelete(nodeId)} className="text-red-500 hover:bg-red-50 p-1 rounded">
              <Trash2 size={16} />
            </button>
          )}
        </div>
        {!isSystem && (
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs">Rename:</label>
            <input
              type="text"
              className="border rounded px-2 py-1 text-xs flex-1"
              defaultValue={nodeId}
              onBlur={(e) => {
                if(e.target.value && e.target.value !== nodeId) onRename(nodeId, e.target.value);
              }}
            />
          </div>
        )}
      </div>

      {/* Response Bubble Tabs */}
      <div className="flex overflow-x-auto border-b px-2 pt-2 gap-1 bg-slate-50">
        {responses.map((item, idx) => {
          const isRef = 'ref' in item;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1 text-xs rounded-t border-t border-x flex items-center gap-1 ${activeTab === idx ? 'bg-white font-bold text-blue-600 -mb-px border-b-white' : 'bg-slate-100 text-slate-500'}`}
            >
              {isRef && <LinkIcon size={10} />}
              {isRef ? 'Ref' : 'Resp'} {idx + 1}
            </button>
          );
        })}
        <button onClick={() => addResponse(false)} className="px-2 py-1 text-xs text-blue-500 hover:bg-blue-50 rounded mb-1" title="Add Response">
          <Plus size={14} />
        </button>
        <button onClick={() => addResponse(true)} className="px-2 py-1 text-xs text-orange-500 hover:bg-orange-50 rounded mb-1" title="Add Reference">
          <LinkIcon size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {responses.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-8">No response defined. Add one above.</div>
        ) : !currentItem ? (
          <div className="text-center text-sm text-slate-400 py-8">Select a response tab.</div>
        ) : isCurrentItemRef ? (
          // --- REFERENCE ITEM UI ---
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-800 flex-1">
                <div className="font-bold flex items-center gap-2 mb-1"><LinkIcon size={14}/> Reference</div>
                <p className="text-xs">Points to another node</p>
              </div>
              <button 
                onClick={() => toggleResponseType(activeTab)} 
                className="ml-2 text-xs text-blue-600 hover:underline whitespace-nowrap"
              >
                Switch to Response
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Target Node ID</label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={currentItem.ref}
                onChange={(e) => updateResponse(activeTab, { ref: e.target.value })}
              >
                <option value="">-- Select Target --</option>
                {allNodeIds.filter(id => id !== nodeId).map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button onClick={() => removeResponse(activeTab)} className="text-red-400 text-xs hover:underline">Remove this reference</button>
            </div>
          </div>
        ) : (
          // --- STANDARD RESPONSE ITEM UI ---
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">Response {activeTab + 1}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleResponseType(activeTab)} 
                  className="text-xs text-orange-600 hover:underline"
                >
                  Switch to Ref
                </button>
                <button onClick={() => removeResponse(activeTab)} className="text-red-400 text-xs hover:underline">Remove</button>
              </div>
            </div>

            {/* Text Content */}
            <LocalizedInput
              label="Message Text"
              value={currentItem.text || ""}
              onChange={(val) => updateResponseField(activeTab, 'text', val)}
            />

            {/* Image */}
            <div className="border-t pt-4">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
                <Globe size={12} /> Image URL
              </label>
              <input
                type="text"
                className="w-full text-sm border rounded p-2"
                placeholder="https://example.com/image.png"
                value={typeof currentItem.image === 'string' ? currentItem.image : (currentItem.image as Record<string, string> | undefined)?.en || ""}
                onChange={(e) => updateResponseField(activeTab, 'image', e.target.value)}
              />
            </div>

            {/* Buttons / Edges */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <CornerDownRight size={12} /> Buttons (Navigation)
                </label>
                <button
                  onClick={() => {
                    const btns = currentItem.buttons || [];
                    updateResponseField(activeTab, 'buttons', [...btns, { payload: "", title: "New Button" }]);
                  }}
                  className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                >
                  + Add Button
                </button>
              </div>

              <div className="space-y-3">
                {(currentItem.buttons || []).map((btn, bIdx) => (
                  <div key={bIdx} className="bg-slate-50 p-2 rounded border text-sm">
                    <LocalizedInput
                      label="Button Label"
                      rows={1}
                      value={btn.title}
                      onChange={(val) => {
                        const newBtns = [...(currentItem.buttons || [])];
                        newBtns[bIdx] = { ...newBtns[bIdx], title: val };
                        updateResponseField(activeTab, 'buttons', newBtns);
                      }}
                    />
                    <div className="mt-2">
                      <label className="text-[10px] text-slate-500">Target Node (Payload)</label>
                      <div className="flex gap-1">
                        <select
                          className="flex-1 border rounded p-1 text-sm"
                          value={btn.payload}
                          onChange={(e) => {
                            const newBtns = [...(currentItem.buttons || [])];
                            newBtns[bIdx] = { ...newBtns[bIdx], payload: e.target.value };
                            updateResponseField(activeTab, 'buttons', newBtns);
                          }}
                        >
                          <option value="">Select Target...</option>
                          {allNodeIds.map(id => (
                            <option key={id} value={id}>{id}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const newBtns = (currentItem.buttons || []).filter((_, i) => i !== bIdx);
                            updateResponseField(activeTab, 'buttons', newBtns);
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Transfer / Close */}
            <div className="border-t pt-4">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
                <Settings size={12} /> Special Actions
              </label>
              <div className="space-y-2">
                {/* Transfer Toggle */}
                <div className={`p-2 rounded border ${currentItem.transfer ? 'bg-purple-50 border-purple-200' : 'bg-white'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs flex items-center gap-2"><PhoneForwarded size={12}/> Transfer to Agent</span>
                    <input
                      type="checkbox"
                      checked={!!currentItem.transfer}
                      onChange={(e) => updateResponseField(activeTab, 'transfer', e.target.checked ? { department: "General" } : undefined)}
                    />
                  </div>
                  {currentItem.transfer && (
                    <div className="mt-2">
                      <label className="text-[10px] text-slate-500">Department</label>
                      <input
                        className="w-full border rounded p-1 text-xs"
                        value={currentItem.transfer.department || ""}
                        onChange={(e) => updateResponseField(activeTab, 'transfer', { ...currentItem.transfer, department: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Close Toggle */}
                <div className={`p-2 rounded border ${currentItem.close ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs flex items-center gap-2"><XCircle size={12}/> End Conversation</span>
                    <input
                      type="checkbox"
                      checked={!!currentItem.close}
                      onChange={(e) => updateResponseField(activeTab, 'close', e.target.checked ? { reason: "Completed" } : undefined)}
                    />
                  </div>
                  {currentItem.close && (
                    <div className="mt-2">
                      <label className="text-[10px] text-slate-500">Reason</label>
                      <LocalizedInput
                        label=""
                        rows={1}
                        value={currentItem.close.reason || ""}
                        onChange={(val) => updateResponseField(activeTab, 'close', { ...currentItem.close, reason: val })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
