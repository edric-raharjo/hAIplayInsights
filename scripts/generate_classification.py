import json
import os
import random

def get_features(emoji):
    features = {
        '⚽': [10, 8, 0, 450, 0],
        '🎱': [10, 2, 0, 160, 0],
        '🏀': [10, 9, 0, 620, 0],
        '🍎': [8, 1, 10, 150, 1],
        '🍌': [1, 0, 10, 120, 1],
        '🍉': [7, 0, 9, 9000, 0],
        '🌲': [1, 0, 0, 500000, 1],
        '🌳': [3, 0, 0, 800000, 1]
    }
    return features.get(emoji, [0, 0, 0, 0, 0])

def generate_classification_demo(output_dir='data'):
    os.makedirs(output_dir, exist_ok=True)
    
    balls = [
        {'label': 1, 'emoji': '⚽'},
        {'label': 1, 'emoji': '🎱'},
        {'label': 1, 'emoji': '🏀'}
    ] * 8
    
    not_balls = [
        {'label': 0, 'emoji': '🍎'},
        {'label': 0, 'emoji': '🍌'},
        {'label': 0, 'emoji': '🍉'},
        {'label': 0, 'emoji': '🌲'},
        {'label': 0, 'emoji': '🌳'}
    ] * 5
    
    all_items = balls + not_balls
    random.seed(42)
    random.shuffle(all_items)
    
    train_session = []
    test_session = []
    
    for idx, item in enumerate(all_items[:30]):
        feat = get_features(item['emoji'])
        noise_feat = [
            max(0, min(10, feat[0] + random.uniform(-1, 1))),
            max(0, min(10, feat[1] + random.uniform(-1, 1))),
            max(0, min(10, feat[2] + random.uniform(-1, 1))),
            max(0, feat[3] * random.uniform(0.9, 1.1)),
            feat[4]
        ]
        
        data_point = {
            'id': idx,
            'image_path': f'item_{idx}.png',
            'image_dir': 'balls' if item['label'] == 1 else 'not_balls',
            'ground_truth': item['label'],
            'emoji': item['emoji'],
            'story_text': f'Item #{idx + 1}... Could this be a ball?',
            'features': noise_feat
        }
        
        if idx < 15:
            train_session.append(data_point)
        else:
            test_session.append(data_point)
            
    demo = {
        'metadata': {
            'algorithm': 'KNN Classification',
            'task': 'Classify items as ball or not ball',
            'total_train': len(train_session),
            'total_test': len(test_session),
            'feature_names': ['Sphericity (0-10)', 'Bounciness (0-10)', 'Edibility (0-10)', 'Weight (g)', 'Is Plant'],
            'image_size': 200
        },
        'session': train_session,
        'test_set': test_session
    }
    
    output_path = os.path.join(output_dir, 'classification_demo.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(demo, f, indent=2, ensure_ascii=False)
        
    print(f'Done! Saved {len(train_session)} train and {len(test_session)} test items to {output_path}')
    return demo

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Assuming insights is parent of scripts
    os.chdir(os.path.dirname(script_dir))
    generate_classification_demo()
