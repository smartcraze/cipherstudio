import Editor from "@monaco-editor/react";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { useEffect, useState } from "react";
import { File } from "lucide-react";

export function CodeEditor() {
  const { selectedFile, updateFileContent } = useFileSystem();
  const [theme, setTheme] = useState<"vs-dark" | "vs-light">("vs-dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "vs-dark" : "vs-light");

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "vs-dark" : "vs-light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const getLanguage = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      tsx: "typescript",
      ts: "typescript",
      jsx: "javascript",
      js: "javascript",
      css: "css",
      html: "html",
      json: "json",
      md: "markdown",
    };
    return languageMap[ext || ""] || "plaintext";
  };

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-editor-bg text-muted-foreground">
        <div className="text-center">
          <File className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No file selected</p>
          <p className="text-sm mt-2">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-editor-bg">
      <div className="h-10 flex items-center px-4 border-b border-panel-border bg-titlebar-bg">
        <File className="w-4 h-4 mr-2 text-muted-foreground" />
        <span className="text-sm font-medium">{selectedFile.name}</span>
      </div>
      <div className="h-[calc(100%-2.5rem)]">
        <Editor
          height="100%"
          language={getLanguage(selectedFile.name)}
          value={selectedFile.content || ""}
          theme={theme}
          onChange={(value) => {
            if (value !== undefined) {
              updateFileContent(selectedFile.id, value);
            }
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
        />
      </div>
    </div>
  );
}
