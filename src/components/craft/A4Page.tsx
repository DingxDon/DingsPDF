"use client";

import React, { useState } from "react";
import { useNode, useEditor, Element } from "@craftjs/core";
import { useEditorStore } from "@/store/useEditorStore";
import { Plus, Copy, Trash2, Settings, X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

export type PagePreset = "A4" | "A3" | "A2" | "Custom";

export interface PageProps {
    preset: PagePreset;
    customWidth: number;
    customHeight: number;
    children?: React.ReactNode;
}

const PRESETS = {
    A4: { width: 794, height: 1123 },
    A3: { width: 1123, height: 1587 },
    A2: { width: 1587, height: 2245 }
};

export const A4Page = ({ preset = "A4", customWidth = 794, customHeight = 1123, children }: PageProps) => {
    const { id, selected, connectors: { connect, drag }, actions: { setProp } } = useNode((node) => ({
        selected: node.events.selected,
    }));
    const { actions, query } = useEditor();
    const previewMode = useEditorStore(state => state.previewMode);

    const [showSettings, setShowSettings] = useState(false);

    let pageIndex = 0;
    try {
        const parentId = query.node(id).get().data.parent;
        if (parentId) {
            const siblings = query.node(parentId).get().data.nodes;
            pageIndex = siblings.indexOf(id);
        }
    } catch (e) { }

    const width = preset === "Custom" ? customWidth : PRESETS[preset as keyof typeof PRESETS].width;
    const height = preset === "Custom" ? customHeight : PRESETS[preset as keyof typeof PRESETS].height;

    const handleAddBelow = (e: React.MouseEvent) => {
        e.stopPropagation();
        const parentId = query.node(id).get().data.parent;
        if (parentId) {
            const siblings = query.node(parentId).get().data.nodes;
            const myIndex = siblings.indexOf(id);

            const originalTree = query.node(id).toNodeTree();
            const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
            const rootNode = originalTree.nodes[originalTree.rootNodeId];

            const newNodeTree = {
                rootNodeId: newId,
                nodes: {
                    [newId]: {
                        ...rootNode,
                        id: newId,
                        data: {
                            ...rootNode.data,
                            parent: parentId,
                            nodes: [], // Start deeply empty
                            props: { preset, customWidth, customHeight },
                            custom: {},
                            linkedNodes: {}
                        }
                    }
                }
            };

            actions.addNodeTree(newNodeTree as any, parentId, myIndex + 1);
        }
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        const parentId = query.node(id).get().data.parent;
        if (parentId) {
            const siblings = query.node(parentId).get().data.nodes;
            const myIndex = siblings.indexOf(id);

            const originalTree = query.node(id).toNodeTree();
            const idMap: Record<string, string> = {};

            // Map original IDs to new unique IDs
            Object.keys(originalTree.nodes).forEach(oldId => {
                idMap[oldId] = `node_${Math.random().toString(36).substr(2, 9)}`;
            });

            const newNodes: Record<string, any> = {};
            Object.keys(originalTree.nodes).forEach(oldId => {
                const oldNode = originalTree.nodes[oldId];
                const newId = idMap[oldId];

                // Shallow clone elements to break Immer freezes entirely
                newNodes[newId] = {
                    ...oldNode,
                    id: newId,
                    data: {
                        ...oldNode.data,
                        parent: idMap[oldNode.data.parent] || parentId,
                        nodes: oldNode.data.nodes.map((n: string) => idMap[n]),
                        props: { ...oldNode.data.props },
                        custom: { ...oldNode.data.custom },
                        linkedNodes: Object.keys(oldNode.data.linkedNodes).reduce((acc: any, key) => {
                            acc[key] = idMap[oldNode.data.linkedNodes[key]];
                            return acc;
                        }, {})
                    }
                };
            });

            const newNodeTree = {
                rootNodeId: idMap[originalTree.rootNodeId],
                nodes: newNodes
            };

            actions.addNodeTree(newNodeTree as any, parentId, myIndex + 1);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        const parentId = query.node(id).get().data.parent;
        if (parentId) {
            const siblings = query.node(parentId).get().data.nodes;
            if (siblings.length <= 1) {
                alert("Cannot delete the last page.");
                return;
            }
        }
        actions.delete(id);
    };

    const handleMoveUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        const parentId = query.node(id).get().data.parent;
        if (parentId) {
            const siblings = query.node(parentId).get().data.nodes;
            const myIndex = siblings.indexOf(id);
            if (myIndex > 0) {
                actions.move(id, parentId, myIndex - 1);
            }
        }
    };

    const handleMoveDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        const parentId = query.node(id).get().data.parent;
        if (parentId) {
            const siblings = query.node(parentId).get().data.nodes;
            const myIndex = siblings.indexOf(id);
            if (myIndex < siblings.length - 1) {
                actions.move(id, parentId, myIndex + 2);
            }
        }
    };

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPreset = e.target.value as PagePreset;
        setProp((props: PageProps) => {
            props.preset = newPreset;
            if (newPreset !== "Custom") {
                props.customWidth = PRESETS[newPreset].width;
                props.customHeight = PRESETS[newPreset].height;
            }
        });
    };

    return (
        <div className="flex flex-col items-center mb-10 relative group pb-6" style={{ width: width + "px" }}>
            {/* A4 Sheet */}
            <div
                ref={(ref: HTMLElement | null) => {
                    if (ref) connect(ref); // Entire page is no longer drag-source directly
                }}
                className={`bg-white relative transition-all pdf-page ${selected ? "ring-2 ring-[#4F46E5] z-10" : "ring-1 ring-[#E6E8EC] hover:ring-[#D1D5DB] z-0"
                    }`}
                style={{
                    width: width + "px",
                    minHeight: height + "px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1), 0 0 10px rgba(0,0,0,0.03)",
                }}
            >
                {/* Toolbar inside the ref so Craft doesn't deselect */}
                {selected && !previewMode && (
                    <div
                        data-html2canvas-ignore="true"
                        className="absolute -top-12 left-0 bg-white shadow-md border border-[#E6E8EC] rounded-md flex items-center gap-1 p-1 z-50 cursor-default"
                        onMouseDown={(e) => { e.stopPropagation(); }}
                        onClick={(e) => { e.stopPropagation(); }}
                    >
                        <div
                            ref={(ref: HTMLElement | null) => {
                                if (ref) drag(ref);
                            }}
                            className="px-2 py-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors hover:text-[#111827]"
                            title="Drag to rearrange"
                        >
                            <GripVertical size={14} />
                        </div>
                        <div className="w-[1px] h-4 bg-[#E6E8EC] mx-1"></div>
                        <button onClick={handleMoveUp} className="p-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#111827] transition-colors" title="Move Up">
                            <ArrowUp size={14} />
                        </button>
                        <button onClick={handleMoveDown} className="p-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#111827] transition-colors" title="Move Down">
                            <ArrowDown size={14} />
                        </button>
                        <div className="w-[1px] h-4 bg-[#E6E8EC] mx-1"></div>
                        <button onClick={handleAddBelow} className="px-2 py-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#4F46E5] transition-colors flex items-center gap-1.5 font-medium text-[12px]">
                            <Plus size={14} /> Page Below
                        </button>
                        <div className="w-[1px] h-4 bg-[#E6E8EC] mx-1"></div>
                        <button onClick={handleDuplicate} className="px-2 py-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-1.5 font-medium text-[12px]">
                            <Copy size={14} /> Duplicate
                        </button>
                        <div className="w-[1px] h-4 bg-[#E6E8EC] mx-1"></div>
                        <button onClick={handleDelete} className="p-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#EF4444] transition-colors">
                            <Trash2 size={14} />
                        </button>
                        <div className="w-[1px] h-4 bg-[#E6E8EC] mx-1"></div>
                        <button onClick={() => setShowSettings(!showSettings)} className="px-2 py-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-1.5 font-medium text-[12px]">
                            <Settings size={14} /> Settings
                        </button>

                        {/* Settings Popover */}
                        {showSettings && (
                            <div className="absolute top-12 left-0 w-64 bg-white shadow-xl border border-[#E6E8EC] rounded-lg p-4 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-[13px] text-[#111827]">Page Settings</span>
                                    <button onClick={() => setShowSettings(false)} className="text-[#6B7280] hover:text-[#111827]"><X size={14} /></button>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-medium text-[#6B7280]">Size Preset</label>
                                    <select
                                        value={preset}
                                        onChange={handlePresetChange}
                                        className="border border-[#E6E8EC] rounded-md px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:border-[#4F46E5]"
                                    >
                                        <option value="A4">A4 (794 x 1123 px)</option>
                                        <option value="A3">A3 (1123 x 1587 px)</option>
                                        <option value="A2">A2 (1587 x 2245 px)</option>
                                        <option value="Custom">Custom Size</option>
                                    </select>
                                </div>

                                {preset === "Custom" && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <label className="text-[12px] font-medium text-[#6B7280]">Width</label>
                                            <input
                                                type="number"
                                                value={customWidth}
                                                onChange={(e) => setProp((p: PageProps) => p.customWidth = Number(e.target.value))}
                                                className="border border-[#E6E8EC] rounded-md px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:border-[#4F46E5] w-full"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <label className="text-[12px] font-medium text-[#6B7280]">Height</label>
                                            <input
                                                type="number"
                                                value={customHeight}
                                                onChange={(e) => setProp((p: PageProps) => p.customHeight = Number(e.target.value))}
                                                className="border border-[#E6E8EC] rounded-md px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:border-[#4F46E5] w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {/* Auto overflow logic helper - children render consecutively inside */}
                <div className="w-full h-full pb-0 flex flex-col">
                    {children}
                </div>
            </div>

            {/* Page Numbering */}
            <div className="absolute bottom-0 text-[12px] text-[#A0A0A0] font-medium tracking-wide">
                Page {pageIndex + 1} • {width}x{height}
            </div>
        </div>
    );
};

A4Page.craft = {
    props: {
        preset: "A4",
        customWidth: 794,
        customHeight: 1123
    },
    rules: {
        canDrag: () => true,
    }
};
