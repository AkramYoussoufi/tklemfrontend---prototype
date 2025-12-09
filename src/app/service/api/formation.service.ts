import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environement } from 'src/Environement';
import { Formation } from '../../util/domain/Formation';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class FormationService {
  headers: HttpHeaders = new HttpHeaders();
  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.headers = this.headers
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.cookieService.get('token')}`)
  }

  getAllFormations() {
    return this.http.get<Formation[]>(
      Environement.URL_API + 'api/admin/formation/all',
      {
        headers: this.headers,
      }
    );
  }
  deleteFormation(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/formation/delete',
      data,
      {
        headers: this.headers,
      }
    );
  }

  deleteAllFormations() {
    return this.http.post(
      Environement.URL_API + 'api/admin/formation/deleteall',
      {},
      {
        headers: this.headers,
      }
    );
  }

  addFormation(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/formation/add',
      data,
      {
        headers: this.headers,
      }
    );
  }

  editFormation(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/formation/edit',
      data,
      {
        headers: this.headers,
      }
    );
  }
}
