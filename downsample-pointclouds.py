#!/usr/bin/env python3
"""
Downsample XYZ point cloud files to reduce file size while maintaining visual quality.
This script reduces point clouds to 25% of their original size.
"""

import sys
import random

def downsample_xyz(input_file, output_file, sample_rate=0.25):
    """
    Downsample a .xyz point cloud file.

    Args:
        input_file: Path to input .xyz file
        output_file: Path to output .xyz file
        sample_rate: Fraction of points to keep (0.25 = 25%)
    """
    print(f"Reading {input_file}...")

    with open(input_file, 'r') as f:
        lines = f.readlines()

    total_points = len(lines)
    print(f"Original point count: {total_points:,}")

    # Randomly sample points
    sampled_lines = random.sample(lines, int(total_points * sample_rate))

    print(f"Downsampled to: {len(sampled_lines):,} points ({sample_rate * 100:.0f}%)")

    # Write output
    with open(output_file, 'w') as f:
        f.writelines(sampled_lines)

    print(f"Saved to {output_file}")

    # Calculate size reduction
    import os
    original_size = os.path.getsize(input_file) / (1024 * 1024)  # MB
    new_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
    print(f"Size reduction: {original_size:.1f}MB -> {new_size:.1f}MB ({(1 - new_size/original_size) * 100:.1f}% smaller)")

if __name__ == "__main__":
    # Downsample the main point cloud
    downsample_xyz(
        "assets/models/ptcloudtest.xyz",
        "assets/models/ptcloudtest_optimized.xyz",
        sample_rate=0.25
    )

    # Downsample the background cloud
    downsample_xyz(
        "assets/models/xr_lower_austria_sculpture__winter_point_cloud/scene.xyz",
        "assets/models/xr_lower_austria_sculpture__winter_point_cloud/scene_optimized.xyz",
        sample_rate=0.25
    )

    print("\nDone! Update your JavaScript files to use the _optimized.xyz files.")
