package ma.hariti.asmaa.mydoctor.userservice.controller;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.userservice.entity.Doctor;
import ma.hariti.asmaa.mydoctor.userservice.service.DoctorService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<Page<Doctor>> getAllDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(doctorService.searchDoctors(specialization, search, pageable));
    }
}
