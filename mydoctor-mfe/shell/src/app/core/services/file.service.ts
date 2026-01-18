import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FileUploadResponse {
    fileName: string;
    url: string;
}

@Injectable({
    providedIn: 'root'
})
export class FileService {
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        private configService: ConfigService
    ) {
        this.apiUrl = `${this.configService.apiUrl}/api/v1/files`;
    }

    uploadFile(file: File): Observable<FileUploadResponse> {
        const formData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData);
    }

    getFileUrl(fileName: string): string {
        return `${this.apiUrl}/${fileName}`;
    }
}
