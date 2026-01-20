#!/usr/bin/env python3
"""
GIMP Python-Fu script to extract layer coordinates from badge.xcf
Run this in GIMP's Python Console (Filters > Python-Fu > Console)

Or run from command line if GIMP is installed:
gimp --batch-interpreter python-fu-eval -b 'exec(open("extract_badge_coords.py").read())'
"""

from gimpfu import *

def extract_badge_coordinates():
    """Extract coordinates for 'photo' and 'name' layers from the open image."""
    try:
        # Get the first open image (or you can specify which image)
        images = gimp.image_list()
        if not images:
            print("Error: No image open in GIMP")
            return None
        
        img = images[0]
        print(f"\n=== Extracting coordinates from: {img.filename or 'Untitled'} ===")
        print(f"Image dimensions: {img.width}x{img.height}\n")
        
        coords = {}
        
        # Iterate through all layers
        for layer in img.layers:
            layer_name = layer.name.lower()
            if layer_name == 'photo' or layer_name == 'name':
                x = layer.offsets[0]
                y = layer.offsets[1]
                width = layer.width
                height = layer.height
                
                coords[layer_name] = {
                    'x': x,
                    'y': y,
                    'width': width,
                    'height': height
                }
                
                print(f"Layer '{layer.name}':")
                print(f"  Position: ({x}, {y})")
                print(f"  Size: {width}x{height}")
                print(f"  CSS percentages (relative to {img.width}x{img.height}):")
                print(f"    left: {x / img.width * 100}%")
                print(f"    top: {y / img.height * 100}%")
                print(f"    width: {width / img.width * 100}%")
                print(f"    height: {height / img.height * 100}%")
                print()
        
        if not coords:
            print("Warning: No 'photo' or 'name' layers found!")
            print("Available layers:")
            for layer in img.layers:
                print(f"  - {layer.name}")
        
        return coords
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

# If running in GIMP's Python console, just call the function
if __name__ == '__main__':
    extract_badge_coordinates()
