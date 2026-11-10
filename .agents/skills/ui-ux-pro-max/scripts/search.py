#!/usr/bin/env python3
"""
UI/UX Pro Max Local Design Search Utility
Lightweight, zero-dependency search engine for querying local design intelligence.
"""

import sys
import os
import argparse
import re

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF_DIR = os.path.join(SKILL_DIR, "references")

def search_files(query, category=None):
    keywords = [w.lower() for w in re.findall(r'\w+', query)]
    if not keywords:
        print("Please provide a valid query.")
        return

    results = []
    
    if os.path.exists(REF_DIR):
        for root, _, files in os.walk(REF_DIR):
            for file in files:
                if not file.endswith(".md"):
                    continue
                if category and category.lower() not in file.lower():
                    continue
                
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                score = 0
                matching_lines = []
                lines = content.splitlines()
                
                for idx, line in enumerate(lines):
                    line_lower = line.lower()
                    matches = sum(1 for kw in keywords if kw in line_lower)
                    if matches > 0:
                        score += matches * 10
                        matching_lines.append((idx + 1, line.strip()))
                
                # Check title & headings
                for kw in keywords:
                    if kw in file.lower():
                        score += 30

                if score > 0:
                    results.append({
                        "file": file,
                        "score": score,
                        "matches": matching_lines[:5]
                    })

    results.sort(key=lambda x: x["score"], reverse=True)

    if not results:
        print(f"No direct matches found for: '{query}'. Consult references/ manually.")
        return

    print(f"\n--- UI/UX Pro Max Search Results for: '{query}' ---")
    for r in results[:4]:
        print(f"\n[Source: references/{r['file']} | Relevance: {r['score']}]")
        for line_no, text in r["matches"][:3]:
            print(f"  L{line_no}: {text}")
    print("\n----------------------------------------------------")

def main():
    parser = argparse.ArgumentParser(description="Query local design intelligence.")
    parser.add_argument("query", nargs="?", default="", help="Query keywords (e.g. 'e-commerce modern typography')")
    parser.add_argument("--category", choices=["styles", "colors", "typography", "anti-patterns"], help="Filter by category")
    parser.add_argument("--design-system", action="store_true", help="Generate or inspect design system tokens")
    args = parser.parse_args()

    if not args.query and not args.design_system:
        parser.print_help()
        sys.exit(1)

    search_files(args.query, args.category)

if __name__ == "__main__":
    main()
