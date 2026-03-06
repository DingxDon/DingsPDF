"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { Topbar } from "./Topbar";
import { LeftSidebar } from "./LeftSidebar";
import { CanvasArea } from "./CanvasArea";
import { Frame, Element } from "@craftjs/core";
import { CustomHTML } from "../craft/CustomHTML";
import { A4Page } from "../craft/A4Page";
import { ComponentEditorModal } from "./ComponentEditorModal";
import { DataSourceModal } from "./DataSourceModal";

export const EditorWorkspace = () => {
    return (
        <div className="flex flex-col h-full w-full">
            <Topbar />
            <div className="flex flex-1 overflow-hidden relative w-full h-full bg-[#F7F8FA]">
                <LeftSidebar />

                <main className="flex-1 overflow-y-auto flex flex-col items-center custom-scrollbar relative"
                    style={{
                        backgroundImage: "linear-gradient(to right, #e6e8ec 1px, transparent 1px), linear-gradient(to bottom, #e6e8ec 1px, transparent 1px)",
                        backgroundSize: "24px 24px"
                    }}>
                    <div className="py-16 w-full flex flex-col items-center">
                        <Frame>
                            <Element is={CanvasArea} id="root_canvas" canvas>
                                <Element is={A4Page} preset="A4" customWidth={794} customHeight={1123} canvas>
                                    <Element is={CustomHTML} htmlCode={`<div style="padding: 3rem; text-align: center; font-family: sans-serif; color: #6B7280;">\n  <h2 style="font-size: 24px; color: #111827; margin-bottom: 1rem;">Start building your PDF template</h2>\n  <p>Drag components from the Left Sidebar</p>\n</div>`} canvas />
                                </Element>
                            </Element>
                        </Frame>
                    </div>
                </main>
            </div>

            {/* Global Overlays */}
            <ComponentEditorModal />
            <DataSourceModal />
        </div>
    );
};
