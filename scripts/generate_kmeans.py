"""
Generate K-means clustering demonstration data.
Creates step-by-step data showing the algorithm progression.
"""

import json
import random
import math

def euclidean_distance(p1, p2):
    """Calculate Euclidean distance between two points"""
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)


def generate_sample_data(n_points=25, bounds=(0, 100)):
    """Generate random 2D sample points"""
    points = []
    for _ in range(n_points):
        x = random.uniform(bounds[0], bounds[1])
        y = random.uniform(bounds[0], bounds[1])
        points.append([round(x, 2), round(y, 2)])
    return points


def initialize_centers(points, k=3):
    """Randomly initialize k centers"""
    return random.sample(points, k)


def assign_points_to_centers(points, centers):
    """Assign each point to nearest center, return assignments and center indices"""
    assignments = []
    for point in points:
        distances = [euclidean_distance(point, center) for center in centers]
        nearest_center_idx = distances.index(min(distances))
        assignments.append(nearest_center_idx)
    return assignments


def update_centers(points, assignments, k):
    """Update centers by computing mean of assigned points"""
    new_centers = []
    for i in range(k):
        cluster_points = [points[j] for j in range(len(points)) if assignments[j] == i]
        if cluster_points:
            mean_x = sum(p[0] for p in cluster_points) / len(cluster_points)
            mean_y = sum(p[1] for p in cluster_points) / len(cluster_points)
            new_centers.append([round(mean_x, 2), round(mean_y, 2)])
        else:
            # If cluster is empty, keep the old center
            new_centers.append(centers[i])
    return new_centers


def generate_kmeans_demo(n_points=25, k=3, max_iterations=5):
    """
    Generate complete K-means demonstration with step-by-step data.
    
    Args:
        n_points: Number of data points
        k: Number of clusters
        max_iterations: Maximum number of iterations
    
    Returns:
        Dictionary with metadata and step-by-step algorithm states
    """
    random.seed(42)  # For reproducibility
    
    # Generate data
    points = generate_sample_data(n_points)
    
    # Initialize
    centers = initialize_centers(points, k)
    
    # Build steps
    steps = []
    
    # Step 0: Initialize
    step_data = {
        "step": 0,
        "phase": "initialize",
        "description": "Centers randomly initialized",
        "points": points,
        "centers": centers,
        "assignments": [None] * len(points),  # No assignments yet
        "iteration": 0
    }
    steps.append(step_data)
    
    # Iterations
    current_centers = [center[:] for center in centers]  # Copy
    
    for iteration in range(max_iterations):
        # Assign phase
        assignments = assign_points_to_centers(points, current_centers)
        step_assign = {
            "step": len(steps),
            "phase": "assign",
            "description": f"Points assigned to nearest center (Iteration {iteration + 1})",
            "points": points,
            "centers": current_centers,
            "assignments": assignments,
            "iteration": iteration + 1
        }
        steps.append(step_assign)
        
        # Update phase
        new_centers = update_centers(points, assignments, k)
        step_update = {
            "step": len(steps),
            "phase": "update",
            "description": f"Centers updated to cluster means (Iteration {iteration + 1})",
            "points": points,
            "centers": new_centers,
            "assignments": assignments,
            "iteration": iteration + 1
        }
        steps.append(step_update)
        
        current_centers = new_centers
    
    # Final step
    assignments = assign_points_to_centers(points, current_centers)
    step_final = {
        "step": len(steps),
        "phase": "final",
        "description": "Algorithm complete! Convergence reached.",
        "points": points,
        "centers": current_centers,
        "assignments": assignments,
        "iteration": max_iterations
    }
    steps.append(step_final)
    
    # Compile demo data
    demo = {
        "metadata": {
            "algorithm": "K-Means Clustering",
            "n_points": n_points,
            "k": k,
            "max_iterations": max_iterations,
            "total_steps": len(steps)
        },
        "steps": steps
    }
    
    return demo


def save_demo(demo, output_path="data/kmeans_demo.json"):
    """Save demo to JSON file"""
    with open(output_path, 'w') as f:
        json.dump(demo, f, indent=2)
    print(f"K-means demo saved to {output_path}")


if __name__ == "__main__":
    import os
    
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    
    # Generate and save
    demo = generate_kmeans_demo(n_points=25, k=3, max_iterations=5)
    save_demo(demo)
    
    print(f"Total steps: {demo['metadata']['total_steps']}")
    print("Demo data ready!")
