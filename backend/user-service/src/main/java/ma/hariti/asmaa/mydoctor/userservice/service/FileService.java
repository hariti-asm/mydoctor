package ma.hariti.asmaa.mydoctor.userservice.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    String saveFile(MultipartFile file);
    Resource loadFile(String filename);
}
