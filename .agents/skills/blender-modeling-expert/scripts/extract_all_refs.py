"""
Extract reference content from Blender Manual HTML for modeling and scene skills.
Run: python extract_all_refs.py
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
        attrs_dict = dict(attrs)
        cls = attrs_dict.get('class','')
        role = attrs_dict.get('role','')
        if tag in self.skip_tags:
            self.skip_depth += 1
            return
        if self.skip_depth > 0:
            return
        if role == 'main' or (tag == 'div' and 'rst-content' in cls):
            self.in_article = True
        if not self.in_article:
            return
        if tag in ('h1','h2','h3','h4'):
            self.result.append('\n\n' + '#' * int(tag[1]) + ' ')
        elif tag == 'p':
            self.result.append('\n\n')
        elif tag == 'li':
            self.result.append('\n- ')
        elif tag == 'code':
            self.result.append('`')
        elif tag in ('strong','b'):
            self.result.append('**')
        elif tag in ('em','i'):
            self.result.append('*')
        elif tag == 'dt':
            self.result.append('\n\n**')
        elif tag == 'dd':
            self.result.append('\n  ')
        elif tag == 'br':
            self.result.append('\n')
            
    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.skip_depth = max(0, self.skip_depth - 1)
            return
        if self.skip_depth > 0 or not self.in_article:
            return
        if tag in ('h1','h2','h3','h4'):
            self.result.append('\n')
        elif tag == 'code':
            self.result.append('`')
        elif tag in ('strong','b'):
            self.result.append('**')
        elif tag in ('em','i'):
            self.result.append('*')
        elif tag == 'dt':
            self.result.append('**')
            
    def handle_data(self, data):
        if self.skip_depth > 0 or not self.in_article:
            return
        text = data.replace('\n',' ').strip()
        if text:
            self.result.append(text + ' ')
            
    def get_text(self):
        raw = ''.join(self.result)
        raw = re.sub(r'\n{3,}', '\n\n', raw)
        raw = re.sub(r'  +', ' ', raw)
        raw = raw.replace(' ¶', '')
        lines = raw.split('\n')
        cleaned = []
        skip_phrases = ['Previous','Next','Edit on GitHub','Built with',
                       'Copyright','Back to top','Toggle','Contents Menu']
        for line in lines:
            stripped = line.strip()
            if any(stripped.startswith(p) for p in skip_phrases):
                continue
            if stripped:
                cleaned.append(stripped)
        return '\n'.join(cleaned)

def extract_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    parser = BlenderManualExtractor()
    parser.feed(html)
    return parser.get_text()

def extract_multiple(base, paths, output_path, title):
    sections = []
    for path in paths:
        full = os.path.join(base, path)
        if os.path.isfile(full):
            text = extract_html(full)
            if len(text) > 100:
                sections.append(text)
        else:
            print(f"  SKIP (not found): {path}")
    combined = f"# {title}\n\n" + "\n\n---\n\n".join(sections)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(combined)
    print(f"  Wrote {os.path.basename(output_path)} ({len(combined)} chars, {len(sections)} sources)")

MANUAL = r'f:\Programming Projects\Agent & Skills Library\docs\blender_manual_v510_en.html'
MODELING_REF = r'f:\Programming Projects\Agent & Skills Library\.agents\skills\blender-modeling-expert\references'
SCENE_REF = r'f:\Programming Projects\Agent & Skills Library\.agents\skills\blender-scene-artist\references'

print("=== MODELING SKILL REFERENCES ===")

# 1. Mesh Primitives & Structure
extract_multiple(MANUAL, [
    'modeling/meshes/primitives.html',
    'modeling/meshes/structure.html',
], os.path.join(MODELING_REF, 'mesh_primitives_and_structure.md'),
'Mesh Primitives & Structure')

# 2. Core Mesh Editing (extrude, merge, delete, knife, bisect, normals)
extract_multiple(MANUAL, [
    'modeling/meshes/editing/mesh/extrude.html',
    'modeling/meshes/editing/mesh/merge.html',
    'modeling/meshes/editing/mesh/delete.html',
    'modeling/meshes/editing/mesh/knife_topology_tool.html',
    'modeling/meshes/editing/mesh/bisect.html',
    'modeling/meshes/editing/mesh/normals.html',
    'modeling/meshes/editing/mesh/duplicate.html',
    'modeling/meshes/editing/mesh/split.html',
    'modeling/meshes/editing/mesh/separate.html',
    'modeling/meshes/editing/mesh/cleanup.html',
], os.path.join(MODELING_REF, 'mesh_editing_core.md'),
'Core Mesh Editing Operations')

# 3. Edge Operations (loop cut, bevel, bridge, subdivide)
extract_multiple(MANUAL, [
    'modeling/meshes/editing/edge/loopcut_slide.html',
    'modeling/meshes/editing/edge/bevel.html',
    'modeling/meshes/editing/edge/bridge_edge_loops.html',
    'modeling/meshes/editing/edge/subdivide.html',
    'modeling/meshes/editing/edge/edge_slide.html',
    'modeling/meshes/editing/edge/screw.html',
], os.path.join(MODELING_REF, 'mesh_editing_edges.md'),
'Edge Editing Operations')

# 4. Face Operations (inset, extrude, fill, grid fill, booleans)
extract_multiple(MANUAL, [
    'modeling/meshes/editing/face/inset_faces.html',
    'modeling/meshes/editing/face/extrude_faces.html',
    'modeling/meshes/editing/face/extrude_faces_normal.html',
    'modeling/meshes/editing/face/fill.html',
    'modeling/meshes/editing/face/grid_fill.html',
    'modeling/meshes/editing/face/intersect_boolean.html',
    'modeling/meshes/editing/face/solidify_faces.html',
    'modeling/meshes/editing/face/triangles_quads.html',
], os.path.join(MODELING_REF, 'mesh_editing_faces.md'),
'Face Editing Operations')

# 5. Generate Modifiers
extract_multiple(MANUAL, [
    'modeling/modifiers/introduction.html',
    'modeling/modifiers/generate/subdivision_surface.html',
    'modeling/modifiers/generate/mirror.html',
    'modeling/modifiers/generate/array.html',
    'modeling/modifiers/generate/bevel.html',
    'modeling/modifiers/generate/booleans.html',
    'modeling/modifiers/generate/solidify.html',
    'modeling/modifiers/generate/screw.html',
    'modeling/modifiers/generate/skin.html',
    'modeling/modifiers/generate/remesh.html',
    'modeling/modifiers/generate/decimate.html',
    'modeling/modifiers/generate/wireframe.html',
    'modeling/modifiers/generate/multiresolution.html',
], os.path.join(MODELING_REF, 'modifiers_generate.md'),
'Generate Modifiers Reference')

# 6. Deform Modifiers
extract_multiple(MANUAL, [
    'modeling/modifiers/deform/index.html',
], os.path.join(MODELING_REF, 'modifiers_deform.md'),
'Deform Modifiers Reference')

# 7. Retopology
extract_multiple(MANUAL, [
    'modeling/meshes/retopology.html',
], os.path.join(MODELING_REF, 'retopology.md'),
'Retopology')

# 8. Geometry Nodes
extract_multiple(MANUAL, [
    'modeling/modifiers/geometry_nodes.html',
    'modeling/geometry_nodes/index.html',
], os.path.join(MODELING_REF, 'geometry_nodes_overview.md'),
'Geometry Nodes Overview')

print("\n=== SCENE ARTIST REFERENCES ===")

# 1. Lighting (light objects, world, light linking)
extract_multiple(MANUAL, [
    'render/lights/light_object.html',
    'render/lights/world.html',
    'render/lights/light_linking.html',
], os.path.join(SCENE_REF, 'lighting.md'),
'Lighting Reference')

# 2. Cameras
extract_multiple(MANUAL, [
    'render/cameras.html',
], os.path.join(SCENE_REF, 'cameras.md'),
'Camera Reference')

# 3. Principled BSDF & Key Shaders
extract_multiple(MANUAL, [
    'render/shader_nodes/shader/principled.html',
    'render/shader_nodes/shader/glass.html',
    'render/shader_nodes/shader/glossy.html',
    'render/shader_nodes/shader/emission.html',
    'render/shader_nodes/shader/metallic.html',
    'render/shader_nodes/shader/sss.html',
    'render/shader_nodes/shader/volume_principled.html',
], os.path.join(SCENE_REF, 'shader_nodes_key.md'),
'Key Shader Nodes Reference')

# 4. Materials
extract_multiple(MANUAL, [
    'render/materials/introduction.html',
    'render/materials/assignment.html',
    'render/materials/settings.html',
], os.path.join(SCENE_REF, 'materials.md'),
'Materials Reference')

# 5. Cycles Render Settings
extract_multiple(MANUAL, [
    'render/cycles/introduction.html',
    'render/cycles/render_settings/sampling.html',
    'render/cycles/render_settings/light_paths.html',
    'render/cycles/render_settings/film.html',
    'render/cycles/render_settings/performance.html',
    'render/cycles/gpu_rendering.html',
    'render/cycles/baking.html',
], os.path.join(SCENE_REF, 'cycles_render.md'),
'Cycles Render Settings')

# 6. Eevee Render Settings
extract_multiple(MANUAL, [
    'render/eevee/introduction.html',
    'render/eevee/render_settings/index.html',
    'render/eevee/material_settings.html',
    'render/eevee/light_settings.html',
    'render/eevee/world_settings.html',
], os.path.join(SCENE_REF, 'eevee_render.md'),
'Eevee Render Settings')

# 7. Cycles World & Light Settings
extract_multiple(MANUAL, [
    'render/cycles/world_settings.html',
    'render/cycles/light_settings.html',
], os.path.join(SCENE_REF, 'cycles_world_and_lights.md'),
'Cycles World & Light Settings')

# 8. Color Management
extract_multiple(MANUAL, [
    'render/color_management/index.html',
], os.path.join(SCENE_REF, 'color_management.md'),
'Color Management')

# 9. Scene Layout
extract_multiple(MANUAL, [
    'scene_layout/object/index.html',
    'scene_layout/collections/index.html',
    'scene_layout/scene/index.html',
], os.path.join(SCENE_REF, 'scene_layout.md'),
'Scene Layout')

# 10. Compositing
extract_multiple(MANUAL, [
    'compositing/introduction.html',
    'compositing/compositor_system.html',
], os.path.join(SCENE_REF, 'compositing.md'),
'Compositing Overview')

# 11. Output
extract_multiple(MANUAL, [
    'render/output/index.html',
], os.path.join(SCENE_REF, 'render_output.md'),
'Render Output')

print("\nDone!")
