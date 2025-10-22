import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { FileSystemProvider } from "@/contexts/FileSystemContext";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeEditor } from "@/components/CodeEditor";
import { PreviewPanel } from "@/components/PreviewPanel";
import { Toolbar } from "@/components/Toolbar";

const Index = () => {
  return (
    <FileSystemProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <Toolbar />
        
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={20} minSize={15} maxSize={35}>
              <FileExplorer />
            </Panel>

            <PanelResizeHandle className="w-1 bg-panel-border hover:bg-primary transition-colors" />

            <Panel defaultSize={40} minSize={30}>
              <CodeEditor />
            </Panel>

            <PanelResizeHandle className="w-1 bg-panel-border hover:bg-primary transition-colors" />

            <Panel defaultSize={40} minSize={30}>
              <PreviewPanel />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </FileSystemProvider>
  );
};

export default Index;
