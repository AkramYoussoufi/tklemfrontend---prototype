import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Environement } from 'src/Environement';
import { Receptor } from 'src/app/util/domain/Receptor';

@Injectable({
  providedIn: 'root',
})
export class ReceptorService {
  headers: HttpHeaders = new HttpHeaders();
  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.headers = this.headers
      .set('Content-Type', 'application/json')
      .set('Authorization', this.cookieService.get('token'));
  }

  getAllReceptors() {
    return this.http.get<Receptor[]>(
      Environement.URL_API + 'api/admin/receptor/all',
      {
        headers: this.headers,
      }
    );
  }
  addReceptor(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/receptor/add',
      data,
      {
        headers: this.headers,
      }
    );
  }
  deleteReceptor(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/receptor/delete',
      data,
      {
        headers: this.headers,
      }
    );
  }

  deleteAllReceptors(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/receptor/deleteall',
      data,
      {
        headers: this.headers,
      }
    );
  }

  editReceptor(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/receptor/edit',
      data,
      {
        headers: this.headers,
      }
    );
  }
  editReceptorPassword(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/receptor/edit-password',
      data,
      {
        headers: this.headers,
      }
    );
  }
}
