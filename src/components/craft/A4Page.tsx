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
        <div className="flex flex-col items-center mb-10 relative group pb-6 transition-all duration-300" style={{ width: width + "px" }}>
            {/* A4 Sheet */}
            <div
                ref={(ref: HTMLElement | null) => {
                    if (ref) connect(ref); // Entire page is no longer drag-source directly
                }}
                className={`bg-white dark:bg-zinc-800 relative transition-all pdf-page ${selected ? "ring-2 ring-indigo-500 dark:ring-indigo-400 z-10" : "ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-600 z-0"
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
                        className="absolute -top-12 left-0 bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center gap-1 p-1 z-50 cursor-default transition-colors"
                        onMouseDown={(e) => { e.stopPropagation(); }}
                        onClick={(e) => { e.stopPropagation(); }}
                    >
                        <div
                            ref={(ref: HTMLElement | null) => {
                                if (ref) drag(ref);
                            }}
                            className="px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400 cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                            title="Drag to rearrange"
                        >
                            <GripVertical size={14} />
                        </div>
                        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1 transition-colors"></div>
                        <button onClick={handleMoveUp} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Move Up">
                            <ArrowUp size={14} />
                        </button>
                        <button onClick={handleMoveDown} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Move Down">
                            <ArrowDown size={14} />
                        </button>
                        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1 transition-colors"></div>
                        <button onClick={handleDuplicate} className="px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5 font-medium text-[12px]">
                            <Copy size={14} /> Duplicate
                        </button>
                        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1 transition-colors"></div>
                        <button onClick={handleDelete} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                            <Trash2 size={14} />
                        </button>
                        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1 transition-colors"></div>
                        <button onClick={() => setShowSettings(!showSettings)} className="px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5 font-medium text-[12px]">
                            <Settings size={14} /> Settings
                        </button>

                        {/* Settings Popover */}
                        {showSettings && (
                            <div className="absolute top-12 left-0 w-64 bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-4 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-[13px] text-zinc-900 dark:text-zinc-100">Page Settings</span>
                                    <button onClick={() => setShowSettings(false)} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"><X size={14} /></button>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Size Preset</label>
                                    <select
                                        value={preset}
                                        onChange={handlePresetChange}
                                        className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-2 py-1.5 text-[13px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
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
                                            <label className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Width</label>
                                            <input
                                                type="number"
                                                value={customWidth}
                                                onChange={(e) => setProp((p: PageProps) => p.customWidth = Number(e.target.value))}
                                                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-2 py-1.5 text-[13px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 w-full transition-colors"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <label className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Height</label>
                                            <input
                                                type="number"
                                                value={customHeight}
                                                onChange={(e) => setProp((p: PageProps) => p.customHeight = Number(e.target.value))}
                                                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-2 py-1.5 text-[13px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 w-full transition-colors"
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
            <div className="absolute bottom-0 text-[12px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
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
