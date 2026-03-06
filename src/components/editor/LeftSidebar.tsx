"use client";
import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import { useEditorStore } from "@/store/useEditorStore";
import { Component, Variable, Plus, GripVertical, Copy, Code2 } from "lucide-react";
import { CustomHTML } from "../craft/CustomHTML";

export const LeftSidebar = () => {
    const { previewMode, openModal, savedComponents, variables, dataSources, activeDataSourceId } = useEditorStore();
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
        <div className="w-64 bg-[#FBFBFD] border-r border-[#E6E8EC] flex flex-col z-20 shrink-0 h-full">
            <div className="flex border-b border-[#E6E8EC]">
                <button
                    onClick={() => setActiveTab("components")}
                    className={`flex-1 py-3 text-[13px] font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === 'components' ? 'border-[#4F46E5] text-[#111827]' : 'border-transparent text-[#6B7280] hover:text-[#111827]'}`}
                >
                    Components
                </button>
                <button
                    onClick={() => setActiveTab("variables")}
                    className={`flex-1 py-3 text-[13px] font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === 'variables' ? 'border-[#4F46E5] text-[#111827]' : 'border-transparent text-[#6B7280] hover:text-[#111827]'}`}
                >
                    Variables
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                {activeTab === "components" && (
                    <>
                        <button
                            onClick={() => openModal('create', '', '')}
                            className="w-full bg-[#4F46E5] hover:bg-[#6366F1] text-white py-2 rounded-lg flex items-center justify-center gap-2 text-[13px] font-medium transition-colors shadow-sm"
                        >
                            <Plus size={16} /> Add Component
                        </button>

                        <div className="flex flex-col gap-2 mt-2">
                            <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Your Components</h4>

                            {savedComponents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-[#6B7280] text-[12px] text-center rounded-xl border border-dashed border-[#E6E8EC] bg-white">
                                    <Code2 size={24} className="mb-2 text-[#D1D5DB]" />
                                    <p>No components yet.<br />Create one above!</p>
                                </div>
                            ) : (
                                savedComponents.map((comp) => (
                                    <div
                                        key={comp.id}
                                        ref={(ref: any) => ref && create(ref, <CustomHTML htmlCode={comp.htmlCode} />)}
                                        className="group bg-white border border-[#E6E8EC] rounded-lg p-3 cursor-grab hover:border-[#4F46E5] hover:shadow-sm transition-all flex items-center justify-between"
                                        title="Drag to canvas"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="text-[#6B7280] group-hover:text-[#4F46E5]">
                                                <Component size={16} />
                                            </div>
                                            <span className="text-[13px] font-medium text-[#111827] truncate">{comp.name}</span>
                                        </div>
                                        <GripVertical size={14} className="text-[#D1D5DB] group-hover:text-[#6B7280]" />
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {activeTab === "variables" && (
                    <div className="flex flex-col gap-2">
                        {activeDataSourceId &&
                            <p className="text-[12px] text-[#6B7280] mb-2 leading-relaxed">
                                Click a variable to copy it, then paste into your HTML code.
                            </p>}
                        {!activeDataSourceId ? (
                            <div className="flex flex-col rounded p-4 bg-[#F7F8FA] border border-[#E6E8EC] gap-2 items-center text-center mt-2">
                                <span className="text-[12px] font-medium text-[#111827]">No API Selected</span>
                                <span className="text-[11px] text-[#6B7280]">Select or configure a Data API from the top bar to fetch variables.</span>
                            </div>
                        ) : variables.length === 0 ? (
                            <div className="flex flex-col rounded p-4 bg-[#F7F8FA] border border-[#E6E8EC] gap-2 items-center text-center mt-2">
                                <span className="text-[12px] font-medium text-[#111827]">No Variables Found</span>
                                <span className="text-[11px] text-[#6B7280]">Fetch data from the Data API configuration to populate this list.</span>
                            </div>
                        ) : (
                            variables.map((v) => (
                                <button
                                    key={v}
                                    onClick={() => handleCopyVariable(v)}
                                    className="group flex items-center justify-between p-3 rounded-lg border border-[#E6E8EC] bg-white hover:border-[#4F46E5] hover:shadow-sm transition-all text-left w-full"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Variable size={16} className="text-[#4F46E5] shrink-0" />
                                        <span className="text-[13px] font-mono text-[#111827] truncate" title={v}>{`{{${v}}}`}</span>
                                    </div>
                                    {copiedVar === v ? (
                                        <span className="text-[11px] font-medium text-[#10B981] shrink-0">Copied!</span>
                                    ) : (
                                        <Copy size={14} className="text-[#D1D5DB] group-hover:text-[#6B7280] shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
