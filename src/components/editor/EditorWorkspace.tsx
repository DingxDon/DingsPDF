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
    const { isDarkMode } = useEditorStore();

    return (
        <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            <div className="flex flex-1 overflow-hidden relative w-full h-full">
                <LeftSidebar />

                <main className="flex-1 overflow-y-auto flex flex-col items-center custom-scrollbar relative bg-zinc-100 dark:bg-zinc-950/80 transition-colors duration-300"
                    style={{
                        backgroundImage: isDarkMode
                            ? "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)"
                            : "linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)",
                        backgroundSize: "24px 24px"
                    }}>
                    <div id="pdf-workspace-wrapper" className="pt-16 pb-32 w-full flex flex-col items-center transform scale-[0.55] sm:scale-75 md:scale-90 min-[1200px]:scale-100 origin-top transition-transform duration-300">
                        <Frame>
                            <Element is={CanvasArea} id="root_canvas" canvas>
                                <Element is={A4Page} preset="A4" customWidth={794} customHeight={1123} canvas>
                                    <Element is={CustomHTML} htmlCode={`<div style="padding: 3rem; text-align: center; font-family: sans-serif; color: ${isDarkMode ? '#A1A1AA' : '#6B7280'};">\n  <h2 style="font-size: 24px; color: ${isDarkMode ? '#F4F4F5' : '#111827'}; margin-bottom: 1rem;">Start building your PDF template</h2>\n  <p>Drag components from the Left Sidebar</p>\n</div>`} canvas />
                                </Element>
                            </Element>
                        </Frame>
                    </div>
                </main>
            </div>

            {/* Floating Topbar */}
            <Topbar />

            {/* Global Overlays */}
            <ComponentEditorModal />
            <DataSourceModal />
        </div>
    );
};
