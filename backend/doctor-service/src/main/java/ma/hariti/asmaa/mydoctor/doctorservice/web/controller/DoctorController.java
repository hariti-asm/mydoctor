package ma.hariti.asmaa.mydoctor.doctorservice.web.controller;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.doctorservice.application.service.DoctorApplicationService;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import ma.hariti.asmaa.mydoctor.doctorservice.application.service.ReviewApplicationService;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Review;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorApplicationService doctorService;
    private final ReviewApplicationService reviewService;

    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.registerDoctor(doctor));
    }

    @GetMapping
    public ResponseEntity<Page<Doctor>> getAllDoctors(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String speciality,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String city,
            Pageable pageable) {
        if (speciality != null || city != null) {
            return ResponseEntity.ok(doctorService.searchDoctors(speciality, city, pageable));
        }
        return ResponseEntity.ok(doctorService.getAllDoctors(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctor(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Review>> getDoctorReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsByDoctorId(id));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Review> addDoctorReview(@PathVariable Long id, @RequestBody Review review) {
        return ResponseEntity.ok(reviewService.addReview(id, review));
    }
}
