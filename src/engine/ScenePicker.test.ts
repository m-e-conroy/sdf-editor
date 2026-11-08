import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { ScenePicker } from './ScenePicker';
import { CSGTree } from '../tree/CSGTree';

describe('ScenePicker (Viewport Raycaster & Deselection)', () => {
  it('should pick a node when ray intersects a primitive', () => {
    const tree = new CSGTree();
    const sphere = CSGTree.createDefaultNode('sphere');
    sphere.transform.position = [0, 0, 0];
    tree.root.children = [sphere];

    const camera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    // Center screen NDC (0, 0) points straight at sphere at (0, 0, 0)
    const hitId = ScenePicker.pickNDC(0, 0, camera, tree);
    expect(hitId).toBe(sphere.id);
  });

  it('should return null when ray misses into sky or empty space', () => {
    const tree = new CSGTree();
    const sphere = CSGTree.createDefaultNode('sphere');
    sphere.transform.position = [0, 0, 0];
    tree.root.children = [sphere];

    const camera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    // Corner NDC (0.9, 0.9) points into empty sky, missing the sphere
    const hitId = ScenePicker.pickNDC(0.9, 0.9, camera, tree);
    expect(hitId).toBeNull();
  });

  it('should return null when tree has no child nodes', () => {
    const tree = new CSGTree();
    tree.root.children = [];

    const camera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    const hitId = ScenePicker.pickNDC(0, 0, camera, tree);
    expect(hitId).toBeNull();
  });
});
