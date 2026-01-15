package ma.hariti.asmaa.mydoctor.userservice.controller;

import ma.hariti.asmaa.mydoctor.userservice.service.FileService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileService.saveFile(file);
        // Returning only filename for now. Frontend can reconstruct URL or we can
        // return full URL.
        // Full URL is better usually, assuming standard path.
        // For now, returning filename, frontend knows to fetch from
        // /api/v1/files/{filename}
        return ResponseEntity.ok(Map.of("fileName", fileName, "url", "/api/v1/files/" + fileName));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        Resource file = fileService.loadFile(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }
}
