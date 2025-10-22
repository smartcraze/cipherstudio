import { Download, Upload, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { useRef } from "react";

export function Toolbar() {
  const { exportProject, importProject } = useFileSystem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      importProject(e.target.files);
    }
  };

  return (
    <div className="h-12 bg-titlebar-bg border-b border-panel-border flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg">CipherStudio</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImport}
          className="h-8"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={exportProject}
          className="h-8"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <ThemeToggle />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
