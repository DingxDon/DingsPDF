"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import { useEditorStore } from "@/store/useEditorStore";

export const ResizableWrapper = ({ children }: any) => {
    const { selected, connectors: { connect } } = useNode((node) => ({
        selected: node.events.selected,
    }));

    const previewMode = useEditorStore(state => state.previewMode);

    if (previewMode) {
        return (
            <div className="w-full">
                {children}
            </div>
        );
    }

    return (
        <div
            ref={(ref: any) => connect(ref)}
            className={`w-full relative transition-all duration-200 ${selected
                ? "outline outline-2 outline-[#4F46E5] z-20 shadow-sm"
                : "hover:outline hover:outline-1 hover:outline-[#E6E8EC] z-0"
                }`}
        >
            {children}
        </div>
    );
};
