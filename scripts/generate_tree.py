"""
Generate decision tree demonstration data.
Creates a synthetic dataset and pre-computes Gini impurity for splits.
"""

import json
import random
import math

def calculate_gini(labels):
    """
    Calculate Gini impurity for a set of labels.
    Gini = 1 - Σ(p_i)^2
    """
    if not labels:
        return 0
    
    counts = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    
    gini = 1.0
    total = len(labels)
    for count in counts.values():
        probability = count / total
        gini -= probability ** 2
    
    return round(gini, 4)


def calculate_weighted_gini(left_labels, right_labels):
    """Calculate weighted Gini after a split"""
    total = len(left_labels) + len(right_labels)
    if total == 0:
        return 0
    
    left_weight = len(left_labels) / total
    right_weight = len(right_labels) / total
    
    left_gini = calculate_gini(left_labels)
    right_gini = calculate_gini(right_labels)
    
    weighted = left_weight * left_gini + right_weight * right_gini
    return round(weighted, 4)


def calculate_information_gain(parent_gini, left_labels, right_labels):
    """Calculate information gain from a split"""
    weighted_gini = calculate_weighted_gini(left_labels, right_labels)
    ig = parent_gini - weighted_gini
    return round(ig, 4)


def generate_synthetic_dataset(n_samples=30, random_seed=42):
    """
    Generate synthetic dataset with 3 features and binary target.
    Features: Age, Income, Employment_Years
    Target: Approved (1) or Not Approved (0)
    """
    random.seed(random_seed)
    
    dataset = []
    for i in range(n_samples):
        age = random.randint(20, 70)
        income = random.randint(20000, 150000)
        employment_years = random.randint(0, 40)
        
        # Simple rule: Approve if income > 50000 AND employment_years > 2
        # Add some noise for realism
        approved = 1 if (income > 50000 and employment_years > 2) else 0
        if random.random() < 0.2:  # 20% noise
            approved = 1 - approved
        
        dataset.append({
            'age': age,
            'income': income,
            'employment_years': employment_years,
            'approved': approved
        })
    
    return dataset


def find_best_split(dataset, feature_name, labels):
    """
    Find the best threshold for splitting on a feature.
    Returns: (threshold, gini_after_split, left_samples, right_samples, info_gain)
    """
    parent_gini = calculate_gini(labels)
    
    # Get all unique values for this feature
    values = sorted(set(d[feature_name] for d in dataset))
    
    best_threshold = None
    best_gini = float('inf')
    best_left_labels = None
    best_right_labels = None
    best_ig = 0
    
    # Try all possible split points
    for i in range(len(values) - 1):
        threshold = (values[i] + values[i + 1]) / 2
        
        left_labels = [labels[j] for j in range(len(dataset)) if dataset[j][feature_name] <= threshold]
        right_labels = [labels[j] for j in range(len(dataset)) if dataset[j][feature_name] > threshold]
        
        if not left_labels or not right_labels:
            continue
        
        weighted_gini = calculate_weighted_gini(left_labels, right_labels)
        ig = calculate_information_gain(parent_gini, left_labels, right_labels)
        
        if weighted_gini < best_gini:
            best_gini = weighted_gini
            best_threshold = round(threshold, 2)
            best_left_labels = left_labels
            best_right_labels = right_labels
            best_ig = ig
    
    return {
        'threshold': best_threshold,
        'gini': best_gini,
        'left_labels': best_left_labels,
        'right_labels': best_right_labels,
        'information_gain': best_ig
    }


def generate_tree_demo(n_samples=30):
    """
    Generate complete decision tree demonstration data.
    Pre-computes all possible splits and their Gini values.
    """
    # Generate dataset
    dataset = generate_synthetic_dataset(n_samples)
    labels = [d['approved'] for d in dataset]
    
    # Calculate initial Gini
    initial_gini = calculate_gini(labels)
    
    features = ['age', 'income', 'employment_years']
    
    # Find best splits for each feature
    splits = {}
    for feature in features:
        result = find_best_split(dataset, feature, labels)
        splits[feature] = {
            'feature': feature,
            'threshold': result['threshold'],
            'gini_after_split': result['gini'],
            'information_gain': result['information_gain'],
            'left_samples': len(result['left_labels']) if result['left_labels'] else 0,
            'right_samples': len(result['right_labels']) if result['right_labels'] else 0
        }
    
    # Create demo structure
    demo = {
        'metadata': {
            'algorithm': 'Decision Tree with Gini Impurity',
            'task': 'Predict loan approval based on age, income, and employment years',
            'total_samples': len(dataset),
            'features': features,
            'target': 'approved'
        },
        'initial_state': {
            'dataset': dataset,
            'labels': labels,
            'gini': initial_gini,
            'class_distribution': {
                'approved': sum(labels),
                'not_approved': len(labels) - sum(labels)
            }
        },
        'all_splits': splits,
        'split_options': [
            {
                'id': 0,
                'feature': splits['age']['feature'],
                'threshold': splits['age']['threshold'],
                'gini': splits['age']['gini_after_split'],
                'information_gain': splits['age']['information_gain'],
                'description': f"Age ≤ {splits['age']['threshold']}"
            },
            {
                'id': 1,
                'feature': splits['income']['feature'],
                'threshold': splits['income']['threshold'],
                'gini': splits['income']['gini_after_split'],
                'information_gain': splits['income']['information_gain'],
                'description': f"Income ≤ {splits['income']['threshold']}"
            },
            {
                'id': 2,
                'feature': splits['employment_years']['feature'],
                'threshold': splits['employment_years']['threshold'],
                'gini': splits['employment_years']['gini_after_split'],
                'information_gain': splits['employment_years']['information_gain'],
                'description': f"Employment Years ≤ {splits['employment_years']['threshold']}"
            }
        ]
    }
    
    return demo


def save_demo(demo, output_path='data/tree_demo.json'):
    """Save demo to JSON file"""
    with open(output_path, 'w') as f:
        json.dump(demo, f, indent=2)
    print(f"Tree demo saved to {output_path}")


if __name__ == "__main__":
    import os
    
    os.makedirs('data', exist_ok=True)
    
    demo = generate_tree_demo(n_samples=30)
    save_demo(demo)
    
    print("\n=== Decision Tree Demo ===")
    print(f"Dataset size: {demo['metadata']['total_samples']}")
    print(f"Initial Gini: {demo['initial_state']['gini']:.4f}")
    print(f"Class distribution: {demo['initial_state']['class_distribution']}")
    print("\nBest splits for each feature:")
    for feature, split in demo['all_splits'].items():
        print(f"  {feature:20} | Gini after: {split['gini_after_split']:.4f} | IG: {split['information_gain']:.4f}")
    print("\n✓ Tree demo ready!")
