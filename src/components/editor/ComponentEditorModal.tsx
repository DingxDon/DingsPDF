"use client";

import React, { useEffect, useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useEditor } from "@craftjs/core";
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { X } from "lucide-react";

export const ComponentEditorModal = () => {
    const { modalState, closeModal, addSavedComponent, updateSavedComponent } = useEditorStore();
    const { actions } = useEditor();

    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    useEffect(() => {
        if (modalState.isOpen) {
            setName(modalState.initialName);
            setCode(modalState.initialCode);
        }
    }, [modalState]);

    if (!modalState.isOpen) return null;

    const handleSave = () => {
        if (modalState.mode === 'create' || modalState.mode === 'edit_saved') {
            if (!name.trim()) {
                alert("Please enter a component name.");
                return;
            }
        }

        if (modalState.mode === 'create') {
            addSavedComponent({
                id: Date.now().toString(),
                name: name.trim(),
                category: "Custom",
                htmlCode: code,
            });
        } else if (modalState.mode === 'edit_saved') {
            if (modalState.targetId) {
                updateSavedComponent(modalState.targetId, name.trim(), code);
            }
        } else if (modalState.mode === 'edit_node') {
            if (modalState.targetId) {
                actions.setProp(modalState.targetId, (props: any) => {
                    props.htmlCode = code;
                });
            }
        }
        closeModal();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4">
            <div className="rounded-xl shadow-2xl w-full max-w-5xl h-[50vh] flex flex-col overflow-hidden border border-[#E6E8EC]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E8EC] shrink-0 bg-[#F7F8FA]">
                    <div className="flex-1 mr-4">
                        {(modalState.mode === 'create' || modalState.mode === 'edit_saved') ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Unnamed Component"
                                className="w-full bg-transparent text-[18px] font-semibold text-[#111827] outline-none placeholder:text-[#D1D5DB]"
                                autoFocus
                            />
                        ) : (
                            <h2 className="text-[18px] font-semibold text-[#111827]">
                                Edit HTML Block
                            </h2>
                        )}
                    </div>
                    <button onClick={closeModal} className="text-[#6B7280] hover:text-[#111827] transition-colors rounded p-1.5 hover:bg-[#E6E8EC]">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden bg-[#FAFAFA]">
                    <CodeMirror
                        value={code}
                        height="100%"
                        extensions={[html()]}
                        onChange={(value) => setCode(value)}
                        className="flex-1 overflow-auto text-[14px]"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E6E8EC] bg-[#F7F8FA] shrink-0">
                    <button onClick={closeModal} className="px-5 py-2 text-[14px] font-medium text-[#6B7280] hover:bg-[#E6E8EC] transition-colors rounded-lg">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-5 py-2 text-[14px] font-medium text-white bg-[#4F46E5] hover:bg-[#6366F1] transition-colors rounded-lg shadow-sm">
                        {modalState.mode === 'create' ? "Save Component" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};
