import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Environement } from 'src/Environement';
import { Demande } from 'src/app/util/domain/Demande';

@Injectable({
  providedIn: 'root',
})
export class DemandeService {
  headers: HttpHeaders = new HttpHeaders();
  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.headers = this.headers
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.cookieService.get('token')}`)
  }

  public getAllDemands() {
    return this.http.get<Demande[]>(
      Environement.URL_API + 'api/demand/admin/all/parent',
      {
        headers: this.headers,
      }
    );
  }

  public acceptDemand(id: number) {
    return this.http.post(
      Environement.URL_API + 'api/demand/admin/accept/parent',
      { id: id },
      {
        headers: this.headers,
      }
    );
  }

  public declineDemand(id: number) {
    return this.http.post(
      Environement.URL_API + 'api/demand/admin/decline/parent',
      { id: id },
      {
        headers: this.headers,
      }
    );
  }

  public getSize() {
    return this.http.get(Environement.URL_API + 'api/demand/admin/size', {
      headers: this.headers,
    });
  }
}
