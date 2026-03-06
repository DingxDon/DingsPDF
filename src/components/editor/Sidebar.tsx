"use client";

import { useEditor } from "@craftjs/core";
import { useEditorStore } from "@/store/useEditorStore";
import { Type, Image as ImageIcon, Minus, Table as TableIcon, Box, Columns, Rows } from "lucide-react";
import { Text } from "../craft/Text";
import { Container } from "../craft/Container";
import { Image } from "../craft/Image";
import { Divider } from "../craft/Divider";
import { RenderTable } from "../craft/Table";
import { Row } from "../craft/Row";
import { Column } from "../craft/Column";
import { Element } from "@craftjs/core";

export const Sidebar = () => {
    const { previewMode } = useEditorStore();
    const { connectors: { create } } = useEditor();

    if (previewMode) {
        return (
            <div className="w-64 border-r bg-white p-4 flex flex-col shrink-0 text-gray-500 text-sm italic">
                Tools are disabled in preview mode.
            </div>
        );
    }

    return (
        <div className="w-64 border-r bg-white p-4 flex flex-col shrink-0 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Components</h3>

            <div className="grid grid-cols-2 gap-2">
                <div ref={(ref: any) => ref && create(ref, <Text text="New Text" />)}>
                    <ToolItem icon={<Type size={18} />} label="Text Block" />
                </div>

                <div ref={(ref: any) => ref && create(ref, <Element is={Container} padding={20} canvas />)}>
                    <ToolItem icon={<Box size={18} />} label="Container" />
                </div>

                <div ref={(ref: any) => ref && create(ref, <Image />)}>
                    <ToolItem icon={<ImageIcon size={18} />} label="Image" />
                </div>

                <div ref={(ref: any) => ref && create(ref, <Divider />)}>
                    <ToolItem icon={<Minus size={18} />} label="Divider" />
                </div>

                <div ref={(ref: any) => ref && create(ref, <RenderTable />)}>
                    <ToolItem icon={<TableIcon size={18} />} label="Table" />
                </div>

                <div ref={(ref: any) => ref && create(ref, <Element is={Row} canvas />)}>
                    <ToolItem icon={<Rows size={18} />} label="Row" />
                </div>

                <div ref={(ref: any) => ref && create(ref, <Element is={Column} canvas />)}>
                    <ToolItem icon={<Columns size={18} />} label="Column" />
                </div>
            </div>
        </div>
    );
};

const ToolItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => {
    return (
        <div className="flex flex-col items-center justify-center p-3 border rounded border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-grab text-gray-700 transition-colors w-full h-full">
            <div className="mb-2 text-gray-500">
                {icon}
            </div>
            <span className="text-xs text-center">{label}</span>
        </div>
    );
};
