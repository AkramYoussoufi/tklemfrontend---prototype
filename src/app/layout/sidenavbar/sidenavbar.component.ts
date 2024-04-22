import { Component, OnInit } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faUserClock } from '@fortawesome/free-solid-svg-icons';
import { faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import { faFileMedicalAlt } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from 'primeng/api';
import { faBriefcase, faUser, faQrcode, faWifi, faHourglass, faBook, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { AdminService } from 'src/app/service/api/admin.service';
import { AuthService } from 'src/app/service/api/auth.service';

@Component({
  selector: 'app-sidenavbar',
  templateUrl: './sidenavbar.component.html',
  styleUrls: ['./sidenavbar.component.scss'],
})
export class SidenavbarComponent implements OnInit {

  username!: string;
  items: MenuItem[] | undefined;
  constructor(library: FaIconLibrary ,private adminService: AdminService,private authService: AuthService,) {
    library.addIcons(faBriefcase, faUser, faQrcode, faWifi, faHourglass, faBook, faChalkboardTeacher);
    this.getCurrentLoggedUser();
  }
  getCurrentLoggedUser() {
    this.adminService.getCurrentLoggedUser().subscribe((data: any) => {
      this.username = data.email;
    });
  }

  logout() {
    this.authService.logout();
  }
  ngOnInit() {
   
  }
}