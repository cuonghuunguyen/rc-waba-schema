import { Download, Link as LinkIcon, MessageSquare, Play, Plus, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ChatSimulator } from './components/ChatSimulator';
import { FlowCanvas } from './components/FlowCanvas';
import { NodeInspector } from './components/NodeInspector';
import { INITIAL_SCHEMA, SYSTEM_NODES } from './constants';
import type { BotConfig } from './types';
import { validateBotConfig } from './types';
import { generateId, getConnections } from './utils/helpers';
export default function App() {
	const [botConfig, setBotConfig] = useState<BotConfig>(INITIAL_SCHEMA);
	const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [isSimulating, setIsSimulating] = useState(false);

	// Compute nodes for canvas with better initial layout
	const nodes = useMemo(() => {
		const nodeKeys = Object.keys(botConfig);
		const needsInitialization = nodeKeys.some(id => !nodePositions[id]);
		
		if (needsInitialization) {
			// Calculate better initial positions using a grid layout
			const newPositions: Record<string, { x: number; y: number }> = { ...nodePositions };
			const nodesPerRow = Math.ceil(Math.sqrt(nodeKeys.length));
			const horizontalSpacing = 350;
			const verticalSpacing = 200;
			
			nodeKeys.forEach((id, index) => {
				if (!newPositions[id]) {
					const row = Math.floor(index / nodesPerRow);
					const col = index % nodesPerRow;
					newPositions[id] = {
						x: 100 + col * horizontalSpacing,
						y: 100 + row * verticalSpacing
					};
				}
			});
			setNodePositions(newPositions);
		}
		
		return nodeKeys.map(id => {
			const pos = nodePositions[id] || { x: 100, y: 100 };
			
			const nodeData = botConfig[id];
			// Check if the node contains any ref items
			const hasRef = Array.isArray(nodeData) && nodeData.some(item => 'ref' in item);
			
			// Generate preview text from all responses
			let preview = id;
			if (Array.isArray(nodeData) && nodeData.length > 0) {
				const previews = nodeData.map(item => {
					if ('ref' in item) {
						return `→ ${item.ref}`;
					} else if ('text' in item && item.text) {
						const text = item.text;
						return typeof text === 'string' 
							? text.substring(0, 30) 
							: (text.en || Object.values(text)[0] || '').substring(0, 30);
					}
					return '';
				}).filter(p => p);
				if (previews.length > 0) {
					preview = previews.join(' | ');
				}
			}
			
			return {
				id,
				x: pos.x,
				y: pos.y,
				data: nodeData,
				preview,
				isRef: hasRef
			};
		});
	}, [botConfig, nodePositions]);

	const connections = useMemo(() => getConnections(botConfig), [botConfig]);

	const handleNodeMove = (nodeId: string, x: number, y: number) => {
		setNodePositions(prev => ({ ...prev, [nodeId]: { x, y } }));
	};

	const handleAddNode = () => {
		const newId = `node_${generateId()}`;
		setBotConfig(prev => ({
			...prev,
			[newId]: [{ text: "New response" }]
		}));
		setSelectedNodeId(newId);
	};

	const handleDeleteNode = () => {
		if (!selectedNodeId || SYSTEM_NODES.includes(selectedNodeId)) return;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [selectedNodeId]: _, ...rest } = botConfig;
		setBotConfig(rest as BotConfig);
		setSelectedNodeId(null);
	};

	const handleExport = () => {
		const result = validateBotConfig(botConfig);
		if (!result.valid) {
			alert(`Configuration has validation errors:\n${result.errors.join('\n')}`);
			return;
		}
		const dataStr = JSON.stringify(botConfig, null, 2);
		const blob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'whatsapp-bot-schema.json';
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			
			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const importedConfig = JSON.parse(event.target?.result as string);
					
					// Validate the imported configuration
					const result = validateBotConfig(importedConfig);
					if (!result.valid) {
						alert(`Imported configuration has validation errors:\n${result.errors.join('\n')}\n\nDo you want to import it anyway?`);
					}
					
					// Confirm before replacing current work
					if (confirm('This will replace your current bot configuration. Continue?')) {
						setBotConfig(importedConfig);
						setNodePositions({});
						setSelectedNodeId(null);
					}
				} catch (err) {
					alert('Failed to parse JSON file: ' + (err instanceof Error ? err.message : String(err)));
				}
			};
			reader.readAsText(file);
		};
		input.click();
	};

	return (
		<div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
			
			{/* Top Bar */}
			<header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-20">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
						<MessageSquare size={20} />
					</div>
					<h1 className="text-xl font-bold tracking-tight">FlowBuilder <span className="text-slate-400 font-normal text-sm">v1.0</span></h1>
				</div>
				
				<div className="flex items-center gap-3">
					<button onClick={() => setIsSimulating(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
						<Play size={16} /> Simulate
					</button>
					<div className="h-6 w-px bg-slate-200 mx-2"></div>
					<button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm transition-colors">
						<Download size={16} /> Export
					</button>
					<button onClick={handleImport} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm transition-colors">
						<Upload size={16} /> Import
					</button>
				</div>
			</header>

			{/* Main Workspace */}
			<div className="flex flex-1 overflow-hidden relative">
				
				{/* Left Sidebar (Toolbox) */}
				<div className="w-64 bg-white border-r flex flex-col z-10">
					<div className="p-4 border-b">
						<button onClick={handleAddNode} className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-md font-medium text-sm transition-colors border border-blue-200">
							<Plus size={16} /> Add New Node
						</button>
					</div>
					<div className="flex-1 overflow-y-auto p-2">
						<div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2">Flow Nodes</div>
						<ul className="space-y-1">
							{Object.keys(botConfig).map(id => {
								const isRef = botConfig[id] && 'ref' in botConfig[id];
								return (
									<li 
										key={id} 
										onClick={() => setSelectedNodeId(id)}
										className={`px-3 py-2 rounded text-sm cursor-pointer flex justify-between items-center group
											${selectedNodeId === id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-600'}
										`}
									>
										<div className="flex items-center gap-2 overflow-hidden">
											{isRef && <LinkIcon size={12} className="text-orange-500 flex-shrink-0" />}
											<span className="truncate max-w-[140px]">{id}</span>
										</div>
										{SYSTEM_NODES.includes(id) && <span className="w-2 h-2 bg-purple-400 rounded-full"></span>}
									</li>
								);
							})}
						</ul>
					</div>
				</div>

				{/* Center (Canvas) */}
				<FlowCanvas 
					nodes={nodes} 
					connections={connections} 
					onNodeSelect={setSelectedNodeId}
					onNodeMove={handleNodeMove}
					selectedNodeId={selectedNodeId}
				/>

				{/* Right Sidebar (Inspector) */}
				<NodeInspector 
					nodeId={selectedNodeId}
					data={selectedNodeId ? botConfig[selectedNodeId] : []}
					allNodeIds={Object.keys(botConfig)}
					onChange={(nodeId: string, newData: typeof botConfig[string]) => {
						setBotConfig(prev => ({
							...prev,
							[nodeId]: newData
						}));
					}}
					onDelete={handleDeleteNode}
					onRename={(oldId: string, newId: string) => {
						if (botConfig[newId]) {
							alert("ID already exists!");
							return;
						}
						// Create new entry with data
						const newConfig = { ...botConfig };
						newConfig[newId] = newConfig[oldId];
						delete newConfig[oldId];

					// Update ALL references (buttons, list items, and Ref items)
					Object.keys(newConfig).forEach(key => {
						const nodeData = newConfig[key];
						
						// Update items in the array
						if (Array.isArray(nodeData)) {
							newConfig[key] = nodeData.map(item => {
								// Update Refs
								if ('ref' in item && item.ref === oldId) {
									return { ...item, ref: newId };
								}
								
								// Update buttons in IBotResponse
								if ('buttons' in item && item.buttons) {
									return {
										...item,
										buttons: item.buttons.map(btn => 
											btn.payload === oldId ? { ...btn, payload: newId } : btn
										)
									};
								}
								
								// Update list items in IBotResponse
								if ('list' in item && item.list) {
									return {
										...item,
										list: item.list.map(listItem => 
											listItem.payload === oldId ? { ...listItem, payload: newId } : listItem
										)
									};
								}
								
								return item;
							});
						}
					});						// Update positions
						setNodePositions(prev => ({ ...prev, [newId]: prev[oldId] }));
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { [oldId]: _, ...restPos } = nodePositions;
						setNodePositions(restPos);

						setBotConfig(newConfig as BotConfig);
						setSelectedNodeId(newId);
					}}
				/>

			</div>

			{/* Simulator Overlay */}
			<ChatSimulator 
				config={botConfig} 
				isOpen={isSimulating} 
				onClose={() => setIsSimulating(false)} 
			/>
			
		</div>
	);
}
