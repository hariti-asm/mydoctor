package ma.hariti.asmaa.mydoctor.doctorservice.web.controller;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.doctorservice.application.service.DoctorApplicationService;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Doctor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors/import")
@RequiredArgsConstructor
public class DoctorImportController {

    private final DoctorApplicationService doctorApplicationService;

    @PostMapping("/bulk")
    public List<Doctor> bulkImport(@RequestBody List<Doctor> doctors) {
        return doctorApplicationService.bulkRegisterDoctors(doctors);
    }
}
