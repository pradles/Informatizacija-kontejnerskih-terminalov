import { Component, ElementRef, ViewChild, HostListener, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-terminal-3-darray',
  standalone: true,
  templateUrl: './terminal-3-darray.component.html',
  styleUrls: ['./terminal-3-darray.component.css']
})
export class Terminal3DarrayComponent implements AfterViewInit, OnChanges {
  @Input() set currentLayer(value: number) {
    this._currentLayer = value;
    if (this.sceneInitialized) {
      this.updateCubeOpacity();
    }
  }

  @Input() set show3d(value: boolean) {
    this._show3d = value;
    if (this._show3d) {
      this.initOrUpdateScene();
    }
  }

  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  private data: any[] = [];
  private _currentLayer!: number;
  private _show3d!: boolean;
  private sceneInitialized = false;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private cubes: THREE.Mesh[] = [];
  private meshPool: THREE.Mesh[] = [];

  ngAfterViewInit(): void {
    if (this._show3d) {
      this.initOrUpdateScene();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this._show3d) {
      this.initOrUpdateScene();
    }
  }

  setArray(data: any[]): void {
    this.data = data;
    if (this._show3d) {
      this.initOrUpdateScene();
    }
  }

  private initOrUpdateScene(): void {
    if (this.sceneInitialized) {
      this.updateScene();
    } else {
      this.initializeScene();
      this.populateContainers(this.data);
    }
  }

  private initializeScene(): void {
    this.sceneInitialized = true;

    this.scene = new THREE.Scene();

    const containerWidth = this.rendererContainer.nativeElement.clientWidth;
    const containerHeight = this.rendererContainer.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    this.camera.position.set(-10, 9, this.data[0].length);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setClearColor(0xffffff);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    const light = new THREE.AmbientLight(0x404040);
    this.scene.add(light);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(-this.data.length / 2, 0.5, this.data[0].length);
    this.controls.update();

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

  private updateScene(): void {
    this.clearCubes();
    this.populateContainers(this.data);
    this.updateCubeOpacity();
    this.updateCameraControls();
  }

  private clearCubes(): void {
    this.cubes.forEach(cube => {
      cube.visible = false;
    });
  }

  private populateContainers(data: any[]): void {
    const spacing = 1.1;

    let cubeIndex = 0;

    for (let x = 0; x < data.length; x++) {
      for (let y = 0; y < data[x].length; y++) {
        for (let z = 0; z < data[x][y].length; z++) {
          const position = new THREE.Vector3(-x * spacing, z * spacing, y * spacing * 2);
          const accessibility = data[x][y][z].accessibility;
          let color: THREE.Color | undefined;

          switch (accessibility) {
            case 1:
              color = new THREE.Color(0xffff00);
              break;
            case 2:
              color = new THREE.Color(0x00ff00);
              break;
          }

          if (color) {
            let cube: THREE.Mesh;

            if (cubeIndex < this.meshPool.length) {
              cube = this.meshPool[cubeIndex];
              (cube.material as THREE.MeshBasicMaterial).color.set(color);
              cube.position.copy(position);
              cube.visible = true;
            } else {
              cube = this.createCube(position, color);
              this.meshPool.push(cube);
            }

            cube.userData = { z, wireframe: cube.children[0] };
            this.cubes.push(cube);
            cubeIndex++;
          }
        }
      }
    }
  }

  private createCube(position: THREE.Vector3, color: THREE.Color): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1, 1, 2);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, side: THREE.FrontSide });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);

    const wireframe = new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), new THREE.LineBasicMaterial({ color: 0x000000 }));
    cube.add(wireframe);

    this.scene.add(cube);
    return cube;
  }

  private updateCubeOpacity(): void {
    this.cubes.forEach(cube => {
      const { z, wireframe } = cube.userData;
      const material = cube.material as THREE.MeshBasicMaterial;

      material.opacity = z === this._currentLayer ? 1 : 0.2;
      wireframe.visible = z === this._currentLayer;
    });
  }

  private updateCameraControls(): void {
    this.controls.target.set(-this.data.length / 2, 0.5, this.data[0].length);
    this.controls.update();
  }
}
