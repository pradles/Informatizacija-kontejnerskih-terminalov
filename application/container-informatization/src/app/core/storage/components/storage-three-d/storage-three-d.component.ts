import { Component, ElementRef, ViewChild, HostListener, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-storage-three-d',
  standalone: true,
  imports: [],
  templateUrl: './storage-three-d.component.html',
  styleUrl: './storage-three-d.component.css'
})
export class StorageThreeDComponent implements AfterViewInit {
  data!: any[];

  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  ngAfterViewInit(): void {
    this.initializeScene();
  }

  private initializeScene(): void {
    // Set up the scene
    this.scene = new THREE.Scene();

    // Set up the camera
    const containerWidth = this.rendererContainer.nativeElement.clientWidth;
    const containerHeight = this.rendererContainer.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    this.camera.position.set(5,5,5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Set up the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setClearColor(0xffffff);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Add ambient light
    const light = new THREE.AmbientLight(0x404040);
    this.scene.add(light);

    // Set up controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0,0,0);
    this.controls.update();

    this.createCube(new THREE.Vector3(0,0,0), new THREE.Color(0xff0000) )

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

  private createCube(position: THREE.Vector3, color: THREE.Color): void {
    const geometry = new THREE.BoxGeometry(1, 1, 2);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, side: THREE.FrontSide });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    this.scene.add(cube);
  }

}
