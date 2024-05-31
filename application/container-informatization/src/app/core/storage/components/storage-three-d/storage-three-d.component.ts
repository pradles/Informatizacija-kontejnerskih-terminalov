import { Component, ElementRef, ViewChild, HostListener, AfterViewInit, inject } from '@angular/core';
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
              this.terminalData = res.data.array3D;
              this.addContainers();
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

  private addContainers(): void {
    const models = {
      1: "../../../../assets/3js/containers/6m_yellow.glb",
      2: "../../../../assets/3js/containers/6m_green.glb"
    };
  
    const loadModel = (url: string): Promise<THREE.Mesh> => {
      return new Promise((resolve, reject) => {
        this.loader.load(url, gltf => {
          const model = gltf.scene.children[0] as THREE.Mesh;
          resolve(model.clone());
        }, undefined, error => {
          reject(error);
        });
      });
    };
  
    Promise.all([
      loadModel(models[1]),
      loadModel(models[2])
    ]).then(([yellowModel, greenModel]) => {
      const dummy = new THREE.Object3D();
  
      for (let x = 0; x < this.terminalData.length; x++) {
        for (let y = 0; y < this.terminalData[x].length; y++) {
          for (let z = 0; z < this.terminalData[x][y].length; z++) {
            const cell = this.terminalData[x][y][z];
            let model: THREE.Mesh | null = null;
            if(cell.occupation != null) { // MAYBE A BETTER CHECK BUT THIS ONE IS FINE
              if (cell.accessibility === 1) {
                model = yellowModel.clone();
              } else if (cell.accessibility === 2) {
                model = greenModel.clone();
              }
            }
  
            if (model) {
              dummy.position.set(y * 6.75, z * 2.9, x * 2.75);
              dummy.updateMatrix();
              model.position.copy(dummy.position);
              model.updateMatrix();
              
              // Add containerData to the model's userData
              model.userData['containerData'] = {
                location: { x, y, z },
                size: cell.size,
                occupation: cell.occupation,
                accessibility: cell.accessibility
              };
  
              this.scene.add(model);
              this.containerMeshes.push(model);
            }
          }
        }
      }
    }).catch(error => {
      console.error('An error occurred while loading models', error);
    });
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
      }
    }
  }
}
