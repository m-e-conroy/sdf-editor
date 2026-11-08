"""
Extract supplementary reference content (thin files from first pass).
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from html.parser import HTMLParser
import os, re

class BlenderManualExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
        self.in_article = False
        self.skip_depth = 0
        self.skip_tags = {'script','style','nav'}
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        cls = d.get('class','')
        role = d.get('role','')
        if tag in self.skip_tags: self.skip_depth += 1; return
        if self.skip_depth > 0: return
        if role == 'main' or (tag == 'div' and 'rst-content' in cls): self.in_article = True
        if not self.in_article: return
        if tag in ('h1','h2','h3','h4'): self.result.append('\n\n' + '#' * int(tag[1]) + ' ')
        elif tag == 'p': self.result.append('\n\n')
        elif tag == 'li': self.result.append('\n- ')
        elif tag == 'code': self.result.append('`')
        elif tag in ('strong','b'): self.result.append('**')
        elif tag in ('em','i'): self.result.append('*')
        elif tag == 'dt': self.result.append('\n\n**')
        elif tag == 'dd': self.result.append('\n  ')
        elif tag == 'br': self.result.append('\n')
    def handle_endtag(self, tag):
        if tag in self.skip_tags: self.skip_depth = max(0, self.skip_depth - 1); return
        if self.skip_depth > 0 or not self.in_article: return
        if tag in ('h1','h2','h3','h4'): self.result.append('\n')
        elif tag == 'code': self.result.append('`')
        elif tag in ('strong','b'): self.result.append('**')
        elif tag in ('em','i'): self.result.append('*')
        elif tag == 'dt': self.result.append('**')
    def handle_data(self, data):
        if self.skip_depth > 0 or not self.in_article: return
        text = data.replace('\n',' ').strip()
        if text: self.result.append(text + ' ')
    def get_text(self):
        raw = ''.join(self.result)
        raw = re.sub(r'\n{3,}', '\n\n', raw)
        raw = re.sub(r'  +', ' ', raw)
        raw = raw.replace(' ¶', '')
        lines = raw.split('\n')
        cleaned = []
        skip_phrases = ['Previous','Next','Edit on GitHub','Built with','Copyright','Back to top','Toggle','Contents Menu']
        for line in lines:
            s = line.strip()
            if any(s.startswith(p) for p in skip_phrases): continue
            if s: cleaned.append(s)
        return '\n'.join(cleaned)

def extract_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f: html = f.read()
    p = BlenderManualExtractor(); p.feed(html); return p.get_text()

def extract_multiple(base, paths, output_path, title):
    sections = []
    for path in paths:
        full = os.path.join(base, path)
        if os.path.isfile(full):
            text = extract_html(full)
            if len(text) > 100: sections.append(text)
    combined = f"# {title}\n\n" + "\n\n---\n\n".join(sections)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f: f.write(combined)
    print(f"  Wrote {os.path.basename(output_path)} ({len(combined)} chars, {len(sections)} sources)")

MANUAL = r'f:\Programming Projects\Agent & Skills Library\docs\blender_manual_v510_en.html'
MODELING_REF = r'f:\Programming Projects\Agent & Skills Library\.agents\skills\blender-modeling-expert\references'
SCENE_REF = r'f:\Programming Projects\Agent & Skills Library\.agents\skills\blender-scene-artist\references'

print("=== SUPPLEMENTARY EXTRACTION ===")

# Deform Modifiers (was thin - expand with individual pages)
extract_multiple(MANUAL, [
    'modeling/modifiers/deform/simple_deform.html',
    'modeling/modifiers/deform/lattice.html',
    'modeling/modifiers/deform/shrinkwrap.html',
    'modeling/modifiers/deform/curve.html',
    'modeling/modifiers/deform/displace.html',
    'modeling/modifiers/deform/cast.html',
    'modeling/modifiers/deform/smooth.html',
    'modeling/modifiers/deform/wave.html',
], os.path.join(MODELING_REF, 'modifiers_deform.md'),
'Deform Modifiers Reference')

# Color Management (was thin)
extract_multiple(MANUAL, [
    'render/color_management/displays_views.html',
    'render/color_management/color_spaces.html',
    'render/color_management/opencolorio.html',
], os.path.join(SCENE_REF, 'color_management.md'),
'Color Management')

# Render Output (was thin)
extract_multiple(MANUAL, [
    'render/output/introduction.html',
    'render/output/animation.html',
], os.path.join(SCENE_REF, 'render_output.md'),
'Render Output')

# Scene Layout (was thin - expand)
extract_multiple(MANUAL, [
    'scene_layout/object/introduction.html',
    'scene_layout/object/types.html',
    'scene_layout/object/origin.html',
    'scene_layout/collections/index.html',
], os.path.join(SCENE_REF, 'scene_layout.md'),
'Scene Layout')

# Shader node textures
extract_multiple(MANUAL, [
    'render/shader_nodes/textures/index.html',
], os.path.join(SCENE_REF, 'shader_textures_overview.md'),
'Shader Texture Nodes Overview')

print("\nDone supplementary!")
