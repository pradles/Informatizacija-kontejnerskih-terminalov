import { Component, OnInit, inject } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
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
  toggleTerminalDropdown: boolean = false;
  localStorage = localStorage;
  userId = localStorage.getItem("user_data");
  terminalService = inject(TerminalService);
  authService = inject(AuthService);
  dashboardService = inject(DashboardService);
  UserRole = UserRole;

  hasPermission: boolean = false;
  userTerminals!: any[];

  ngOnInit(): void {
    this.hasPermission = this.checkPermission([UserRole.Admin, UserRole.Moderator]);

    this.terminalService.getUserTerminals()
    .subscribe({
      next:(res)=>{
        console.log(res);
        this.userTerminals = res.data;
        if(!this.getSelectedTerminal())
          this.dashboardService.setSelectedTerminal(this.userTerminals[0]);
      },
      error:(err)=>{
        console.log(err);
      }
    });
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

  
}
