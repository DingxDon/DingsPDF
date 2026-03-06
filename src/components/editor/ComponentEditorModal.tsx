"use client";

import React, { useEffect, useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useEditor } from "@craftjs/core";
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { X } from "lucide-react";

export const ComponentEditorModal = () => {
    const { modalState, closeModal, addSavedComponent, updateSavedComponent, isDarkMode } = useEditorStore();
    const { actions } = useEditor();

    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    useEffect(() => {
        if (modalState.isOpen) {
            setName(modalState.initialName);
            setCode(modalState.initialCode);
        }
    }, [modalState]);

    const isVisible = modalState.isOpen && ['create', 'edit_node', 'edit_saved'].includes(modalState.mode);

    if (!isVisible) return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-5xl h-[60vh] flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-colors">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50 dark:bg-zinc-900 transition-colors">
                    <div className="flex-1 mr-4">
                        {(modalState.mode === 'create' || modalState.mode === 'edit_saved') ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Unnamed Component"
                                className="w-full bg-transparent text-[18px] font-bold text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-colors"
                                autoFocus
                            />
                        ) : (
                            <h2 className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100 transition-colors">
                                Edit HTML Block
                            </h2>
                        )}
                    </div>
                    <button onClick={closeModal} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors rounded-lg p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 focus:outline-none">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
                    <CodeMirror
                        value={code}
                        height="100%"
                        extensions={[html()]}
                        onChange={(value) => setCode(value)}
                        className="flex-1 overflow-auto text-[14px]"
                        theme={isDarkMode ? 'dark' : 'light'}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 transition-colors">
                    <button onClick={closeModal} className="px-5 py-2.5 text-[14px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors rounded-xl outline-none">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 text-[14px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 outline-none">
                        {modalState.mode === 'create' ? "Save Component" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};
