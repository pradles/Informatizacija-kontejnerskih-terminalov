import { Component, ElementRef, ViewChild, HostListener, AfterViewInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import Stats from 'stats.js';
import * as TWEEN from '@tweenjs/tween.js';


import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { TerminalService } from '../../../../shared/services/api/terminal.service';
import { StorageFormService } from '../../services/storage-form.service';
import { LocationService } from '../../services/location.service';

import { StorageFormComponent } from '../storage-form/storage-form.component';

@Component({
  selector: 'app-storage-three-d',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './storage-three-d.component.html',
  styleUrl: './storage-three-d.component.css'
})
export class StorageThreeDComponent implements AfterViewInit {
  private dashboardService = inject(DashboardService);
  private terminalService = inject(TerminalService);
  private storageFormService = inject(StorageFormService);
  private locationService = inject(LocationService);

  private storageForm = inject(StorageFormComponent);
  @Input() isEditMode: boolean | undefined;

  private terminalData!: any;
  private currentPosition!: { x: number | null, y: number | null, z: number | null };

  private selectedContainer!: THREE.Mesh;
  private highlightedObjects: Set<THREE.Object3D> = new Set<THREE.Object3D>();

  private initialMouse: THREE.Vector2 = new THREE.Vector2();
  private dragThreshold: number = 5; // pixels

  private currentlyMoving: boolean = false;

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
  private plane!: THREE.Mesh;

  private modelUrls = [
    [/*'../../../../assets/3js/containers/3m_yellow.glb', '../../../../assets/3js/containers/3m_green.glb'*/],
    ['../../../../assets/3js/containers/6m_yellow.glb', '../../../../assets/3js/containers/6m_green.glb', '../../../../assets/3js/containers/6m_red.glb', '../../../../assets/3js/containers/6m_white.glb'],
    ['../../../../assets/3js/containers/12m_yellow.glb', '../../../../assets/3js/containers/12m_green.glb', '../../../../assets/3js/containers/12m_blue.glb', '../../../../assets/3js/containers/12m_dark_red.glb', '../../../../assets/3js/containers/12m_white.glb', '../../../../assets/3js/containers/12m_red.glb']
  ];

  private loadedModels: { [key: number]: THREE.Mesh[] } = {};

  ngAfterViewInit(): void {
    this.initializeScene();
    this.loadStorageData();
    this.storageFormService.position$.subscribe(val => this.currentPosition = val);
  }

  private loadStorageData(): void {
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
    this.controls.maxPolarAngle = Math.PI/2-0.05; 
    // this.controls.enableDamping = true;
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
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.renderer.domElement.addEventListener('dblclick', this.onDoubleClick.bind(this), false);

    this.animate();
  }

  private animate(): void {
    this.stats.begin();

    requestAnimationFrame(() => this.animate());
    this.controls.target.setY(0);
    this.controls.update();
    this.composer.render();

    this.stats.end();
  }

  @HostListener('window:resize', ['$event'])
  public onWindowResize(): void {
    const containerWidth = this.rendererContainer.nativeElement.clientWidth;
    const containerHeight = this.rendererContainer.nativeElement.clientHeight;
    this.camera.aspect = containerWidth / containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(containerWidth, containerHeight);
    this.composer.setSize(containerWidth, containerHeight);
    this.outlinePass.setSize(containerWidth, containerHeight);
  }

  public onMoving() {
    this.currentlyMoving = true;
  }
  
  public onStoppedMoving() {
    const x = this.currentPosition.x;
    const y = this.currentPosition.y;
    const z = this.currentPosition.z;
    if (x != null && y != null && z != null) {
      if (this.locationService.checkLocation(this.terminalData, this.currentPosition, { x: this.selectedContainer.position.z/2.75, y: this.selectedContainer.position.x/6.75, z: this.selectedContainer.position.y/2.9 }, this.terminalData[x][y][z].size, this.terminalData[x][y][z].accessibility)) {
        this.currentlyMoving = false;
        this.storageForm.changeStoredAtValue(this.selectedContainer.position.z/2.75, this.selectedContainer.position.x/6.75, this.selectedContainer.position.y/2.9);
        // this.storageFormService.setPosition({x: this.selectedContainer.position.z/2.75, y: this.selectedContainer.position.x/6.75, z: this.selectedContainer.position.y/2.9});
        this.moveContainer({x: this.selectedContainer.position.z/2.75, y: this.selectedContainer.position.x/6.75, z: this.selectedContainer.position.y/2.9})
        // this.storageForm.checkPosition()
      }
    }
  }
  
  private onDoubleClick(event: MouseEvent): void {
    // Prevent default action of double-click event to avoid interference
    event.preventDefault();
    
    this.onMoving();
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (!this.currentlyMoving) {
      const intersects = this.raycaster.intersectObjects(this.containerMeshes);

      this.highlightedObjects.clear();
      if (this.selectedContainer) {
        this.highlightedObjects.add(this.selectedContainer);

        const rayDirection = new THREE.Vector3().subVectors(this.selectedContainer.position, this.camera.position).normalize();
        this.raycaster.set(this.camera.position, rayDirection);

        const rayIntersects = this.raycaster.intersectObjects(this.containerMeshes);
        // Reset opacity to 1.0 for all meshes
        this.containerMeshes.forEach(mesh => {
          this.setMeshOpacity(mesh, 1.0);
        });

        // Make intersecting meshes semi-transparent
        for (let i = 0; i < rayIntersects.length; i++) {
            const intersectedMesh = rayIntersects[i].object;
            if (intersectedMesh !== this.selectedContainer) {
                this.setMeshOpacity(intersectedMesh, 0.2);
            }
        }

        // const rayDirection = new THREE.Vector3().subVectors(this.selectedContainer.position, this.camera.position).normalize();
        // const rayIntersects = [];
        
        // // Create additional rays around the main ray direction to simulate a thicker ray
        // const rayDirections = [
        //     rayDirection,
        //     new THREE.Vector3(rayDirection.x + 0.01, rayDirection.y, rayDirection.z).normalize(), // Example: increase x-axis
        //     new THREE.Vector3(rayDirection.x, rayDirection.y + 0.01, rayDirection.z).normalize(), // Example: increase y-axis
        //     new THREE.Vector3(rayDirection.x, rayDirection.y, rayDirection.z + 0.01).normalize(), // Example: increase z-axis
        // ];
        
        // for (let dir of rayDirections) {
        //     this.raycaster.set(this.camera.position, dir);
        //     rayIntersects.push(...this.raycaster.intersectObjects(this.containerMeshes, false));
        // }
        
        // // Reset opacity to 1.0 for all meshes
        // this.containerMeshes.forEach(mesh => {
        //     this.setMeshOpacity(mesh, 1.0);
        // });
        
        // // Make intersecting meshes semi-transparent
        // for (let i = 0; i < rayIntersects.length; i++) {
        //     const intersectedMesh = rayIntersects[i].object;
        //     if (intersectedMesh !== this.selectedContainer) {
        //         this.setMeshOpacity(intersectedMesh, 0.2);
        //     }
        // }

      }

      if (intersects.length > 0) {
        this.highlightedObjects.add(intersects[0].object);
      }

      this.outlinePass.selectedObjects = Array.from(this.highlightedObjects);

    } else {
      const intersects = this.raycaster.intersectObject(this.plane);

      if (intersects.length > 0) {
        const intersectPoint = intersects[0].point;
        const snappedPosition = this.getSnappedPosition(intersectPoint);
        this.selectedContainer.position.copy(snappedPosition);
      }
    }
  }

  private onClick(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    if (!this.currentlyMoving) {
      if(this.isEditMode){
        const intersects = this.raycaster.intersectObjects(this.containerMeshes);

        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;
          if (intersectedObject.userData && intersectedObject.userData['containerData']) {
            console.log(intersectedObject.userData['containerData']);
            if (this.isEditMode)
              this.storageForm.changeStorageData(intersectedObject.userData['containerData'].occupation);
          }
        }
      }
    } else {
      this.onStoppedMoving();
    }
  }

  private onMouseDown(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.initialMouse.x = event.clientX - rect.left;
    this.initialMouse.y = event.clientY - rect.top;
  }

  private onMouseUp(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const finalMouse = new THREE.Vector2(event.clientX - rect.left, event.clientY - rect.top);

    const distance = this.initialMouse.distanceTo(finalMouse);

    if (distance < this.dragThreshold) {
      this.onClick(event);
    }
  }

  public setSelectedContainer() {
    if (this.currentPosition.x != null && this.currentPosition.y != null && this.currentPosition.z != null)
      this.selectedContainer = this.terminalData[this.currentPosition.x][this.currentPosition.y][this.currentPosition.z].mesh;

    this.highlightedObjects.clear();

    if (this.selectedContainer) {
      this.highlightedObjects.add(this.selectedContainer);
      this.moveCameraLinear(this.selectedContainer.position)
    }
    this.outlinePass.selectedObjects = Array.from(this.highlightedObjects);
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

  private loadModels(): Promise<{ [key: number]: THREE.Mesh[] }> {
    const loadModelPromises: Promise<THREE.Mesh[]>[] = [];

    for (const size in this.modelUrls) {
      const urls = this.modelUrls[size];
      const loadModelsForSize = urls.map(url => this.loadModel(url));
      loadModelPromises.push(Promise.all(loadModelsForSize));
    }

    return Promise.all(loadModelPromises).then(results => {
      const models: { [key: number]: THREE.Mesh[] } = {};
      results.forEach((modelArray, index) => {
        const size = Object.keys(this.modelUrls)[index];
        models[Number(size)] = modelArray;
      });
      return models;
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
            if (cell.size != 2 || cell.occupation == this.terminalData[x][Number(y) + 1][z].occupation)
              this.createContainer({ x, y, z }, cell.size, cell.accessibility, cell.occupation);
          }
        }
      }
    }
    const x = this.terminalData.length;
    const y = this.terminalData[0].length;
    const geometry = new THREE.PlaneGeometry(y * 7, x * 3);
    const material = new THREE.MeshBasicMaterial({ color: 0x9f9f9f, side: THREE.FrontSide });
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.position.set(y / 2 * 6.75 - 6.75, -0.1, x / 2 * 2.75 - 2.75)
    this.plane.rotateX(-Math.PI / 2)
    this.scene.add(this.plane);
    this.setSelectedContainer();
  }

  private createRectangleOutline(position: THREE.Vector3, value: number) {
    if (value == 0)
      return
    const color = value === 2 ? 0x00ff00 : 0xffff00; // Green for 2, Yellow for 1
    const vertices = new Float32Array([
      0.0, 0.0, 0.0,  // Top-left
      -6.36, 0.0, 0.0,  // Top-right
      -6.36, 0.0, -2.42,  // Bottom-right
      0.0, 0.0, -2.42,  // Bottom-left
      0.0, 0.0, 0.0   // Closing the rectangle by connecting back to the top-left
    ]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color });
    const rectangleOutline = new THREE.Line(geometry, material);
    rectangleOutline.position.set(position.x, position.y, position.z);
    this.scene.add(rectangleOutline);
  }

  private hashStringToIndex(str: string, arrayLength: number): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash + str.charCodeAt(i)) % arrayLength;
    }
    return hash;
  }

  private createContainer(position: { x: number, y: number, z: number }, size: number, accessibility: number, occupation: string): void {
    const modelsForSize = this.loadedModels[size];
    if (!modelsForSize || modelsForSize.length === 0) {
      console.log(position)
      console.error(`No models found for size ${size}`);
      return;
    }

    const modelIndex = this.hashStringToIndex(occupation, modelsForSize.length);
    const model = modelsForSize[modelIndex].clone();

    if (model) {
      const { x, y, z } = position;
      model.position.set(y * 6.75, z * 2.9, x * 2.75);
      model.userData['containerData'] = { location: position, size, occupation, accessibility };

      this.scene.add(model);
      this.containerMeshes.push(model);
      this.terminalData[x][y][z].occupation = occupation;
      this.terminalData[x][y][z].size = size;
      this.terminalData[x][y][z].mesh = model;

      if (size == 2) {
        this.terminalData[x][Number(y) + 1][z].occupation = occupation;
        this.terminalData[x][Number(y) + 1][z].size = size;
        this.terminalData[x][Number(y) + 1][z].mesh = model;
      }

    } else {
      console.log("no model")
    }
  }

  public addContainer(position: { x: number, y: number, z: number }, size: number, accessibility: number, occupation: string): void {
    if (this.locationService.checkCreateLocation(this.terminalData, position, size, accessibility)) {
      // Ensure models are loaded before adding the container
      if (!this.loadedModels[1] || !this.loadedModels[2]) {
        this.loadModels().then(models => {
          this.loadedModels = models;
          this.createContainer(position, size, accessibility, occupation);
          this.storageFormService.setPosition({ x: position.x, y: position.y, z: position.z });
        }).catch(error => {
          console.error('Failed to load models:', error);
        });
      } else {
        console.log(position)
        console.log(size)
        console.log(accessibility)
        console.log(typeof occupation)
        this.createContainer(position, size, accessibility, occupation);
        this.storageFormService.setPosition({ x: position.x, y: position.y, z: position.z });
      }
    } else {
      console.warn('Invalid location for the container:', position);
    }
  }

  public addMoveContainer(size: number, accessibility: number): void {
    let positionFound = false;
    let position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 };

    for (let x = 0; x < this.terminalData.length; x++) {
      for (let y = 0; y < this.terminalData[x].length; y++) {
        for (let z = 0; z < this.terminalData[x][y].length; z++) {
          position = { x, y, z };
          if (this.locationService.checkCreateLocation(this.terminalData, position, size, accessibility)) {
            positionFound = true;
            break;
          }
        }
        if (positionFound) break;
      }
      if (positionFound) break;
    }

    if(positionFound) {
      this.addContainer(position, size, accessibility, "todo");
      this.setSelectedContainer();
      this.storageForm.changeStoredAtValue(this.selectedContainer.position.z/2.75, this.selectedContainer.position.x/6.75, this.selectedContainer.position.y/2.9);
      this.onMoving();
    }



  }

  public setOccupation(position: { x: number, y: number, z: number }, occupation: string): void {
    this.terminalData[position.x][position.y][position.z].occupation = occupation;
    this.terminalData[position.x][position.y][position.z].mesh.userData['containerData'].occupation = occupation;
    if (this.terminalData[position.x][position.y][position.z].size == 2) {
      this.terminalData[position.x][Number(position.y) + 1][position.z].occupation = occupation;
    }
  }

  public moveContainer(position: { x: number, y: number, z: number }) {
    const x = this.currentPosition.x;
    const y = this.currentPosition.y;
    const z = this.currentPosition.z;
    if (x != null && y != null && z != null) {
      if (this.terminalData[x][y][z]?.mesh) {
        const x2 = position.x;
        const y2 = position.y;
        const z2 = position.z;
  
        if (this.locationService.checkLocation(this.terminalData, { x, y, z }, { x: x2, y: y2, z: z2 }, this.terminalData[x][y][z].size, this.terminalData[x][y][z].accessibility)) {
          console.log("allowed");
  
          // Update mesh position of the selected container
          this.terminalData[x][y][z].mesh.position.set(y2 * 6.75, z2 * 2.9, x2 * 2.75);
          this.terminalData[x][y][z].mesh.userData['containerData'].location = { x: x2, y: y2, z: z2 };
  
          if (this.terminalData[x][y][z].size == 2) {
            // Transfer data to the new location
            this.terminalData[x2][Number(y2) + 1][z2] = {
              ...this.terminalData[x2][Number(y2) + 1][z2],
              occupation: this.terminalData[x][Number(y) + 1][z].occupation,
              size: this.terminalData[x][Number(y) + 1][z].size,
              mesh: this.terminalData[x][Number(y) + 1][z].mesh,
            };
  
            // Clear data from the old location
            this.terminalData[x][Number(y) + 1][z] = {
              ...this.terminalData[x][Number(y) + 1][z],
              occupation: null,
              size: null,
              mesh: undefined,
            };
          }
  
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

          // Move containers above the current one down by one
          for (let i = z + 1; i < this.terminalData[x][y].length; i++) {
            if (this.terminalData[x][y][i]?.mesh) {
              this.terminalData[x][y][i].mesh.position.y -= 2.9;
              this.terminalData[x][y][i - 1] = this.terminalData[x][y][i];
              this.terminalData[x][y][i] = { occupation: null, size: null, mesh: undefined, accessibility: this.terminalData[x][y][i - 1].accessibility };
              this.storageForm.changeStoredAtValueWithId(this.terminalData[x][y][i-1].occupation, {x: x, y:y, z: i-1})
            }
          }
  
          this.storageFormService.setPosition({ x: x2, y: y2, z: z2 });
        }
      }
    }
  }
  

  public getTerminal3dArrayData() {
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

  private getSnappedPosition(position: THREE.Vector3): THREE.Vector3 {
    const gridX = Math.round(position.x / 6.75);
    const gridZ = Math.round(position.z / 2.75);
    let gridY = -2;
    if (this.currentPosition.x != null && this.currentPosition.y != null && this.currentPosition.z != null)
     gridY = this.locationService.checkMoveLocation(this.terminalData, this.currentPosition, {x:gridZ, y:gridX, z:0},  this.terminalData[this.currentPosition.x][this.currentPosition.y][this.currentPosition.z].size, this.terminalData[this.currentPosition.x][this.currentPosition.y][this.currentPosition.z].accessibility)
    return new THREE.Vector3(gridX * 6.75, gridY*2.9, gridZ * 2.75);
  }

  setMeshOpacity(mesh: any, opacity: number): void {
    // Clone the material if it hasn't been already
    if (mesh.material instanceof THREE.Material) {
        // Check if the material is shared
        if (!mesh.userData['materialCloned']) {
            mesh.material = mesh.material.clone();
            mesh.userData['materialCloned'] = true;
        }
        
        if (!mesh.material.transparent) {
            mesh.material.transparent = true;
        }
        mesh.material.opacity = opacity;

    } else if (Array.isArray(mesh.material)) {
        // If the mesh has an array of materials, clone each one if it hasn't been already
        if (!mesh.userData['materialCloned']) {
            mesh.material = mesh.material.map((material: THREE.Material) => material.clone());
            mesh.userData['materialCloned'] = true;
        }
        
        mesh.material.forEach((material: THREE.Material) => {
            if (!material.transparent) {
                material.transparent = true;
            }
            material.opacity = opacity;
        });
    }
  }


  moveCameraLinear(targetPosition: THREE.Vector3, duration: number = 400) {
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const targetTarget = new THREE.Vector3(
        targetPosition.x,
        startTarget.y,  // Keep the same y-level for the target to maintain the camera height
        targetPosition.z
    );

    // Calculate the direction vector for the target movement
    const targetMovement = new THREE.Vector3().subVectors(targetTarget, startTarget);

    const tween = new TWEEN.Tween({ t: 0 })
        .to({ t: 1 }, duration)
        .onUpdate(({ t }) => {
            // Move the camera target
            const newTarget = new THREE.Vector3().lerpVectors(startTarget, targetTarget, t);
            this.controls.target.copy(newTarget);

            // Apply the same movement vector to the camera position
            const newPos = startPosition.clone().add(targetMovement.clone().multiplyScalar(t));
            this.camera.position.copy(newPos);

            this.controls.update();
        })
        .start();

    // Animate using TWEEN
    function animate(time: number) {
        requestAnimationFrame(animate);
        TWEEN.update(time);
    }

    requestAnimationFrame(animate);
}

  
}
