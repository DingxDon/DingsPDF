"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { Play, PenTool, Download, Save, Upload, FileText, Database, Plus, Sun, Moon, MoreVertical, LayoutGrid } from "lucide-react";
import { useEditor } from "@craftjs/core";

export const Topbar = () => {
    const { previewMode, setPreviewMode, dataSources, activeDataSourceId, setActiveDataSourceId, openModal, isDarkMode, toggleDarkMode, setMobileDrawerOpen } = useEditorStore();
    const { query, actions } = useEditor();

    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const handleAddPage = () => {
        const nodes = query.getNodes();
        let canvasId = "ROOT";
        for (const [id, node] of Object.entries(nodes)) {
            if (node.data.custom?.isRoot || id === "root_canvas" || node.data.name === "CanvasArea") {
                canvasId = id;
                break;
            }
        }

        let existingPageId: string | null = null;
        for (const [id, node] of Object.entries(nodes)) {
            if (node.data.name === "A4Page") {
                existingPageId = id;
                break;
            }
        }

        if (existingPageId) {
            const originalTree = query.node(existingPageId).toNodeTree();
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
                            parent: canvasId,
                            nodes: [], // Start deeply empty
                            props: { preset: "A4", customWidth: 794, customHeight: 1123 },
                            custom: {},
                            linkedNodes: {}
                        }
                    }
                }
            };

            actions.addNodeTree(newNodeTree as any, canvasId);
        } else {
            alert("No existing A4 page found to use as template.");
        }
    };

    const handleSave = () => {
        const json = query.serialize();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "template.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = e.target?.result as string;
                actions.deserialize(json);
            } catch (err) {
                alert("Invalid template file");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // reset input
    };

    const handleExportPDF = async () => {
        try {
            const jsPDF = (await import("jspdf")).default;
            const html2canvas = (await import("html2canvas")).default;

            const pages = document.querySelectorAll(".pdf-page");
            if (pages.length === 0) {
                alert("No pages found to export.");
                return;
            }

            // html2canvas fails to parse modern CSS lab() / oklch() colors used by Tailwind v4 in dark mode.
            // Temporarily force light mode during generation.
            const wasDark = document.documentElement.classList.contains('dark');
            if (wasDark) {
                document.documentElement.classList.remove('dark');
                // Allow DOM to securely re-flow and drop the lab() variables before we capture
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            let doc: import('jspdf').jsPDF | null = null;

            for (let i = 0; i < pages.length; i++) {
                const pageElement = pages[i] as HTMLElement;
                const width = pageElement.offsetWidth;
                const height = pageElement.offsetHeight;

                const originalBoxShadow = pageElement.style.boxShadow;
                const originalRing = pageElement.className;

                pageElement.style.boxShadow = "none";
                pageElement.classList.remove("ring-2", "ring-[#4F46E5]", "dark:ring-indigo-500");

                const canvas = await html2canvas(pageElement, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    windowWidth: width,
                    windowHeight: height
                });

                pageElement.style.boxShadow = originalBoxShadow;
                pageElement.className = originalRing;

                const imgData = canvas.toDataURL("image/jpeg", 1.0);

                if (i === 0) {
                    doc = new jsPDF({
                        orientation: width > height ? "landscape" : "portrait",
                        unit: "px",
                        format: [width, height],
                    });
                    doc.addImage(imgData, "JPEG", 0, 0, width, height);
                } else if (doc) {
                    doc.addPage([width, height], width > height ? "landscape" : "portrait");
                    doc.addImage(imgData, "JPEG", 0, 0, width, height);
                }
            }

            if (doc) {
                doc.save("document.pdf");
            }

            // Restore dark mode
            if (wasDark) {
                document.documentElement.classList.add('dark');
            }

        } catch (err) {
            console.error("Failed to export PDF:", err);
            alert("Failed to export PDF. See console for details.");
        }
    };

    return (
        <div className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-3 md:px-6 shrink-0 z-50 relative transition-colors duration-300 gap-2 overflow-visible">

            {/* Left section: Logo & File ops */}
            <div className="flex items-center gap-2 lg:gap-6 shrink-0">
                <div className="hidden md:flex items-center gap-3 pr-6 border-r border-zinc-200 dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        <FileText size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50 text-[15px] tracking-tight hidden lg:block transition-colors">NexusPDF</span>
                </div>

                {/* File Ops */}
                <div className="flex items-center gap-1.5">

                    {/* Components Toggle (Mobile) */}
                    <button
                        onClick={() => setMobileDrawerOpen(true)}
                        className="md:hidden bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 p-2 rounded-xl flex items-center justify-center transition-colors text-zinc-700 dark:text-zinc-300"
                        title="Components"
                    >
                        <LayoutGrid size={16} />
                    </button>

                    <button
                        onClick={handleAddPage}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-2 md:px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-[13px] font-semibold shadow-md shadow-indigo-500/20"
                        title="Add New Page"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:block">Add Page</span>
                    </button>

                    <div className="hidden md:flex items-center gap-1.5">
                        <button
                            onClick={handleSave}
                            className="hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 p-2.5 rounded-xl flex items-center gap-2 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 min-h-[40px]"
                            title="Save Template"
                        >
                            <Save size={16} />
                            <span className="text-[13px] font-medium hidden lg:block">Save</span>
                        </button>
                        <label className="hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 min-h-[40px]" title="Import JSON">
                            <Upload size={16} />
                            <span className="text-[13px] font-medium hidden lg:block">Import</span>
                            <input type="file" accept=".json" className="hidden" onChange={handleLoad} />
                        </label>
                    </div>

                    {/* Mobile More Dropdown */}
                    <div className="relative md:hidden">
                        <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 transition-colors">
                            <MoreVertical size={16} />
                        </button>
                        {isMoreMenuOpen && (
                            <div className="absolute top-12 left-0 w-48 bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 flex flex-col gap-1 z-[100]">
                                <button onClick={() => { handleSave(); setIsMoreMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 min-h-[40px]">
                                    <Save size={14} /> Save Layout
                                </button>
                                <label className="w-full text-left px-3 py-2.5 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer min-h-[40px]">
                                    <Upload size={14} /> Import JSON
                                    <input type="file" accept=".json" className="hidden" onChange={(e) => { handleLoad(e); setIsMoreMenuOpen(false); }} />
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Center: Document Title / Mode */}
            <div className="flex-1 flex justify-center min-w-0">
                <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
                    <button
                        onClick={() => setPreviewMode(false)}
                        className={`px-3 md:px-4 py-1.5 flex items-center justify-center gap-2 rounded-lg transition-all text-[13px] font-bold shadow-sm min-h-[32px] md:min-h-[40px] ${!previewMode ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 shadow-none'}`}
                        title="Design Mode"
                    >
                        <PenTool size={14} /> <span className="hidden md:block">Design</span>
                    </button>
                    <button
                        onClick={() => setPreviewMode(true)}
                        className={`px-3 md:px-4 py-1.5 flex items-center justify-center gap-2 rounded-lg transition-all text-[13px] font-bold shadow-sm min-h-[32px] md:min-h-[40px] ${previewMode ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 shadow-none'}`}
                        title="Preview Mode"
                    >
                        <Play size={14} /> <span className="hidden md:block">Preview</span>
                    </button>
                </div>
            </div>

            {/* Right section: Data source & Export */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="flex items-center gap-1 sm:gap-2">
                    <select
                        disabled={dataSources.length === 0}
                        value={activeDataSourceId || ""}
                        onChange={(e) => setActiveDataSourceId(e.target.value)}
                        className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 sm:px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-50 text-[12px] sm:text-[13px] font-medium shadow-sm max-w-[80px] sm:max-w-[100px] md:min-w-[140px] transition-all cursor-pointer truncate ${dataSources.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                    >
                        {!activeDataSourceId && <option value="" disabled>No API</option>}
                        {dataSources.map(ds => (
                            <option key={ds.id} value={ds.id}>{ds.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => openModal('manage_data')}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center hover:border-zinc-300 dark:hover:border-zinc-700 min-h-[40px] min-w-[40px]"
                        title="Configure API Sources"
                    >
                        <Database size={16} />
                    </button>
                </div>

                <div className="hidden md:block w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 transition-colors"></div>

                <button
                    onClick={toggleDarkMode}
                    className="hidden sm:flex p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm items-center justify-center hover:border-zinc-300 dark:hover:border-zinc-700 min-h-[40px] min-w-[40px]"
                    title="Toggle Dark Mode"
                >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                <button
                    onClick={handleExportPDF}
                    className="bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-3 md:px-5 py-2 rounded-xl flex items-center justify-center gap-2 transition-all text-[13px] font-bold shadow-md hover:shadow-lg min-h-[40px]"
                    title="Export PDF"
                >
                    <Download size={16} /> <span className="hidden md:block">Export</span>
                </button>
            </div>
        </div>
    );
};
