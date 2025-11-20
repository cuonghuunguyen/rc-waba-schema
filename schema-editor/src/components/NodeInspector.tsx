import { CornerDownRight, Globe, LinkIcon, PhoneForwarded, Settings, Trash2, X, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { SYSTEM_NODES } from '../constants';
import type { IBotResponse, NodeInspectorProps } from '../types';
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
  const isRef = !Array.isArray(data) && 'ref' in data;

  // Logic to switch between Ref and Standard
  const toggleMode = () => {
    if (isRef) {
      // Switch to Standard (Initialize with basic array)
      onChange(nodeId, [{ text: "New message" }]);
    } else {
      // Switch to Ref (Initialize with empty ref)
      if (window.confirm("Switching to Reference mode will delete current response data. Continue?")) {
        onChange(nodeId, { ref: "" });
      }
    }
  };

  // --- Standard Mode Handlers ---
  const updateResponse = (index: number, field: string, value: unknown) => {
    if (isRef || !Array.isArray(data)) return;
    const newData = [...data];
    if (!newData[index]) newData[index] = {} as IBotResponse;
    (newData[index] as Record<string, unknown>)[field] = value;
    onChange(nodeId, newData);
  };

  const addResponse = () => {
    if (isRef || !Array.isArray(data)) return;
    const newData = [...data, { text: "New message" }];
    onChange(nodeId, newData);
    setActiveTab(newData.length - 1);
  };

  const removeResponse = (index: number) => {
    if (isRef || !Array.isArray(data)) return;
    const newData = data.filter((_, i) => i !== index);
    onChange(nodeId, newData);
    setActiveTab(Math.max(0, activeTab - 1));
  };

  const responses = Array.isArray(data) ? data : [];

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

      {/* Mode Toggle */}
      <div className="px-4 py-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Content Type</span>
          <div className="flex bg-slate-100 rounded p-1">
            <button
              onClick={() => isRef && toggleMode()}
              className={`px-3 py-1 text-xs rounded ${!isRef ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500'}`}
            >
              Standard
            </button>
            <button
              onClick={() => !isRef && toggleMode()}
              className={`px-3 py-1 text-xs rounded ${isRef ? 'bg-white shadow text-orange-600 font-bold' : 'text-slate-500'}`}
            >
              Reference
            </button>
          </div>
        </div>
      </div>

      {isRef ? (
        // --- REFERENCE MODE UI ---
        <div className="p-6 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded p-4 text-sm text-orange-800">
            <div className="font-bold flex items-center gap-2 mb-2"><LinkIcon size={16}/> Reference Node</div>
            <p>This node does not contain its own content. Instead, it points to another node and reuses that node's responses.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Target Node ID</label>
            <select
              className="w-full border rounded p-2 text-sm"
              value={'ref' in data ? data.ref : ""}
              onChange={(e) => onChange(nodeId, { ref: e.target.value })}
            >
              <option value="">-- Select Target --</option>
              {allNodeIds.filter(id => id !== nodeId).map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        // --- STANDARD MODE UI ---
        <>
          {/* Response Bubble Tabs */}
          <div className="flex overflow-x-auto border-b px-2 pt-2 gap-1 bg-slate-50">
            {responses.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1 text-xs rounded-t border-t border-x ${activeTab === idx ? 'bg-white font-bold text-blue-600 -mb-px border-b-white' : 'bg-slate-100 text-slate-500'}`}
              >
                Resp {idx + 1}
              </button>
            ))}
            <button onClick={addResponse} className="px-2 py-1 text-xs text-blue-500 hover:bg-blue-50 rounded mb-1">
              <X size={14} className="rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {responses.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-8">No response defined. Add one above.</div>
            ) : (
              <>
                <div className="flex justify-end">
                  <button onClick={() => removeResponse(activeTab)} className="text-red-400 text-xs hover:underline">Remove this response</button>
                </div>

                {/* Text Content */}
                <LocalizedInput
                  label="Message Text"
                  value={responses[activeTab]?.text || ""}
                  onChange={(val) => updateResponse(activeTab, 'text', val)}
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
                    value={typeof responses[activeTab]?.image === 'string' ? responses[activeTab].image as string : (responses[activeTab]?.image as Record<string, string>)?.en || ""}
                    onChange={(e) => updateResponse(activeTab, 'image', e.target.value)}
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
                        const btns = responses[activeTab]?.buttons || [];
                        updateResponse(activeTab, 'buttons', [...btns, { payload: "", title: "New Button" }]);
                      }}
                      className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                    >
                      + Add Button
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(responses[activeTab]?.buttons || []).map((btn, bIdx) => (
                      <div key={bIdx} className="bg-slate-50 p-2 rounded border text-sm">
                        <LocalizedInput
                          label="Button Label"
                          rows={1}
                          value={btn.title}
                          onChange={(val) => {
                            const newBtns = [...(responses[activeTab].buttons || [])];
                            newBtns[bIdx] = { ...newBtns[bIdx], title: val };
                            updateResponse(activeTab, 'buttons', newBtns);
                          }}
                        />
                        <div className="mt-2">
                          <label className="text-[10px] text-slate-500">Target Node (Payload)</label>
                          <div className="flex gap-1">
                            <select
                              className="flex-1 border rounded p-1 text-sm"
                              value={btn.payload}
                              onChange={(e) => {
                                const newBtns = [...(responses[activeTab].buttons || [])];
                                newBtns[bIdx] = { ...newBtns[bIdx], payload: e.target.value };
                                updateResponse(activeTab, 'buttons', newBtns);
                              }}
                            >
                              <option value="">Select Target...</option>
                              {allNodeIds.map(id => (
                                <option key={id} value={id}>{id}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                const newBtns = (responses[activeTab].buttons || []).filter((_, i) => i !== bIdx);
                                updateResponse(activeTab, 'buttons', newBtns);
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
                    <div className={`p-2 rounded border ${responses[activeTab]?.transfer ? 'bg-purple-50 border-purple-200' : 'bg-white'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs flex items-center gap-2"><PhoneForwarded size={12}/> Transfer to Agent</span>
                        <input
                          type="checkbox"
                          checked={!!responses[activeTab]?.transfer}
                          onChange={(e) => updateResponse(activeTab, 'transfer', e.target.checked ? { department: "General" } : undefined)}
                        />
                      </div>
                      {responses[activeTab]?.transfer && (
                        <div className="mt-2">
                          <label className="text-[10px] text-slate-500">Department</label>
                          <input
                            className="w-full border rounded p-1 text-xs"
                            value={responses[activeTab].transfer?.department || ""}
                            onChange={(e) => updateResponse(activeTab, 'transfer', { ...responses[activeTab].transfer, department: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Close Toggle */}
                    <div className={`p-2 rounded border ${responses[activeTab]?.close ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs flex items-center gap-2"><XCircle size={12}/> End Conversation</span>
                        <input
                          type="checkbox"
                          checked={!!responses[activeTab]?.close}
                          onChange={(e) => updateResponse(activeTab, 'close', e.target.checked ? { reason: "Completed" } : undefined)}
                        />
                      </div>
                      {responses[activeTab]?.close && (
                        <div className="mt-2">
                          <label className="text-[10px] text-slate-500">Reason</label>
                          <LocalizedInput
                            label=""
                            rows={1}
                            value={responses[activeTab].close?.reason || ""}
                            onChange={(val) => updateResponse(activeTab, 'close', { ...responses[activeTab].close, reason: val })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
