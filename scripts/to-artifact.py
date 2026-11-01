#!/usr/bin/env python3
"""Strip the standalone wrapper from a concept so it can be published as a Claude Artifact.

The Artifact viewer adds its own <!doctype>/<head>/<body>, so it wants only the content between
the ARTIFACT:START / ARTIFACT:END markers.

Usage: python3 scripts/to-artifact.py concepts/03-strata-soft.html > /tmp/strata-soft.artifact.html
"""
import sys
from pathlib import Path

text = Path(sys.argv[1]).read_text(encoding="utf-8")
start, end = "<!-- ARTIFACT:START -->", "<!-- ARTIFACT:END -->"
if start not in text or end not in text:
    sys.exit("markers not found: " + sys.argv[1])
sys.stdout.write(text.split(start, 1)[1].split(end, 1)[0].strip() + "\n")
