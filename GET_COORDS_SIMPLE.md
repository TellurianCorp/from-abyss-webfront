# Simple Way to Get Layer Coordinates from GIMP

## Method 1: Using GIMP's Layer Dialog (Easiest)

1. Open `public/imgs/badge.xcf` in GIMP
2. Open the **Layers** dialog (Windows > Dockable Dialogs > Layers, or Ctrl+L)
3. For each layer ("photo" and "name"):
   - Right-click on the layer
   - Select **"Edit Layer Attributes"** (or double-click the layer name)
   - Note the **"Offset X"** and **"Offset Y"** values
   - The layer size is shown in the Layers dialog (width x height)

## Method 2: Using GIMP's Info Window

1. Open `public/imgs/badge.xcf` in GIMP
2. Select the "photo" layer
3. Open **Windows > Dockable Dialogs > Pointer** (or Tools > Info)
4. Move your mouse over the layer - you'll see coordinates
5. The layer's position is shown when you select it with the Move tool

## Method 3: Check Layer Properties

1. Select the "photo" layer
2. Go to **Layer > Layer Boundary Size**
3. This shows the layer's position and size

## What I Need:

Please provide:
- **Photo layer**: X, Y, Width, Height
- **Name layer**: X, Y, Width, Height
- **Badge image dimensions**: Width x Height (should be 1024x1792)

Example format:
```
Badge image: 1024 x 1792
Photo layer: x=176, y=618, width=360, height=420
Name layer: x=170, y=900, width=640, height=70
```
