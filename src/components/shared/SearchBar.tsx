import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileArchiveIcon,
  Folder,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileColor } from "@/utils/fileUtils";
import { useSearch, useDebounce } from "@/hooks/useSearch";
import type { SearchResult, FolderSearchResult } from "@/hooks/useSearch";

type ResultItem =
  | { kind: "folder"; data: FolderSearchResult }
  | { kind: "file"; data: SearchResult };

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = useSearch(debouncedQuery);

  const items = useMemo<ResultItem[]>(() => {
    if (!results) return [];
    const list: ResultItem[] = [];
    for (const f of results.folders) list.push({ kind: "folder", data: f });
    for (const f of results.files) list.push({ kind: "file", data: f });
    return list;
  }, [results]);

  const showDropdown = isFocused && query.length > 0;

  // Reset active index when results change
  useEffect(() => setActiveIndex(-1), [items]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
      if (e.key === "Escape") {
        setQuery("");
        setIsFocused(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function selectItem(item: ResultItem) {
    setQuery("");
    setIsFocused(false);
    inputRef.current?.blur();
    if (item.kind === "folder") {
      navigate(`/files?folder=${item.data.id}`);
    } else {
      const folderId = item.data.folder_id;
      navigate(`/files${folderId ? `?folder=${folderId}` : ""}`);
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < items.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : items.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectItem(items[activeIndex]);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 h-9 transition-all duration-150",
          isFocused
            ? "border-primary/50 bg-background shadow-sm"
            : "border-input hover:bg-muted",
        )}
      >
        {isLoading && debouncedQuery ? (
          <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar archivos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleInputKeyDown}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-background rounded-xl border border-border shadow-xl overflow-hidden z-50 animate-scale-in">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <FileIcon className="h-7 w-7 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                No se encontraron resultados para{" "}
                <span className="font-medium text-foreground">
                  "{debouncedQuery}"
                </span>
              </p>
            </div>
          )}

          {items.length > 0 && (
            <div className="p-1.5">
              {/* Folders */}
              {results!.folders.length > 0 && (
                <>
                  <p className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Carpetas
                  </p>
                  <div className="space-y-0.5">
                    {results!.folders.map((folder, i) => {
                      const globalIdx = i;
                      return (
                        <button
                          key={folder.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectItem({ kind: "folder", data: folder })}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 transition-colors text-left",
                            activeIndex === globalIdx ? "bg-muted" : "hover:bg-muted",
                          )}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                            <Folder className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">
                            {folder.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Files */}
              {results!.files.length > 0 && (
                <>
                  <p className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Archivos · {results!.files.length} resultado{results!.files.length !== 1 ? "s" : ""}
                  </p>
                  <div className="space-y-0.5 max-h-72 overflow-y-auto">
                    {results!.files.map((result, i) => {
                      const globalIdx = results!.folders.length + i;
                      const colorClass = getFileColor(result.mime_type);
                      const Icon = getFileTypeIcon(result.mime_type);

                      return (
                        <button
                          key={result.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectItem({ kind: "file", data: result })}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 transition-colors text-left",
                            activeIndex === globalIdx ? "bg-muted" : "hover:bg-muted",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                              colorClass,
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {result.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(result.size)} ·{" "}
                              {result.extension.toUpperCase()} ·{" "}
                              {result.folder_name ? (
                                <span className="text-primary/80">
                                  {result.folder_name}
                                </span>
                              ) : (
                                <span>Raíz</span>
                              )}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getFileTypeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return FileVideoIcon;
  if (mimeType.startsWith("audio/")) return FileAudioIcon;
  if (mimeType === "application/pdf") return FileTextIcon;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return FileSpreadsheetIcon;
  if (mimeType.includes("zip") || mimeType.includes("rar"))
    return FileArchiveIcon;
  return FileIcon;
}
