"use client";
import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import { useEditorStore } from "@/store/useEditorStore";
import { Component, Variable, Plus, GripVertical, Copy, Code2, X, Trash2 } from "lucide-react";
import { CustomHTML } from "../craft/CustomHTML";

export const LeftSidebar = () => {
    const {
        previewMode,
        openModal,
        savedComponents,
        variables,
        customVariables,
        addCustomVariable,
        deleteCustomVariable,
        isMobileDrawerOpen,
        setMobileDrawerOpen
    } = useEditorStore();

    const { connectors: { create } } = useEditor();
    const [activeTab, setActiveTab] = useState<"components" | "variables">("components");
    const [copiedVar, setCopiedVar] = useState<string | null>(null);

    if (previewMode) {
        return null;
    }

    const handleCopyVariable = (varName: string) => {
        const text = `{{${varName}}}`;
        navigator.clipboard.writeText(text);
        setCopiedVar(varName);
        setTimeout(() => setCopiedVar(null), 2000);
    };

    return (
        <>
            {/* Mobile Drawer Overlay */}
            {isMobileDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setMobileDrawerOpen(false)}
                />
            )}

            <div className={`
                fixed inset-x-0 bottom-0 z-50 bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-transform duration-300 transform 
                rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] border-t border-zinc-200 dark:border-zinc-800
                h-[75vh] sm:h-[60vh] md:h-full md:relative md:inset-auto md:rounded-none md:shadow-none md:border-t-0 md:border-r 
                md:w-[200px] min-[1200px]:w-[260px] shrink-0
                ${isMobileDrawerOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"}
            `}>

                {/* Mobile Drawer Header with Close Button */}
                <div className="flex md:hidden items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                    <span className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Toolkit</span>
                    <button onClick={() => setMobileDrawerOpen(false)} className="p-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                    <button
                        onClick={() => setActiveTab("components")}
                        className={`flex-1 py-3 text-[13px] font-semibold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'components' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
                    >
                        Components
                    </button>
                    <button
                        onClick={() => setActiveTab("variables")}
                        className={`flex-1 py-3 text-[13px] font-semibold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'variables' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
                    >
                        Variables
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                    {activeTab === "components" && (
                        <>
                            <button
                                onClick={() => openModal('create', '', '')}
                                className="w-full min-h-[40px] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold transition-all shadow-md shadow-indigo-500/20"
                            >
                                <Plus size={16} /> Add Component
                            </button>

                            <div className="flex flex-col gap-2 mt-2 pb-6">
                                {savedComponents.length > 0 && (
                                    <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Your Components</h4>
                                )}
                                {savedComponents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 px-2 text-zinc-400 dark:text-zinc-500 text-[12px] text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
                                        <Code2 size={24} className="mb-2 text-zinc-300 dark:text-zinc-700" />
                                        <p>No components yet.<br />Create one above!</p>
                                    </div>
                                ) : (
                                    savedComponents.map((comp) => (
                                        <div
                                            key={comp.id}
                                            ref={(ref: any) => ref && create(ref, <CustomHTML htmlCode={comp.htmlCode} />)}
                                            className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 min-h-[40px] cursor-grab hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 flex items-center justify-between"
                                            title="Drag to canvas"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 transition-colors shrink-0">
                                                    <Component size={16} />
                                                </div>
                                                <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{comp.name}</span>
                                            </div>
                                            <GripVertical size={14} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors shrink-0" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === "variables" && (
                        <div className="flex flex-col gap-6 pb-6 h-full overflow-hidden">
                            {/* Custom Variables Section */}
                            <div className="flex flex-col gap-3 shrink-0">
                                <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Custom Variables</h4>
                                <div className="flex flex-col gap-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                                    <input
                                        type="text"
                                        placeholder="Variable Name"
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                        id="new-var-name"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        id="new-var-value"
                                    />
                                    <button
                                        onClick={() => {
                                            const nameInput = document.getElementById('new-var-name') as HTMLInputElement;
                                            const valueInput = document.getElementById('new-var-value') as HTMLInputElement;
                                            if (nameInput.value.trim()) {
                                                addCustomVariable({
                                                    id: Math.random().toString(36).substr(2, 9),
                                                    name: nameInput.value.trim(),
                                                    value: valueInput.value
                                                });
                                                nameInput.value = '';
                                                valueInput.value = '';
                                            }
                                        }}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-[13px] font-semibold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Plus size={14} /> Add Variable
                                    </button>
                                </div>
                            </div>

                            {/* Existing Variables List */}
                            <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                                <div className="flex items-center justify-between shrink-0">
                                    <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Available Keys</h4>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Click to Copy</span>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2">
                                    {/* Custom Vars List */}
                                    {customVariables.map((v) => (
                                        <div key={v.id} className="group flex flex-col p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div
                                                    className="flex items-center gap-2 cursor-pointer overflow-hidden"
                                                    onClick={() => handleCopyVariable(v.name)}
                                                    title="Copy variable tag"
                                                >
                                                    <Variable size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                                                    <span className="text-[12px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold truncate">{`{{${v.name}}}`}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => deleteCustomVariable(v.id)}
                                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate bg-zinc-50 dark:bg-zinc-800/50 rounded-md px-2 py-1 border border-zinc-100 dark:border-zinc-800">
                                                Value: <span className="font-medium text-zinc-700 dark:text-zinc-300">{v.value || 'empty'}</span>
                                            </div>
                                            {copiedVar === v.name && (
                                                <div className="mt-1 text-[10px] font-bold text-emerald-500 text-right">Copied!</div>
                                            )}
                                        </div>
                                    ))}

                                    {/* API Vars List */}
                                    {variables.length > 0 && variables.map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => handleCopyVariable(v)}
                                            className="group flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm transition-all text-left w-full"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Variable size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                                                <span className="text-[12px] font-mono text-zinc-600 dark:text-zinc-400 truncate">{`{{${v}}}`}</span>
                                            </div>
                                            {copiedVar === v ? (
                                                <span className="text-[10px] font-bold text-emerald-500 shrink-0">Copied!</span>
                                            ) : (
                                                <Copy size={12} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400 shrink-0 transition-colors" />
                                            )}
                                        </button>
                                    ))}

                                    {variables.length === 0 && customVariables.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500">
                                            <Variable size={24} className="mb-2 opacity-50" />
                                            <p className="text-[12px]">No variables available.<br />Add some custom variables or connect an API.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
