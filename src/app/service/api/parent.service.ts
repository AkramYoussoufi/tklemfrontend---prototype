import { Injectable } from '@angular/core';
import { Environement } from 'src/Environement';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Parent } from '../../util/domain/Parent';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class ParentService {
  headers: HttpHeaders = new HttpHeaders();
  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.headers = this.headers
      .set('Content-Type', 'application/json')
      .set('Authorization', this.cookieService.get('token'));
  }

  getAllParents() {
    return this.http.get<Parent[]>(
      Environement.URL_API + 'api/admin/parent/all',
      {
        headers: this.headers,
      }
    );
  }
  addParent(data: any) {
    return this.http.post(Environement.URL_API + 'api/admin/parent/add', data, {
      headers: this.headers,
    });
  }
  deleteParent(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/parent/delete',
      data,
      {
        headers: this.headers,
      }
    );
  }

  deleteAllParents(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/parent/deleteall',
      data,
      {
        headers: this.headers,
      }
    );
  }

  editParent(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/parent/edit',
      data,
      {
        headers: this.headers,
      }
    );
  }

  editParentPassword(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/parent/edit-password',
      data,
      {
        headers: this.headers,
      }
    );
  }
}
