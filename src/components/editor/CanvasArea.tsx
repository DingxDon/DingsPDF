"use client";

import { useNode } from "@craftjs/core";
import React from "react";

export const CanvasArea = ({ children }: { children?: React.ReactNode }) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <div
            id="root_canvas"
            className="flex flex-col items-center flex-1 w-full gap-8 relative pb-20"
            ref={(ref: any) => connect(drag(ref))}
        >
            {children}
        </div>
    );
};

CanvasArea.craft = {
    rules: {
        canDrag: () => false,
    }
};
