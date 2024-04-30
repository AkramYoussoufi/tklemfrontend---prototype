import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Environement } from '../../../Environement';
import { Reciever } from '../../util/domain/Reciever';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class RecieverService {
  headers: HttpHeaders = new HttpHeaders();
  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.headers = this.headers
      .set('Content-Type', 'application/json')
      .set('Authorization', this.cookieService.get('token'));
  }

  getAllRecievers() {
    return this.http.get<Reciever[]>(
      Environement.URL_API + 'api/admin/reciever/all',
      {
        headers: this.headers,
      }
    );
  }

  getCurrentReciever() {
    return this.http.get<Reciever[]>(
      Environement.URL_API + 'api/reciever/current',
      {
        headers: this.headers,
      }
    );
  }

  addReciever(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/reciever/add',
      data,
      {
        headers: this.headers,
      }
    );
  }
  deleteReciever(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/reciever/delete',
      data,
      {
        headers: this.headers,
      }
    );
  }

  deleteAllRecievers(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/reciever/deleteall',
      data,
      {
        headers: this.headers,
      }
    );
  }

  editReciever(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/reciever/edit',
      data,
      {
        headers: this.headers,
      }
    );
  }

  logStudent(data: any) {
    return this.http.post(Environement.URL_API + 'api/reciever/accept', data, {
      headers: this.headers,
    });
  }
  editReceiverPassword(data: any) {
    return this.http.post(
      Environement.URL_API + 'api/admin/reciever/edit-password',
      data,
      {
        headers: this.headers,
      }
    );
  }
}
