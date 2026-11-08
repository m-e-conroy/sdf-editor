import bpy

def auto_organize_scene():
    """
    Automatically sorts all objects in the scene into logical collections:
    'Lights', 'Cameras', and 'Geometry'.
    """
    collections = {
        'LIGHT': 'Lights',
        'CAMERA': 'Cameras',
        'MESH': 'Geometry',
        'EMPTY': 'Helpers',
        'CURVE': 'Curves'
    }

    # Create collections if they don't exist
    for col_name in collections.values():
        if col_name not in bpy.data.collections:
            new_col = bpy.data.collections.new(col_name)
            bpy.context.scene.collection.children.link(new_col)

    # Move objects
    for obj in bpy.data.objects:
        obj_type = obj.type
        target_col_name = collections.get(obj_type)
        
        if target_col_name:
            target_col = bpy.data.collections[target_col_name]
            
            # Remove from other collections
            for col in obj.users_collection:
                col.objects.unlink(obj)
            
            # Link to target collection
            target_col.objects.link(obj)

if __name__ == "__main__":
    auto_organize_scene()
    print("Scene auto-organized.")
