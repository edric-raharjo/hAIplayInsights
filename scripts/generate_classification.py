import json
import os
import random

def generate_classification_demo(output_dir='data'):
    os.makedirs(output_dir, exist_ok=True)
    
    balls = [
        {'label': 1, 'emoji': '⚽'},
        {'label': 1, 'emoji': '🎱'},
        {'label': 1, 'emoji': '🏀'}
    ] * 5
    
    not_balls = [
        {'label': 0, 'emoji': '🍎'},
        {'label': 0, 'emoji': '🍌'},
        {'label': 0, 'emoji': '🍉'},
        {'label': 0, 'emoji': '🌲'},
        {'label': 0, 'emoji': '🌳'}
    ] * 3
    
    all_items = balls + not_balls
    random.seed(42)
    random.shuffle(all_items)
    
    session = []
    for idx, item in enumerate(all_items):
        session.append({
            'id': idx,
            'image_path': f'item_{idx}.png',
            'image_dir': 'balls' if item['label'] == 1 else 'not_balls',
            'ground_truth': item['label'],
            'emoji': item['emoji'],
            'story_text': f'Officer Doggo sniffed item #{idx + 1}... Is it a ball?'
        })
        
    demo = {
        'metadata': {
            'algorithm': 'Classification Training',
            'task': 'Classify items as ball or not ball',
            'total_images': len(session),
            'bombs': len(balls),
            'non_bombs': len(not_balls),
            'image_size': 200
        },
        'session': session
    }
    
    output_path = os.path.join(output_dir, 'classification_demo.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(demo, f, indent=2, ensure_ascii=False)
        
    print(f'Done! Saved to {output_path}')
    return demo

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(os.path.dirname(script_dir))
    generate_classification_demo()
