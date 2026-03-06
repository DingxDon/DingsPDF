"use client";

import React, { useState, useEffect } from "react";
import { useEditorStore, DataSource } from "@/store/useEditorStore";
import { X, Save, Play, Plus, Trash2, Database, UploadCloud } from "lucide-react";

export const DataSourceModal = () => {
    const { modalState, closeModal, dataSources, addDataSource, updateDataSource, deleteDataSource, setActiveDataSourceId, setActiveResponseData, setVariables } = useEditorStore();

    const [formId, setFormId] = useState<string>("");
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [method, setMethod] = useState<"GET" | "POST">("GET");
    const [headers, setHeaders] = useState("");
    const [body, setBody] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [fetchStatus, setFetchStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const isOpen = modalState.isOpen && modalState.mode === 'manage_data';

    useEffect(() => {
        if (!isOpen) return;
        setFetchStatus(null);
        if (dataSources.length > 0 && !formId) {
            loadDataSource(dataSources[0]);
        } else if (dataSources.length === 0) {
            handleNew();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const loadDataSource = (ds: DataSource) => {
        setFormId(ds.id);
        setName(ds.name);
        setUrl(ds.url);
        setMethod(ds.method);
        setHeaders(ds.headers);
        setBody(ds.body);
        setFetchStatus(null);
    };

    const handleNew = () => {
        setFormId("");
        setName("New Data API");
        setUrl("");
        setMethod("GET");
        setHeaders("");
        setBody("");
        setFetchStatus(null);
    };

    const handleSave = () => {
        if (!name || !url) {
            setFetchStatus({ type: 'error', message: "Name and URL are required." });
            return;
        }

        const dsData: DataSource = {
            id: formId || `ds_${Date.now()}`,
            name,
            url,
            method,
            headers,
            body
        };

        if (formId) {
            updateDataSource(formId, dsData);
        } else {
            addDataSource(dsData);
            setFormId(dsData.id);
        }

        setFetchStatus({ type: 'success', message: "Saved successfully!" });
    };

    const handleDelete = (id: string) => {
        deleteDataSource(id);
        handleNew();
    };

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
        return [...new Set(toReturn)]; // unique
    };

    const handleFetch = async () => {
        if (!url) {
            setFetchStatus({ type: 'error', message: "URL is required to fetch data." });
            return;
        }

        setIsLoading(true);
        setFetchStatus(null);

        try {
            let parsedHeaders = {};
            if (headers.trim()) {
                parsedHeaders = JSON.parse(headers);
            }

            const options: RequestInit = {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...parsedHeaders
                }
            };

            if (method === "POST" && body.trim()) {
                options.body = body; // Already assumed to be JSON string from textarea
            }

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Auto HTTP ${response.status}`);
            }

            const data = await response.json();

            // Generate Variables
            const flatVars = flattenObject(data);

            setActiveDataSourceId(formId || null);
            setActiveResponseData(data);
            setVariables(flatVars);

            setFetchStatus({ type: 'success', message: `Fetched! Extracted ${flatVars.length} variables.` });

        } catch (e: any) {
            console.error(e);
            setFetchStatus({ type: 'error', message: `Fetch failed: ${e.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden border border-[#E6E8EC]">

                {/* Internal Sidebar for Data Sources */}
                <div className="w-1/3 bg-[#FBFBFD] border-r border-[#E6E8EC] flex flex-col h-full">
                    <div className="p-4 border-b border-[#E6E8EC] flex justify-between items-center shadow-sm z-10">
                        <span className="font-semibold text-[#111827] flex items-center gap-2"><Database size={16} /> API Sources</span>
                        <button onClick={handleNew} className="p-1 hover:bg-[#E6E8EC] rounded text-[#6B7280] transition-colors" title="New API">
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
                        {dataSources.length === 0 ? (
                            <div className="text-center text-[12px] text-[#A0A0A0] py-10 px-4">
                                No APIs configured. Click + to add.
                            </div>
                        ) : (
                            dataSources.map(ds => (
                                <div
                                    key={ds.id}
                                    onClick={() => loadDataSource(ds)}
                                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${formId === ds.id ? 'bg-white border-[#4F46E5] ring-1 ring-[#4F46E5] shadow-sm' : 'bg-transparent border-[#E6E8EC] hover:bg-white hover:border-[#D1D5DB]'}`}
                                >
                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        <span className="text-[13px] font-medium text-[#111827] truncate">{ds.name}</span>
                                        <span className="text-[11px] text-[#6B7280] truncate font-mono">{ds.method} {ds.url}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(ds.id); }}
                                        className="p-1.5 text-[#A0A0A0] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded transition-colors opacity-0 group-hover:opacity-100 placeholder-shown:opacity-100" // basic tailwind tricks
                                        style={{ opacity: 1 }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Edit Area */}
                <div className="w-2/3 flex flex-col h-full bg-white relative">
                    <div className="p-4 border-b border-[#E6E8EC] flex justify-between items-center bg-white shadow-sm z-10">
                        <span className="font-semibold text-[#111827]">{formId ? 'Edit Configuration' : 'New Configuration'}</span>
                        <button onClick={closeModal} className="p-1.5 hover:bg-[#F7F8FA] rounded text-[#6B7280] transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-white">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">API Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g., Generate Student API"
                                className="w-full border border-[#E6E8EC] rounded-lg px-3 py-2 text-[14px] text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all bg-[#FBFBFD] focus:bg-white"
                            />
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex flex-col gap-1.5 w-1/4">
                                <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">Method</label>
                                <select
                                    value={method}
                                    onChange={e => setMethod(e.target.value as any)}
                                    className="w-full border border-[#E6E8EC] rounded-lg px-3 py-2 text-[14px] text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all bg-[#FBFBFD] focus:bg-white"
                                >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1 w-full">
                                <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">API Endpoint</label>
                                <input
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    placeholder="https://api.example.com/data"
                                    className="w-full border border-[#E6E8EC] rounded-lg px-3 py-2 text-[14px] text-[#111827] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all bg-[#FBFBFD] focus:bg-white font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide flex justify-between">
                                <span>Headers (JSON Object format)</span>
                                <span className="font-normal text-[#A0A0A0]">Optional</span>
                            </label>
                            <textarea
                                value={headers}
                                onChange={e => setHeaders(e.target.value)}
                                placeholder='{\n  "Authorization": "Bearer TOKEN"\n}'
                                className="w-full h-24 border border-[#E6E8EC] rounded-lg px-3 py-2 text-[13px] text-[#111827] font-mono outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all bg-[#FBFBFD] focus:bg-white resize-y"
                            />
                        </div>

                        {method === "POST" && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide flex justify-between">
                                    <span>Request Body (JSON Object format)</span>
                                    <span className="font-normal text-[#A0A0A0]">Optional</span>
                                </label>
                                <textarea
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    placeholder='{\n  "query": "all"\n}'
                                    className="w-full h-32 border border-[#E6E8EC] rounded-lg px-3 py-2 text-[13px] text-[#111827] font-mono outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all bg-[#FBFBFD] focus:bg-white resize-y"
                                />
                            </div>
                        )}

                        {fetchStatus && (
                            <div className={`p-3 rounded-lg border text-[13px] font-medium flex items-center gap-2 ${fetchStatus.type === 'error' ? 'bg-[#FEE2E2] border-[#FDBA74] text-[#991B1B]' : 'bg-[#D1FAE5] border-[#6EE7B7] text-[#065F46]'}`}>
                                {fetchStatus.message}
                            </div>
                        )}

                    </div>

                    <div className="p-4 border-t border-[#E6E8EC] bg-[#FBFBFD] flex justify-between items-center shadow-inner z-10 shrink-0">
                        <button
                            onClick={handleFetch}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-[13px] font-medium transition-all shadow-sm ${isLoading ? 'bg-[#D1D5DB] text-[#6B7280] cursor-not-allowed' : 'bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#111827] border border-[#D1D5DB]'}`}
                        >
                            <UploadCloud size={16} />
                            {isLoading ? 'Fetching...' : 'Fetch Test & Extract Variables'}
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-[#6B7280] hover:text-[#111827] text-[13px] font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-[#4F46E5] hover:bg-[#6366F1] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors text-[13px] font-medium shadow-sm"
                            >
                                <Save size={16} /> Save Config
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
