import { Download, Upload, Code2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const handleReset = () => {
    localStorage.removeItem("cipherstudio-files");
    window.location.reload();
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Project?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all your files and reset to the default project. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Reset Project</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
