import { Component, ElementRef, ViewChild, HostListener, AfterViewInit, inject } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { TerminalService } from '../../../../shared/services/api/terminal.service';

@Component({
  selector: 'app-storage-three-d',
  standalone: true,
  imports: [],
  templateUrl: './storage-three-d.component.html',
  styleUrl: './storage-three-d.component.css'
})
export class StorageThreeDComponent implements AfterViewInit {
  dashboardService = inject(DashboardService);
  terminalService = inject(TerminalService);

  terminalData!: any;

  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private loader = new GLTFLoader();
  private instancedMesh!: THREE.InstancedMesh;

  ngAfterViewInit(): void {
    this.initializeScene();
    this.loadStorageData();
  }

  loadStorageData(): void {
    this.dashboardService.getSelectedTerminal().subscribe({
      next: (selectedTerminal) => {
        if (selectedTerminal && selectedTerminal.id) {
          this.terminalService.getTerminalById(selectedTerminal.id).subscribe({
            next: (res) => {
              console.log(res);
              this.terminalData = res.data;
              console.log(this.terminalData.array3D);
            },
            error: (err) => {
              console.log(err);
            }
          });
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  private initializeScene(): void {
    // Set up the scene
    this.scene = new THREE.Scene();

    // Set up the camera
    const containerWidth = this.rendererContainer.nativeElement.clientWidth;
    const containerHeight = this.rendererContainer.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Set up the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setClearColor(0xffffff);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Add ambient light
    const light = new THREE.AmbientLight(0x404040, 50);
    this.scene.add(light);

    // Set up controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Load the container model once and create instanced meshes
    this.loadModel("../../../../assets/3js/containers/12m_red.glb");

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

  private loadModel(url: string): void {
    this.loader.load(url, gltf => {
      const model = gltf.scene.children[0];
      const geometry = (model as THREE.Mesh).geometry;
      const material = (model as THREE.Mesh).material;

      // Create an InstancedMesh
      const count = 30 * 20;
      this.instancedMesh = new THREE.InstancedMesh(geometry, material, count);

      let index = 0;
      const dummy = new THREE.Object3D();

      for (let i = 0; i < 30; i++) {
        for (let j = 0; j < 20; j++) {
          dummy.position.set(i * 12, 0, j * 3);
          dummy.updateMatrix();
          this.instancedMesh.setMatrixAt(index++, dummy.matrix);
        }
      }

      this.scene.add(this.instancedMesh);
    }, undefined, error => {
      console.error('An error occurred while loading the model', error);
    });
  }
}
