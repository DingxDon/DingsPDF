"use client";

import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useEditorStore } from "@/store/useEditorStore";
import { ResizableWrapper } from "./ResizableWrapper";
import { Edit2, Copy, Trash2, Save } from "lucide-react";
import Handlebars from "handlebars";

export const CustomHTML = ({ htmlCode }: any) => {
    const { id, selected, connectors: { connect } } = useNode((node) => ({
        selected: node.events.selected,
    }));
    const { actions, query } = useEditor();

    const previewMode = useEditorStore(state => state.previewMode);
    const activeResponseData = useEditorStore(state => state.activeResponseData);
    const openModal = useEditorStore(state => state.openModal);

    // Interpolate variables if in preview mode
    let renderedHtml = htmlCode;
    if (previewMode && activeResponseData) {
        try {
            const template = Handlebars.compile(htmlCode);
            renderedHtml = template(activeResponseData);
        } catch (e) {
            console.error("Handlebars interpolation failed:", e);
        }
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        openModal('edit_node', 'HTML Block', htmlCode, id);
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        const parentId = query.node(id).get().data.parent;
        if (parentId) {
            const newNodeTree = query.parseReactElement(<CustomHTML htmlCode={htmlCode} />).toNodeTree();
            actions.addNodeTree(newNodeTree, parentId);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        actions.delete(id);
    };

    const handleSaveAsComponent = (e: React.MouseEvent) => {
        e.stopPropagation();
        // pre-fill code, ask for name by opening in create mode
        openModal('create', '', htmlCode);
    };

    return (
        <ResizableWrapper>
            <div
                ref={(ref: any) => connect(ref)}
                className={`w-full relative ${previewMode ? "cursor-default" : "min-h-[40px]"}`}
            >
                {/* Floating Action Bar when selected in Design Mode */}
                {selected && !previewMode && (
                    <div className="absolute -top-10 left-0 bg-white shadow-md border border-[#E6E8EC] rounded-md flex items-center gap-1 p-1 z-50">
                        <button onClick={handleEdit} className="p-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#4F46E5] transition-colors" title="Edit HTML">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={handleDuplicate} className="p-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#111827] transition-colors" title="Duplicate">
                            <Copy size={14} />
                        </button>
                        <button onClick={handleSaveAsComponent} className="p-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#10B981] transition-colors" title="Save as Component">
                            <Save size={14} />
                        </button>
                        <div className="w-[1px] h-4 bg-[#E6E8EC] mx-1"></div>
                        <button onClick={handleDelete} className="p-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#EF4444] transition-colors" title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}

                {renderedHtml ? (
                    <div
                        dangerouslySetInnerHTML={{ __html: renderedHtml }}
                        className="w-full"
                    />
                ) : (
                    <div className="w-full flex items-center justify-center bg-[#F7F8FA] text-[#6B7280] text-sm text-center border border-dashed border-[#E6E8EC] p-6 rounded">
                        Empty HTML Block
                    </div>
                )}
            </div>
        </ResizableWrapper>
    );
};

CustomHTML.craft = {
    props: {
        htmlCode: `<div style="padding: 1rem; background-color: #f3f4f6; border: 1px solid #e5e7eb;">\n  <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-family: sans-serif;">{{student_name}}</h3>\n  <p style="margin: 0; color: #4b5563; font-size: 14px; font-family: sans-serif;">Score: {{score}}</p>\n</div>`,
    }
};
