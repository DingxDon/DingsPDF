"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { Play, PenTool, Download, Save, Upload, FileText, Database, Plus, Sun, Moon, LayoutGrid, RefreshCw, ChevronDown, MoreHorizontal } from "lucide-react";
import { useEditor } from "@craftjs/core";

export const Topbar = () => {
    const { previewMode, setPreviewMode, dataSources, activeDataSourceId, setActiveDataSourceId, setActiveResponseData, setVariables, openModal, isDarkMode, toggleDarkMode, setMobileDrawerOpen } = useEditorStore();
    const { query, actions } = useEditor();

    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [docName, setDocName] = useState("Untitled Document");
    const [isEditingName, setIsEditingName] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

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
        link.download = `${docName}.json`;
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

    const handleRefreshApi = async () => {
        const activeDs = dataSources.find(ds => ds.id === activeDataSourceId);
        if (!activeDs) return;
        setIsRefreshing(true);
        try {
            let parsedHeaders = {};
            if (activeDs.headers.trim()) parsedHeaders = JSON.parse(activeDs.headers);
            const options: RequestInit = { method: activeDs.method, headers: { "Content-Type": "application/json", ...parsedHeaders } };
            if (activeDs.method === "POST" && activeDs.body.trim()) options.body = activeDs.body;

            const response = await fetch(activeDs.url, options);
            if (!response.ok) throw new Error("Fetch failed");
            const data = await response.json();

            const flattenObject = (ob: any): string[] => {
                var toReturn: string[] = [];
                for (var i in ob) {
                    if (!ob.hasOwnProperty(i)) continue;
                    if ((typeof ob[i]) == 'object' && ob[i] !== null) {
                        if (Array.isArray(ob[i])) {
                            toReturn.push(`${i}`);
                            if (ob[i].length > 0 && typeof ob[i][0] === 'object') {
                                var flatObject = flattenObject(ob[i][0]);
                                for (var x in flatObject) {
                                    if (!flatObject.hasOwnProperty(x)) continue;
                                    toReturn.push(`${i}.${flatObject[x]}`);
                                }
                            }
                        } else {
                            var flatObject = flattenObject(ob[i]);
                            for (var x in flatObject) {
                                if (!flatObject.hasOwnProperty(x)) continue;
                                toReturn.push(i + '.' + flatObject[x]);
                            }
                        }
                    } else {
                        toReturn.push(i);
                    }
                }
                return [...new Set(toReturn)];
            };
            const flatVars = flattenObject(data);
            setActiveResponseData(data);
            setVariables(flatVars);
        } catch (err) {
            console.error(err);
            alert("Failed to refresh API data.");
        } finally {
            setIsRefreshing(false);
        }
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
            }

            // Critical layout fix: Remove fractional CSS scaling applied by EditorWorkspace responsiveness
            // that causes html2canvas to compute squished text kerning and bounding boxes overlapping.
            const wrapper = document.getElementById("pdf-workspace-wrapper");
            if (wrapper) {
                wrapper.style.setProperty('--tw-scale-x', '1', 'important');
                wrapper.style.setProperty('--tw-scale-y', '1', 'important');
            }

            // Force DOM reflow to allow scale removal and light mode variables to propagate securely
            await new Promise(resolve => setTimeout(resolve, 150));

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
                    windowHeight: height,
                    onclone: (clonedDoc) => {
                        // Anti-aliasing text fix for floating elements
                        clonedDoc.body.style.textRendering = "geometricPrecision";
                        clonedDoc.body.style.setProperty("-webkit-font-smoothing", "antialiased");
                    }
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
                doc.save(`${docName}.pdf`);
            }

            // Restore dark mode and original responsive UI scaling behavior seamlessly
            if (wrapper) {
                wrapper.style.removeProperty('--tw-scale-x');
                wrapper.style.removeProperty('--tw-scale-y');
            }
            if (wasDark) {
                document.documentElement.classList.add('dark');
            }

        } catch (err) {
            console.error("Failed to export PDF:", err);
            alert("Failed to export PDF. See console for details.");
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1C1C1E] border border-[#E6E8EC] dark:border-zinc-800 rounded-[14px] p-[10px_14px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2 sm:gap-4 z-[100] transition-colors duration-300 w-max max-w-[calc(100vw-32px)] overflow-visible">

            {/* Document Controls */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Mobile Components Toggle */}
                <button
                    onClick={() => setMobileDrawerOpen(true)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
                    title="Components"
                >
                    <LayoutGrid size={16} />
                </button>

                <div className="hidden sm:flex items-center group">
                    {isEditingName ? (
                        <input
                            value={docName}
                            onChange={e => setDocName(e.target.value)}
                            onBlur={() => setIsEditingName(false)}
                            onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                            className="font-medium text-zinc-900 dark:text-zinc-50 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-indigo-500 w-[120px] transition-all"
                            autoFocus
                        />
                    ) : (
                        <span
                            onClick={() => setIsEditingName(true)}
                            className="font-medium text-zinc-900 dark:text-zinc-50 text-[13px] hover:bg-zinc-100 dark:hover:bg-zinc-800 px-1.5 py-0.5 rounded cursor-text transition-colors truncate max-w-[120px]"
                        >
                            {docName}
                        </span>
                    )}
                </div>

                <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 hidden sm:block mx-1"></div>

                <button
                    onClick={handleAddPage}
                    className="flex items-center justify-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Add New Page"
                >
                    <Plus size={14} />
                    <span className="hidden md:block">Page</span>
                </button>
            </div>

            <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

            {/* Mode Switch */}
            <div className="flex bg-zinc-100 dark:bg-[#2C2C2E] p-[3px] rounded-[10px] border border-zinc-200/50 dark:border-zinc-700/50 transition-colors shrink-0">
                <button
                    onClick={() => setPreviewMode(false)}
                    className={`px-3 sm:px-4 py-1.5 flex items-center justify-center gap-2 rounded-md transition-all text-[12px] font-medium min-h-[26px] ${!previewMode ? 'bg-white dark:bg-[#3C3C3E] text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-600/50' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}
                >
                    <PenTool size={13} />
                </button>
                <button
                    onClick={() => setPreviewMode(true)}
                    className={`px-3 sm:px-4 py-1.5 flex items-center justify-center gap-2 rounded-md transition-all text-[12px] font-medium min-h-[26px] ${previewMode ? 'bg-white dark:bg-[#3C3C3E] text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-600/50' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}
                >
                    <Play size={13} />
                </button>
            </div>

            <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

            {/* Data Source & Export */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

                {/* API Dropdown */}
                <div className="hidden lg:flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1 pr-2 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600">
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 shrink-0">
                        <Database size={12} className="text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50" onClick={() => openModal('manage_data')} />
                    </div>
                    <select
                        disabled={dataSources.length === 0}
                        value={activeDataSourceId || ""}
                        onChange={(e) => setActiveDataSourceId(e.target.value)}
                        className="bg-transparent text-[12px] font-medium text-zinc-700 dark:text-zinc-300 outline-none w-[90px] xl:w-[120px] cursor-pointer appearance-none truncate"
                    >
                        {!activeDataSourceId && <option value="" disabled>API: None</option>}
                        {dataSources.map(ds => (
                            <option key={ds.id} value={ds.id}>{ds.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="text-zinc-400 shrink-0 pointer-events-none -ml-3" />
                </div>

                <button
                    onClick={handleRefreshApi}
                    disabled={!activeDataSourceId || isRefreshing}
                    className={`hidden md:flex p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors border border-transparent items-center justify-center ${!activeDataSourceId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    title="Refresh API Data"
                >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                </button>

                {/* More / Overflow */}
                <div className="relative">
                    <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent items-center justify-center">
                        <MoreHorizontal size={16} />
                    </button>
                    {isMoreMenuOpen && (
                        <div className="absolute bottom-full mb-2 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 w-48 bg-white dark:bg-[#2C2C2E] shadow-xl border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-1.5 flex flex-col z-[100] transform origin-bottom transition-all">
                            <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 border-b border-zinc-100 dark:border-zinc-800/50">Document</div>

                            <button onClick={() => { handleSave(); setIsMoreMenuOpen(false); }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#3C3C3E] flex items-center gap-2">
                                <Save size={14} /> Save Layout
                            </button>
                            <label className="w-full text-left px-3 py-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#3C3C3E] flex items-center gap-2 cursor-pointer">
                                <Upload size={14} /> Import Layout
                                <input type="file" accept=".json" className="hidden" onChange={(e) => { handleLoad(e); setIsMoreMenuOpen(false); }} />
                            </label>

                            <div className="px-3 py-2 mt-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 border-b border-zinc-100 dark:border-zinc-800/50">Settings</div>

                            <button onClick={() => { openModal('manage_data'); setIsMoreMenuOpen(false); }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#3C3C3E] flex items-center gap-2">
                                <Database size={14} /> Manage Data APIs
                            </button>

                            <button onClick={() => { toggleDarkMode(); setIsMoreMenuOpen(false); }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#3C3C3E] flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2">
                                    {isDarkMode ? <Sun size={14} /> : <Moon size={14} />} Theme
                                </div>
                                <span className="text-zinc-400 text-[11px] font-mono capitalize">{isDarkMode ? 'Dark' : 'Light'}</span>
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleExportPDF}
                    className="bg-[#111827] hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-3 sm:px-4 py-2 rounded-[10px] flex items-center justify-center gap-1.5 transition-all text-[13px] font-semibold ml-1 shadow-[0_2px_10px_rgba(17,24,39,0.15)] dark:shadow-none"
                    title="Export PDF"
                >
                    <Download size={14} /> <span className="hidden sm:block">Export</span>
                </button>
            </div>
        </div>
    );
};
