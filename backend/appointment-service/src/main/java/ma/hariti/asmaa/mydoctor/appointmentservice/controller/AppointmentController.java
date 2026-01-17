package ma.hariti.asmaa.mydoctor.appointmentservice.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.appointmentservice.entity.Appointment;
import ma.hariti.asmaa.mydoctor.appointmentservice.entity.enums.AppointmentStatus;
import ma.hariti.asmaa.mydoctor.appointmentservice.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody CreateAppointmentRequest request) {
        System.out.println("Received booking request: " + request);
        try {
            Appointment appointment = appointmentService.createAppointment(
                    request.getDoctorId(),
                    request.getPatientId(),
                    request.getStartDateTime(),
                    request.getEndDateTime(),
                    request.getReason(),
                    request.getAppointmentType()
            );
            return ResponseEntity.ok(appointment);
        } catch (IllegalStateException e) {
            System.err.println("Booking conflict: " + e.getMessage());
            return ResponseEntity.status(409).body(null); // 409 Conflict
        } catch (Exception e) {
            e.printStackTrace();
            throw e; 
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestParam AppointmentStatus status) {
        appointmentService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<String>> getAvailableSlots(@RequestParam Long doctorId, @RequestParam String date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(doctorId, date));
    }

    @Data
    public static class CreateAppointmentRequest {
        private Long doctorId;
        private Long patientId;
        private LocalDateTime startDateTime;
        private LocalDateTime endDateTime;
        private String reason;
        private ma.hariti.asmaa.mydoctor.appointmentservice.entity.enums.AppointmentType appointmentType;

        @Override
        public String toString() {
            return "CreateAppointmentRequest{" +
                    "doctorId=" + doctorId +
                    ", patientId=" + patientId +
                    ", startDateTime=" + startDateTime +
                    ", appointmentType=" + appointmentType +
                    '}';
        }
    }
}
