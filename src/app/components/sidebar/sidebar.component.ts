import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Conconi Test',  icon: 'heart_broken', class: '' },
    { path: '/user-profile', title: 'User Profile',  icon:'person', class: '' },
    { path: '/typography', title: 'Sleep',  icon:'local_hotel', class: '' },
    { path: '/icons', title: 'My trainings',  icon:'directions_run', class: '' },
    { path: '/upgrade', title: 'Time prediction',  icon:'watch', class: '' },

    //{ path: '/maps', title: 'Maps',  icon:'location_on', class: '' },
    //{ path: '/notifications', title: 'Upgrade to PRO',  icon:'unarchive', class: 'active-pro' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);

  }


  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
