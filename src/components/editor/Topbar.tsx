"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { Play, PenTool, Download, Save, Upload, ZoomIn, FileText, Settings, Database } from "lucide-react";
import { useEditor } from "@craftjs/core";
import { useControls } from "react-zoom-pan-pinch";

export const Topbar = () => {
    const { previewMode, setPreviewMode, dataSources, activeDataSourceId, setActiveDataSourceId, openModal } = useEditorStore();
    const { query, actions } = useEditor();

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

            let doc: import('jspdf').jsPDF | null = null;

            for (let i = 0; i < pages.length; i++) {
                const pageElement = pages[i] as HTMLElement;
                const width = pageElement.offsetWidth;
                const height = pageElement.offsetHeight;

                // Make sure components don't visually shift or highlight during printing
                const originalBoxShadow = pageElement.style.boxShadow;
                const originalRing = pageElement.className;

                pageElement.style.boxShadow = "none";
                pageElement.classList.remove("ring-2", "ring-[#4F46E5]");

                const canvas = await html2canvas(pageElement, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    windowWidth: width,
                    windowHeight: height
                });

                // Restore styles
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

        } catch (err) {
            console.error("Failed to export PDF:", err);
            alert("Failed to export PDF. See console for details.");
        }
    };

    return (
        <div className="h-14 bg-white border-b border-[#E6E8EC] flex items-center justify-between px-4 shrink-0 z-10 relative">

            {/* Left section: Logo & File ops */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 pr-4 border-r border-[#E6E8EC]">
                    <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-sm">
                        <FileText size={14} className="text-white" />
                    </div>
                </div>

                {/* File Ops */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleSave}
                        className="hover:bg-[#F7F8FA] p-2 rounded-md flex items-center gap-2 transition-colors text-[#6B7280] hover:text-[#111827] border border-transparent hover:border-[#E6E8EC]"
                        title="Save Template"
                    >
                        <Save size={14} />
                        <span className="text-[13px] font-medium border-l border-transparent hidden sm:block">Save Layout</span>
                    </button>
                    <label className="hover:bg-[#F7F8FA] p-2 rounded-md flex items-center gap-2 cursor-pointer transition-colors text-[#6B7280] hover:text-[#111827] border border-transparent hover:border-[#E6E8EC]" title="Import JSON">
                        <Upload size={14} />
                        <span className="text-[13px] font-medium border-l border-transparent hidden sm:block">Load Layout</span>
                        <input type="file" accept=".json" className="hidden" onChange={handleLoad} />
                    </label>
                </div>
            </div>

            {/* Center: Document Title / Mode */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
                <div className="flex bg-[#F7F8FA] p-1 gap-1 rounded-lg border border-[#E6E8EC]">
                    <button
                        onClick={() => setPreviewMode(false)}
                        className={`px-4 py-1.5 flex items-center gap-2 rounded-md transition-all text-[13px] font-medium shadow-sm ${!previewMode ? 'bg-white text-[#111827] ring-1 ring-[#E6E8EC]' : 'text-[#6B7280] hover:text-[#111827] shadow-none'}`}
                    >
                        <PenTool size={14} /> Design
                    </button>
                    <button
                        onClick={() => setPreviewMode(true)}
                        className={`px-4 py-1.5 flex items-center gap-2 rounded-md transition-all text-[13px] font-medium shadow-sm ${previewMode ? 'bg-white text-[#111827] ring-1 ring-[#E6E8EC]' : 'text-[#6B7280] hover:text-[#111827] shadow-none'}`}
                    >
                        <Play size={14} /> Preview
                    </button>
                </div>
            </div>

            {/* Right section: Data source & Export */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-[#6B7280] text-[13px] hidden lg:block font-medium">Data API:</span>
                    <select
                        disabled={dataSources.length === 0}
                        value={activeDataSourceId || ""}
                        onChange={(e) => setActiveDataSourceId(e.target.value)}
                        className={`bg-white border border-[#E6E8EC] rounded-lg px-3 py-1.5 outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-[#111827] text-[13px] font-medium shadow-sm min-w-[120px] transition-all cursor-pointer ${dataSources.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {!activeDataSourceId && <option value="" disabled>No API Selected</option>}
                        {dataSources.map(ds => (
                            <option key={ds.id} value={ds.id}>{ds.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => openModal('manage_data')}
                        className="p-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] hover:text-[#4F46E5] transition-colors border border-[#E6E8EC] bg-white shadow-sm flex items-center justify-center"
                        title="Configure API Sources"
                    >
                        <Database size={14} />
                    </button>
                </div>

                <button
                    onClick={handleExportPDF}
                    className="bg-[#111827] hover:bg-[#374151] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-[13px] font-medium shadow-sm"
                >
                    <Download size={14} /> Export PDF
                </button>
            </div>
        </div >
    );
};
