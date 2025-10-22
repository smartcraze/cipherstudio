import Editor, { OnMount } from "@monaco-editor/react";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { useEffect, useState } from "react";
import { File } from "lucide-react";
import * as monaco from "monaco-editor";

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

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Configure TypeScript compiler options for JSX support
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      reactNamespace: 'React',
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      reactNamespace: 'React',
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    });

    // Disable type checking for external libraries
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [1375, 1378, 2307, 2304, 2552, 2792, 2339],
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [1375, 1378, 2307, 2304, 2552, 2792, 2339],
    });

    // Add React types
    const reactTypes = `
      declare module 'react' {
        export function useState<T>(initialState: T | (() => T)): [T, (value: T) => void];
        export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
        export function useRef<T>(initialValue: T): { current: T };
        export function useMemo<T>(factory: () => T, deps: any[]): T;
        export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
        export function createContext<T>(defaultValue: T): any;
        export function useContext<T>(context: any): T;
        export const Fragment: any;
      }
    `;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactTypes,
      'file:///node_modules/@types/react/index.d.ts'
    );
  };

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
          onMount={handleEditorDidMount}
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
