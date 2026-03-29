"""
Generate bomb and non-bomb images for classification demo.
Uses PIL to create simple, synthetic bomb images with variations.
"""

import os
from PIL import Image, ImageDraw, ImageFont

def create_bomb_image(color, wick_type, size=200):
    """
    Create a bomb image with specified color and wick type.
    
    Args:
        color: RGB tuple (r, g, b) for bomb body
        wick_type: 0-3 for different wick styles
        size: Image size (size x size)
    
    Returns:
        PIL Image object
    """
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw bomb body (circle)
    body_radius = 50
    center_x, center_y = size // 2, size // 2
    
    draw.ellipse(
        [center_x - body_radius, center_y - body_radius,
         center_x + body_radius, center_y + body_radius],
        fill=color,
        outline='black',
        width=2
    )
    
    # Add shine
    shine_radius = 15
    shine_color = tuple(min(c + 80, 255) for c in color)
    draw.ellipse(
        [center_x - 20 - shine_radius, center_y - 20 - shine_radius,
         center_x - 20 + shine_radius, center_y - 20 + shine_radius],
        fill=shine_color,
        outline=None
    )
    
    # Draw wick (different styles)
    wick_x = center_x
    wick_start_y = center_y - body_radius
    
    if wick_type == 0:  # Straight wick
        draw.line(
            [(wick_x, wick_start_y), (wick_x, wick_start_y - 30)],
            fill='brown',
            width=3
        )
    elif wick_type == 1:  # Curved wick
        points = [(wick_x, wick_start_y), (wick_x - 10, wick_start_y - 15),
                  (wick_x - 5, wick_start_y - 30)]
        draw.line(points, fill='brown', width=3)
    elif wick_type == 2:  # Spiraling wick
        points = []
        for i in range(6):
            y = wick_start_y - i * 5
            x = wick_x + (5 if i % 2 == 0 else -5)
            points.append((x, y))
        draw.line(points, fill='brown', width=3)
    else:  # Zigzag wick
        points = []
        for i in range(7):
            y = wick_start_y - i * 4
            x = wick_x + (8 if i % 2 == 0 else -8)
            points.append((x, y))
        draw.line(points, fill='brown', width=3)
    
    # Draw spark at top
    spark_y = wick_start_y - 35
    draw.polygon(
        [(wick_x - 3, spark_y - 5), (wick_x + 3, spark_y - 5),
         (wick_x, spark_y + 5)],
        fill='yellow',
        outline='orange'
    )
    
    return img


def create_non_bomb_image(obj_type, size=200):
    """
    Create a non-bomb image (ball, sun, etc).
    
    Args:
        obj_type: 'ball', 'sun', 'circle', 'square'
        size: Image size
    
    Returns:
        PIL Image object
    """
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)
    
    center_x, center_y = size // 2, size // 2
    radius = 50
    
    if obj_type == 'ball':
        # Orange ball
        draw.ellipse(
            [center_x - radius, center_y - radius,
             center_x + radius, center_y + radius],
            fill='#ff8c00',
            outline='#cc6600',
            width=2
        )
        # Add some shine
        draw.ellipse(
            [center_x - 20, center_y - 20,
             center_x - 5, center_y - 5],
            fill='#ffb84d',
            outline=None
        )
    elif obj_type == 'sun':
        # Yellow sun
        draw.ellipse(
            [center_x - radius, center_y - radius,
             center_x + radius, center_y + radius],
            fill='#ffd700',
            outline='#ffa500',
            width=2
        )
        # Draw rays
        ray_length = 30
        for angle in range(0, 360, 45):
            import math
            rad = math.radians(angle)
            x1 = center_x + (radius + 10) * math.cos(rad)
            y1 = center_y + (radius + 10) * math.sin(rad)
            x2 = center_x + (radius + ray_length) * math.cos(rad)
            y2 = center_y + (radius + ray_length) * math.sin(rad)
            draw.line([(x1, y1), (x2, y2)], fill='#ffa500', width=3)
    elif obj_type == 'circle':
        # Simple blue circle
        draw.ellipse(
            [center_x - radius, center_y - radius,
             center_x + radius, center_y + radius],
            fill='#3b82f6',
            outline='#1d4ed8',
            width=2
        )
    else:  # square
        # Simple green square
        half = 40
        draw.rectangle(
            [center_x - half, center_y - half,
             center_x + half, center_y + half],
            fill='#10b981',
            outline='#059669',
            width=2
        )
    
    return img


def generate_all_bombs(output_dir='assets/images/bombs', size=200):
    """Generate all bomb variants"""
    os.makedirs(output_dir, exist_ok=True)
    
    bomb_colors = [
        (139, 0, 0),      # Dark red
        (255, 0, 0),      # Bright red
        (200, 50, 50),    # Crimson
        (180, 20, 20),    # Deep red
    ]
    
    bomb_data = []
    
    for color_idx, color in enumerate(bomb_colors):
        for wick_idx in range(4):
            img = create_bomb_image(color, wick_idx, size)
            filename = f'bomb_color{color_idx}_wick{wick_idx}.png'
            filepath = os.path.join(output_dir, filename)
            img.save(filepath)
            bomb_data.append({
                'filename': filename,
                'label': 1,  # 1 = bomb
                'color_idx': color_idx,
                'wick_idx': wick_idx
            })
    
    return bomb_data


def generate_all_non_bombs(output_dir='assets/images/non_bombs', size=200):
    """Generate all non-bomb images"""
    os.makedirs(output_dir, exist_ok=True)
    
    non_bomb_types = ['ball', 'sun', 'circle', 'square']
    non_bomb_data = []
    
    for obj_type in non_bomb_types:
        # Create 4 variants of each
        for variant in range(4):
            img = create_non_bomb_image(obj_type, size)
            filename = f'{obj_type}_{variant}.png'
            filepath = os.path.join(output_dir, filename)
            img.save(filepath)
            non_bomb_data.append({
                'filename': filename,
                'label': 0,  # 0 = not bomb
                'type': obj_type,
                'variant': variant
            })
    
    return non_bomb_data


if __name__ == "__main__":
    print("Generating bomb images...")
    bombs = generate_all_bombs()
    print(f"  Created {len(bombs)} bomb variants")
    
    print("Generating non-bomb images...")
    non_bombs = generate_all_non_bombs()
    print(f"  Created {len(non_bombs)} non-bomb images")
    
    print(f"\nTotal images: {len(bombs) + len(non_bombs)}")
    print("✓ Image generation complete!")
