import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { DrawerModule } from 'primeng/drawer';


@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar, DrawerModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  sidebarVisible = false;
  isChat = false;

 constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.sidebarVisible = false;
        this.isChat = event.urlAfterRedirects.includes('matia/chat');
      });
  }
}

