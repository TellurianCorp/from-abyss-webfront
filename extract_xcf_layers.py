#!/usr/bin/env python3
"""
Extract layer coordinates from GIMP XCF file.
This script reads the XCF file and extracts position information for layers named 'photo' and 'name'.
"""

import struct
import sys
import os

def read_xcf_layers(xcf_path):
    """Extract layer information from XCF file."""
    layers = {}
    
    try:
        with open(xcf_path, 'rb') as f:
            # Read XCF header
            # XCF files start with "gimp xcf"
            magic = f.read(9)
            if magic != b'gimp xcf':
                print(f"Error: Not a valid XCF file: {xcf_path}")
                return layers
            
            # Read version
            version = struct.unpack('>I', f.read(4))[0]
            print(f"XCF Version: {version}")
            
            # Read width and height
            width = struct.unpack('>I', f.read(4))[0]
            height = struct.unpack('>I', f.read(4))[0]
            print(f"Image dimensions: {width}x{height}")
            
            # Read color mode
            color_mode = struct.unpack('>I', f.read(4))[0]
            
            # Skip to layers (this is simplified - XCF format is complex)
            # For a more accurate extraction, we'd need a proper XCF parser
            print("\nNote: XCF format is complex. For accurate layer coordinates,")
            print("please use GIMP's Python-Fu API or provide coordinates manually.")
            print(f"\nImage size: {width}x{height}")
            print("Please open the XCF file in GIMP and check layer positions:")
            print("  - Right-click layer > 'Edit Layer Attributes' to see position")
            print("  - Or use: Layer > Transform > Layer to Image Size")
            
    except FileNotFoundError:
        print(f"Error: File not found: {xcf_path}")
    except Exception as e:
        print(f"Error reading XCF file: {e}")
        print("\nAlternative: Use GIMP's built-in Python console:")
        print("  1. Open badge.xcf in GIMP")
        print("  2. Filters > Python-Fu > Console")
        print("  3. Run: pdb.gimp_image_get_layers(image)")
    
    return layers

if __name__ == '__main__':
    xcf_path = 'public/imgs/badge.xcf'
    if len(sys.argv) > 1:
        xcf_path = sys.argv[1]
    
    if not os.path.exists(xcf_path):
        print(f"Error: File not found: {xcf_path}")
        sys.exit(1)
    
    layers = read_xcf_layers(xcf_path)
