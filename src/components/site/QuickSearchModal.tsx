import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCatalog } from "@/hooks/use-catalog";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowRight, Compass, Search, Tag, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

interface QuickSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearchModal({ open, onOpenChange }: QuickSearchModalProps) {
  const products = useCatalog();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter products
  const filtered = useMemo(() => {
    if (!products) return [];
    const term = query.trim().toLowerCase();
    if (!term) return products.slice(0, 6); // Show top 6 items by default

    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.tagline.toLowerCase().includes(term) ||
          p.material.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [products, query]);

  // Reset index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Autofocus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? filtered.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      navigate(`/product/${filtered[selectedIndex].slug}`);
      onOpenChange(false);
    }
  };

  const handleSelect = (slug: string) => {
    navigate(`/product/${slug}`);
    onOpenChange(false);
  };

  const categories = [
    "Whole Pods & Seeds",
    "Rare Terroirs",
    "Single-Origin Peppers",
    "Heritage Blends",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-border/80 bg-background/98 shadow-2xl backdrop-blur-2xl rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Forma Spices Catalog</DialogTitle>
        </DialogHeader>

        {/* Search input header */}
        <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3.5">
          <Search className="size-4.5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search spices, origins, grades... (e.g. cardamom, saffron, pepper)"
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="size-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex rounded border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 border-b border-border/40 bg-muted/20 scrollbar-none">
          <span className="text-[11px] font-medium text-muted-foreground shrink-0 flex items-center gap-1">
            <Tag className="size-3" /> Terroirs:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setQuery(cat)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors shrink-0",
                query.toLowerCase() === cat.toLowerCase()
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/60 text-foreground hover:border-primary/50",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Compass className="mx-auto size-8 text-muted-foreground/50 mb-2" />
              No matching spices found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {query ? "Matching Spices" : "Curated Harvest Selections"}
              </div>
              {filtered.map((item, idx) => (
                <div
                  key={item._id}
                  onClick={() => handleSelect(item.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl p-2.5 transition-colors cursor-pointer",
                    selectedIndex === idx
                      ? "bg-muted text-foreground"
                      : "hover:bg-muted/60 text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-11 rounded-lg object-cover bg-muted shrink-0 border border-border/40"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[13px] truncate">
                          {item.name}
                        </span>
                        <span className="rounded bg-sand px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[13px] font-medium text-foreground">
                      {formatMoney(item.price)}
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="hidden sm:flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
          <span>Navigate with ↑ and ↓ arrows</span>
          <span>Press Enter to select</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
