import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuComponent } from '../../components/menu/menu.component';
import { DetailsComponent } from '../../components/workspace/workspace.component';
import { RolesComponent } from '../../components/roles/roles.component';
import { UsersComponent } from '../../components/users/users.component';

@Component({
  selector: 'app-page-dashboard',
  standalone: true,
  imports: [ CommonModule, MenuComponent, DetailsComponent, RolesComponent, UsersComponent],
  templateUrl: './page-dashboard.component.html',
  styleUrl: './page-dashboard.component.css'
})
export class PageDashboardComponent {
  route = inject(ActivatedRoute)

  isCurrentRoute(segment: string): boolean {
    const urlSegments = this.route.snapshot.url;
    const lastSegment = urlSegments[urlSegments.length - 1].path;
    return lastSegment === segment;
  }

}
