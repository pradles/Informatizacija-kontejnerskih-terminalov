import { Component, ElementRef, ViewChild, HostListener, AfterViewInit, inject, Input } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import Stats from 'stats.js';

import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { TerminalService } from '../../../../shared/services/api/terminal.service';
import { StorageFormService } from '../../services/storage-form.service';
import { LocationService } from '../../services/location.service';

import { StorageFormComponent } from '../storage-form/storage-form.component';

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
  storageFormService = inject(StorageFormService);
  locationService = inject(LocationService);

  storageForm = inject(StorageFormComponent);
  @Input() isEditMode: boolean | undefined;

  terminalData!: any;
  currentPosition!: { x: number | null, y: number | null, z: number | null };

  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  private stats = new Stats();
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private loader = new GLTFLoader();
  private composer!: EffectComposer;
  private outlinePass!: OutlinePass;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private containerMeshes: THREE.Mesh[] = [];

  private modelUrls = {
    0: ['../../../../assets/3js/containers/3m_yellow.glb', '../../../../assets/3js/containers/3m_green.glb'],
    1: ['../../../../assets/3js/containers/6m_yellow.glb', '../../../../assets/3js/containers/6m_green.glb', '../../../../assets/3js/containers/6m_red.glb', '../../../../assets/3js/containers/6m_white.glb'],
    2: ['../../../../assets/3js/containers/12m_yellow.glb', '../../../../assets/3js/containers/12m_green.glb', '../../../../assets/3js/containers/12m_blue.glb', '../../../../assets/3js/containers/12m_dark_red.glb', '../../../../assets/3js/containers/12m_white.glb', '../../../../assets/3js/containers/12m_red.glb']
  };

  private loadedModels: { [key: number]: THREE.Mesh } = {};

  ngAfterViewInit(): void {
    this.initializeScene();
    this.loadStorageData();
    this.storageFormService.position$.subscribe(val => this.currentPosition = val);
  }

  loadStorageData(): void {
    this.dashboardService.getSelectedTerminal().subscribe({
      next: (selectedTerminal) => {
        if (selectedTerminal && selectedTerminal.id) {
          this.terminalService.getTerminalById(selectedTerminal.id).subscribe({
            next: (res) => {
              console.log(res);
              this.terminalData = res.data.array3D;
              this.loadModels().then(models => {
                this.loadedModels = models;
                this.addContainers();
              });
            },
            error: (err) => {
              console.error(err);
            }
          });
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  private initializeScene(): void {
    this.scene = new THREE.Scene();

    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    const containerWidth = this.rendererContainer.nativeElement.clientWidth;
    const containerHeight = this.rendererContainer.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    this.camera.position.set(50, 50, 100);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setClearColor(0xffffff);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    const light = new THREE.AmbientLight(0x404040, 50);
    this.scene.add(light);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Set up composer and outline pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.outlinePass = new OutlinePass(new THREE.Vector2(containerWidth, containerHeight), this.scene, this.camera);
    this.composer = new EffectComposer(this.renderer);
    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);  
    this.composer.addPass(renderPass);
    this.composer.addPass(this.outlinePass);
    this.composer.addPass(gammaCorrectionPass);

    // Add event listeners for mouse move and click
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.renderer.domElement.addEventListener('click', this.onClick.bind(this), false);

    this.animate();
  }

  private animate(): void {
    this.stats.begin();

    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.composer.render();

    this.stats.end();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    const containerWidth = this.rendererContainer.nativeElement.clientWidth;
    const containerHeight = this.rendererContainer.nativeElement.clientHeight;
    this.camera.aspect = containerWidth / containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(containerWidth, containerHeight);
    this.composer.setSize(containerWidth, containerHeight);
    this.outlinePass.setSize(containerWidth, containerHeight);
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.containerMeshes);

    if (intersects.length > 0) {
      this.outlinePass.selectedObjects = [intersects[0].object];
    } else {
      this.outlinePass.selectedObjects = [];
    }
  }

  private onClick(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.containerMeshes);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (intersectedObject.userData && intersectedObject.userData['containerData']) {
        console.log(intersectedObject.userData['containerData']);
        if(this.isEditMode)
          this.storageForm.changeStorageData(intersectedObject.userData['containerData'].occupation)
      }
    }
  }

  private loadModel(url: string): Promise<THREE.Mesh> {
    return new Promise((resolve, reject) => {
      this.loader.load(url, gltf => {
        const model = gltf.scene.children[0] as THREE.Mesh;
        resolve(model.clone());
      }, undefined, error => {
        reject(error);
      });
    });
  }

  private loadModels(): Promise<{ [key: number]: THREE.Mesh }> {
    return Promise.all([
      this.loadModel(this.modelUrls[1]),
      this.loadModel(this.modelUrls[2])
    ]).then(([yellowModel, greenModel]) => {
      return {
        1: yellowModel,
        2: greenModel
      };
    }).catch(error => {
      console.error('An error occurred while loading models', error);
      throw error;
    });
  }

  private addContainers(): void {
    for (let x = 0; x < this.terminalData.length; x++) {
      for (let y = 0; y < this.terminalData[x].length; y++) {
        this.createRectangleOutline(new THREE.Vector3(y * 6.75, 0, x * 2.75), this.terminalData[x][y][0].accessibility);
        for (let z = 0; z < this.terminalData[x][y].length; z++) {
          const cell = this.terminalData[x][y][z];
          if (cell.occupation != null) { // MAYBE A BETTER CHECK BUT THIS ONE IS FINE
            this.createContainer({ x, y, z }, cell.size, cell.accessibility);
          }
        }
      }
    }
  }

  createRectangleOutline(position: THREE.Vector3, value: number) {
    if(value == 0)
      return
    const color = value === 2 ? 0x00ff00 : 0xffff00; // Green for 2, Yellow for 1
    const vertices = new Float32Array([
         0.0,  0.0, 0.0,  // Top-left
        -6.36,  0.0, 0.0,  // Top-right
        -6.36,  0.0, -2.42,  // Bottom-right
         0.0,  0.0, -2.42,  // Bottom-left
         0.0,  0.0, 0.0   // Closing the rectangle by connecting back to the top-left
    ]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color });
    const rectangleOutline = new THREE.Line(geometry, material);
    rectangleOutline.position.set(position.x, position.y, position.z);
    this.scene.add(rectangleOutline);
  }

  createContainer(position: { x: number, y: number, z: number }, size: number, accessibility: number): void {
    let model: THREE.Mesh | null = null;
    if (accessibility == 1) {
      model = this.loadedModels[1].clone();
    } else if (accessibility == 2) {
      model = this.loadedModels[2].clone();
    }

    if (model) {
      const { x, y, z } = position;
      model.position.set(y * 6.75, z * 2.9, x * 2.75);
      model.userData['containerData'] = { location: position, size, occupation: this.terminalData[x][y][z].occupation, accessibility };

      this.scene.add(model);
      this.containerMeshes.push(model);
      this.terminalData[x][y][z].size = size;
      this.terminalData[x][y][z].accessibility = accessibility;
      this.terminalData[x][y][z].mesh = model;
    } else {
      console.log("no model")
    }
  }

  addContainer(position: { x: number, y: number, z: number }, size: number, accessibility: number): void {
    if (this.locationService.checkCreateLocation(this.terminalData, position, size, accessibility)) {
      // Ensure models are loaded before adding the container
      if (!this.loadedModels[1] || !this.loadedModels[2]) {
        this.loadModels().then(models => {
          this.loadedModels = models;
          this.createContainer(position, size, accessibility);
        }).catch(error => {
          console.error('Failed to load models:', error);
        });
      } else {
        this.createContainer(position, size, accessibility);
      }
    } else {
      console.warn('Invalid location for the container:', position);
    }
  }
  

  setOccupation(position: { x: number, y: number, z: number }, occupation: string): void {
    this.terminalData[position.x][position.y][position.z].occupation = occupation;
    this.terminalData[position.x][position.y][position.z].mesh.userData['containerData'].occupation = occupation;
  }


  moveContainer(position: { x: number, y: number, z: number }) {
    const x = this.currentPosition.x;
    const y = this.currentPosition.y;
    const z = this.currentPosition.z;
    if(x != null && y != null && z != null){
      console.log("move")
      if (this.terminalData[x][y][z]?.mesh) {
          const x2 = position.x;
          const y2 = position.y;
          const z2 = position.z;

          if (this.locationService.checkLocation(this.terminalData, { x, y, z }, { x: x2, y: y2, z: z2 }, this.terminalData[x][y][z].size, this.terminalData[x][y][z].accessibility)) {
              console.log("allowed")
              // Update mesh position
              this.terminalData[x][y][z].mesh.position.set(y2 * 6.75, z2 * 2.9, x2 * 2.75);
              this.terminalData[x][y][z].mesh.userData['containerData'].location = { x: x2, y: y2, z: z2 };

              // Transfer data to the new location
              this.terminalData[x2][y2][z2] = {
                  ...this.terminalData[x2][y2][z2],
                  occupation: this.terminalData[x][y][z].occupation,
                  size: this.terminalData[x][y][z].size,
                  mesh: this.terminalData[x][y][z].mesh,
              };

              // Clear data from the old location
              this.terminalData[x][y][z] = {
                  ...this.terminalData[x][y][z],
                  occupation: null,
                  size: null,
                  mesh: undefined,
              };

              this.storageFormService.setPosition({x: x2, y: y2, z:z2});
          }
      }
    }
  }

  getTerminal3dArrayData() {
    // Deep copy the terminalDataOriginal
    const terminalDataCopy = JSON.parse(JSON.stringify(this.terminalData));
  
    // Function to remove .mesh property
    const removeMeshProperty = (data: any) => {
      for (let x = 0; x < data.length; x++) {
        for (let y = 0; y < data[x].length; y++) {
          for (let z = 0; z < data[x][y].length; z++) {
            if (data[x][y][z].mesh) {
              delete data[x][y][z].mesh;
            }
          }
        }
      }
    };
  
    // Remove .mesh property from the copied data
    removeMeshProperty(terminalDataCopy);
  
    console.log(terminalDataCopy);
    return terminalDataCopy;
  }
}
