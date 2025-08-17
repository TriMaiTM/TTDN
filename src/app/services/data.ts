import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  getCompany(): Observable<any> {
    return this.http.get('assets/data/company.json');
  }

  getProjects(): Observable<any> {
    return this.http.get('assets/data/projects.json');
  }

  getNews(): Observable<any> {
    return this.http.get('assets/data/news.json');
  }
}
