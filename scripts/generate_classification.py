"""
Generate classification demonstration data and images.
Creates labeled images for students to learn classification.
"""

import json
import os
import sys

# Import bomb generator
sys.path.insert(0, os.path.dirname(__file__))
from bomb_generator import generate_all_bombs, generate_all_non_bombs


def generate_classification_demo(output_dir='data'):
    """
    Generate all images and create classification demo JSON.
    
    Returns:
        Dictionary with demo configuration
    """
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating bomb images...")
    bombs = generate_all_bombs()
    print(f"✓ Created {len(bombs)} bomb variants")
    
    print("Generating non-bomb images...")
    non_bombs = generate_all_non_bombs()
    print(f"✓ Created {len(non_bombs)} non-bomb images")
    
    # Combine all images
    all_images = bombs + non_bombs
    
    # Shuffle for better learning (but keep ground truth in metadata)
    import random
    random.seed(42)
    random.shuffle(all_images)
    
    # Create session (items to label)
    session = []
    for idx, img_data in enumerate(all_images):
        session.append({
            'id': idx,
            'image_path': img_data['filename'],
            'image_dir': 'bombs' if img_data['label'] == 1 else 'non_bombs',
            'ground_truth': img_data['label'],  # 1=bomb, 0=not bomb
            'emoji': '💣' if img_data['label'] == 1 else random.choice(['🍎', '⚽', '🎱', '🏀', '🍉', '🎳']),
            'story_text': f"Officer Doggo sniffed bag #{idx + 1}... Could this be dangerous?"
        })

    # Create demo configuration
    demo = {
        'metadata': {
            'algorithm': 'Classification Training',
            'task': 'Classify images as bomb or not bomb',
            'total_images': len(session),
            'bombs': len(bombs),
            'non_bombs': len(non_bombs),
            'image_size': 200
        },
        'session': session
    }
    
    # Save to JSON
    output_path = os.path.join(output_dir, 'classification_demo.json')
    with open(output_path, 'w') as f:
        json.dump(demo, f, indent=2)
    
    print(f"✓ Saved demo configuration to {output_path}")
    print(f"\nTotal images: {len(session)}")
    print(f"  Bombs: {len(bombs)}")
    print(f"  Non-bombs: {len(non_bombs)}")
    
    return demo


if __name__ == "__main__":
    import os
    
    # Ensure we're in the right directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(os.path.dirname(script_dir))
    
    demo = generate_classification_demo()
    print("\n✓ Classification demo ready!")
