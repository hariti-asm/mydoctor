import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  async loadConfig() {
    try {
      this.config = await firstValueFrom(this.http.get('/assets/config.json'));
    } catch (err) {
      console.error('Could not load config', err);
      // Fallback
      this.config = { apiUrl: 'http://localhost:9000' };
    }
  }

  get apiUrl(): string {
    return this.config?.apiUrl || 'http://localhost:9000';
  }
}
