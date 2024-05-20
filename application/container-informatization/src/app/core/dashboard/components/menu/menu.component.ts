import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserRole } from '../../../authentication/services/auth.service';
import { CommonModule } from '@angular/common';
import { TerminalService } from '../../../../shared/services/api/terminal.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit{
  terminalDropdown: boolean = false;
  adminDropdown: boolean = false;
  localStorage = localStorage;
  userId = localStorage.getItem("user_data");
  router = inject(Router);
  terminalService = inject(TerminalService);
  authService = inject(AuthService);
  dashboardService = inject(DashboardService);
  UserRole = UserRole;

  hasPermission: boolean = false;
  hasPermissionAdmin: boolean = false;

  ngOnInit(): void {
    this.hasPermission = this.checkPermission([UserRole.Admin, UserRole.Moderator]);
    this.hasPermissionAdmin = this.checkPermission([UserRole.Admin]);

    if(!this.getSelectedTerminal()){
      this.terminalService.getUserTerminals()
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.dashboardService.setUserTerminals(res.data);
          this.dashboardService.setSelectedTerminal(this.dashboardService.getUserTerminals()[0]);
          // this.router.navigate(['dashboard/' + this.getSelectedTerminal().name + '/details']);
        },
        error:(err)=>{
          console.log(err);
        }
      });
    }

  }

  toggleTerminalDropdown() {
    this.terminalDropdown = !this.terminalDropdown;
  }
  toggleAdminDropdown() {
    this.adminDropdown = !this.adminDropdown;
  }

  logOut() {
    this.authService.logOut();
  }

  getImageUrl(): string {
    // Replace with image in DB (in local storage)
    return "../../../../../assets/temp/profile_image.jpg";
  }

  checkPermission(expectedRoles: UserRole[]): boolean {
    return this.authService.getUserPremisson(expectedRoles);
  }

  selectTerminal(terminal: any[]) {
    this.dashboardService.setSelectedTerminal(terminal);
  }

  getSelectedTerminal() {
    return this.dashboardService.getSeletedTerminal();
  }

  getUserTerminals() {
    return this.dashboardService.getUserTerminals();
  }

  
}
