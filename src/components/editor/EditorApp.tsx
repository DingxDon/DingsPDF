"use client";

import { Editor, Frame, Element } from "@craftjs/core";
import { EditorWorkspace } from "./EditorWorkspace";
import { CustomHTML } from "../craft/CustomHTML";
import { CanvasArea } from "./CanvasArea";
import { A4Page } from "../craft/A4Page";

export const EditorApp = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#E5E5E5] text-[#333333]">
      <style jsx global>{`
              .bg-dot-pattern {
                background-image: radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0);
              }
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #cbd5e1;
                border-radius: 20px;
              }
            `}</style>

      <Editor resolver={{ CanvasArea, CustomHTML, A4Page }}>
        <EditorWorkspace />
      </Editor>
    </div>
  );
};
