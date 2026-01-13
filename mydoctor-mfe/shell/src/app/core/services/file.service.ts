import { Injectable } from '@angular/core';
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
    private apiUrl = 'http://localhost:8084/api/v1/files';

    constructor(private http: HttpClient) { }

    uploadFile(file: File): Observable<FileUploadResponse> {
        const formData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData);
    }

    getFileUrl(fileName: string): string {
        return `${this.apiUrl}/${fileName}`;
    }
}
