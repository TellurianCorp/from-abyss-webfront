# How to Extract Layer Coordinates from badge.xcf

## Method 1: Using GIMP's Python Console (Recommended)

1. Open `public/imgs/badge.xcf` in GIMP
2. Go to **Filters > Python-Fu > Console**
3. Copy and paste this code:

```python
from gimpfu import *

img = gimp.image_list()[0]
print(f"Image: {img.width}x{img.height}\n")

for layer in img.layers:
    if layer.name.lower() in ['photo', 'name']:
        x, y = layer.offsets
        w, h = layer.width, layer.height
        print(f"Layer '{layer.name}':")
        print(f"  Position: ({x}, {y})")
        print(f"  Size: {w}x{h}")
        print(f"  CSS: left={x/img.width*100}%, top={y/img.height*100}%, width={w/img.width*100}%, height={h/img.height*100}%")
        print()
```

4. Press Enter to run
5. Copy the output coordinates

## Method 2: Using the Script File

1. Open `badge.xcf` in GIMP
2. Go to **Filters > Python-Fu > Console**
3. Run: `exec(open('extract_badge_coords.py').read())`

## Method 3: Manual Check in GIMP

1. Open `badge.xcf` in GIMP
2. Select the "photo" layer
3. Check the position in the Layers dialog (right-click layer > Edit Layer Attributes)
4. Note the X and Y offsets
5. Repeat for the "name" layer

Once you have the coordinates, provide them and I'll update the CSS accordingly.
