"use client";
import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import { useEditorStore } from "@/store/useEditorStore";
import { Component, Variable, Plus, GripVertical, Copy, Code2, X } from "lucide-react";
import { CustomHTML } from "../craft/CustomHTML";

export const LeftSidebar = () => {
    const { previewMode, openModal, savedComponents, variables, dataSources, activeDataSourceId, isMobileDrawerOpen, setMobileDrawerOpen } = useEditorStore();
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
                        <div className="flex flex-col gap-2 pb-6">
                            {activeDataSourceId &&
                                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                                    Click a variable to copy it, then paste into your HTML code.
                                </p>}
                            {!activeDataSourceId ? (
                                <div className="flex flex-col rounded-2xl p-5 bg-zinc-100 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 gap-2 items-center text-center mt-2 transition-colors">
                                    <span className="text-[13px] font-bold text-zinc-600 dark:text-zinc-300">No API Selected</span>
                                    <span className="text-[12px] text-zinc-500 dark:text-zinc-400">Select or configure a Data API from the top bar to fetch variables.</span>
                                </div>
                            ) : variables.length === 0 ? (
                                <div className="flex flex-col rounded-2xl p-5 bg-zinc-100 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 gap-2 items-center text-center mt-2 transition-colors">
                                    <span className="text-[13px] font-bold text-zinc-600 dark:text-zinc-300">No Variables Found</span>
                                    <span className="text-[12px] text-zinc-500 dark:text-zinc-400">Fetch data from the Data API configuration to populate this list.</span>
                                </div>
                            ) : (
                                variables.map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => handleCopyVariable(v)}
                                        className="group flex items-center justify-between p-3 min-h-[40px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 text-left w-full"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <Variable size={16} className="text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 transition-colors shrink-0" />
                                            <span className="text-[13px] font-mono text-zinc-700 dark:text-zinc-300 truncate" title={v}>{`{{${v}}}`}</span>
                                        </div>
                                        {copiedVar === v ? (
                                            <span className="text-[11px] font-bold text-emerald-500 shrink-0">Copied!</span>
                                        ) : (
                                            <Copy size={14} className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors shrink-0" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
