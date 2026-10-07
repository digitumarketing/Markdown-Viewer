"""Keyword-targeted copy for every page, merged over tool_pages.py / build_seo.py.

Each entry may override title, desc, h1, lede, features_title, steps_title, and
adds "about" (h2, [paragraphs]), "uses" (h2, [items]) and extra "faq" pairs.
Split across seo_copy_*.py files by group.
"""
import importlib
import pathlib
import sys

SEO_COPY = {}
for f in sorted(pathlib.Path(__file__).parent.glob("seo_copy_*.py")):
    try:
        SEO_COPY.update(importlib.import_module(f.stem).COPY)
    except Exception as e:  # one broken group should not hide the others while editing
        print("seo_copy: skipping %s: %s" % (f.name, e), file=sys.stderr)
