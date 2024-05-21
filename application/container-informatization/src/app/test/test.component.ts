import { Component, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-test',
  standalone: true,
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  data!: any;

  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  private _currentLayer!: number;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private cubes: THREE.Mesh[] = [];

  @Input() set currentLayer(value: number) {
    this._currentLayer = value;
    this.updateCubeOpacity();
  }

  setArray(data: any[]): void {
    this.data = data;
    this.initializeScene();
    this.populateContainers(data);
  }

  private initializeScene(): void {
    // Set up the scene
    this.scene = new THREE.Scene();

    // Set up the camera
    const containerWidth = this.rendererContainer.nativeElement.clientWidth;
    const containerHeight = this.rendererContainer.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    this.camera.position.set(0, 15, 20);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Set up the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true});
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setClearColor(0xffffff);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    

    // Add ambient light
    const light = new THREE.AmbientLight(0x404040);
    this.scene.add(light);

    // Set up controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(-this.data.length, 0.5, this.data[0].length/2);
    this.controls.update();

    // Start animation
    this.animate();
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    const containerWidth = this.rendererContainer.nativeElement.clientWidth;
    const containerHeight = this.rendererContainer.nativeElement.clientHeight;
    this.camera.aspect = containerWidth / containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(containerWidth, containerHeight);
  }

  private populateContainers(data: any[]): void {
    const spacing = 1.1; // Spacing between cubes

    for (let x = 0; x < data.length; x++) {
      for (let y = 0; y < data[x].length; y++) {
        for (let z = 0; z < data[x][y].length; z++) {
          const position = new THREE.Vector3(-x * spacing * 2, z * spacing, y * spacing);
          const accessibility = data[x][y][z].accessibility;
          let color: THREE.Color;

          switch (accessibility) {
            case 1:
              color = new THREE.Color(0xffff00);
              break;
            case 2:
              color = new THREE.Color(0x00ff00);
              break;
            default:
              continue;
          }

          this.createCube(position, color, x, y, z);
        }
      }
    }

    this.updateCubeOpacity();
  }

  private createCube(position: THREE.Vector3, color: THREE.Color, x: number, y: number, z: number): void {
    const geometry = new THREE.BoxGeometry(2, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);

    const geo = new THREE.EdgesGeometry(cube.geometry);
    const mat = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(geo, mat);
    cube.add(wireframe);

    cube.userData = { x, y, z, wireframe };
    this.scene.add(cube);
    this.cubes.push(cube);
  }

  private updateCubeOpacity(): void {
    this.cubes.forEach(cube => {
      const { z, wireframe } = cube.userData;
      const material = cube.material as THREE.MeshBasicMaterial;

      if (z === this._currentLayer) {
        material.opacity = 1;
        wireframe.visible = true;
      } else {
        material.opacity = 0.2;
        wireframe.visible = false;
      }
    });
  }
}
