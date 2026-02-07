package ma.hariti.asmaa.mydoctor.appointmentservice.application.service;

import ma.hariti.asmaa.mydoctor.appointmentservice.application.dto.AppointmentNotificationRequest;
import ma.hariti.asmaa.mydoctor.appointmentservice.application.dto.UserProfileResponse;
import ma.hariti.asmaa.mydoctor.appointmentservice.domain.model.Appointment;
import ma.hariti.asmaa.mydoctor.appointmentservice.domain.ports.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentApplicationServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private KafkaTemplate<String, AppointmentNotificationRequest> kafkaTemplate;

    @InjectMocks
    private AppointmentApplicationService appointmentService;

    @BeforeEach
    void setUp() {
        // Inject values for @Value fields
        ReflectionTestUtils.setField(appointmentService, "frontendUrl", "http://localhost:4200");
        ReflectionTestUtils.setField(appointmentService, "userServiceUrl", "http://localhost:8081/api/v1");
    }

    // --- createAppointment Scenarios ---

    @Test
    void createAppointment_ShouldSaveAndNotify_WhenTypeIsVideo() {
        // Arrange
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setAppointmentType("VIDEO");
        appointment.setPatientId(1L);
        appointment.setDoctorId(2L);
        appointment.setStartDateTime(LocalDateTime.now());

        UserProfileResponse patient = UserProfileResponse.builder().email("patient@test.com").firstName("John").build();
        UserProfileResponse doctor = UserProfileResponse.builder().email("doctor@test.com").firstName("Dr. Smith")
                .build();

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(restTemplate.getForObject(anyString(), eq(UserProfileResponse.class))).thenReturn(patient)
                .thenReturn(doctor);

        // Act
        Appointment result = appointmentService.createAppointment(appointment);

        // Assert
        assertEquals("PENDING", result.getStatus());
        verify(appointmentRepository, times(1)).save(appointment);
        verify(kafkaTemplate, times(2)).send(eq("appointment-notifications"),
                any(AppointmentNotificationRequest.class));
    }

    @Test
    void createAppointment_ShouldSaveButNotNotify_WhenTypeIsConsultation() {
        // Arrange
        Appointment appointment = new Appointment();
        appointment.setAppointmentType("CONSULTATION");
        appointment.setPatientId(1L);
        appointment.setDoctorId(2L);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        // Act
        Appointment result = appointmentService.createAppointment(appointment);

        // Assert
        assertEquals("PENDING", result.getStatus());
        verify(appointmentRepository, times(1)).save(appointment);
        // Verify notification logic is skipped
        verify(restTemplate, never()).getForObject(anyString(), eq(UserProfileResponse.class));
        verify(kafkaTemplate, never()).send(anyString(), any(AppointmentNotificationRequest.class));
    }

    @Test
    void createAppointment_ShouldNotFail_WhenNotificationThrowsException() {
        // Arrange
        Appointment appointment = new Appointment();
        appointment.setAppointmentType("VIDEO");
        appointment.setPatientId(1L);
        appointment.setDoctorId(2L);
        appointment.setStartDateTime(LocalDateTime.now());

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(restTemplate.getForObject(anyString(), eq(UserProfileResponse.class)))
                .thenThrow(new RuntimeException("Service Down"));

        // Act
        Appointment result = appointmentService.createAppointment(appointment);

        // Assert
        assertEquals("PENDING", result.getStatus()); // Should still succeed
        verify(appointmentRepository, times(1)).save(appointment);
    }

    // --- getAppointmentById Scenarios ---

    @Test
    void getAppointmentById_ShouldReturnAppointment_WhenFound() {
        Appointment app = new Appointment();
        app.setId(1L);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(app));

        Appointment result = appointmentService.getAppointmentById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void getAppointmentById_ShouldThrowException_WhenNotFound() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> appointmentService.getAppointmentById(1L));
    }

    // --- confirmAppointment Scenarios ---

    @Test
    void confirmAppointment_ShouldUpdateStatus_WhenFound() {
        Appointment app = new Appointment();
        app.setStatus("PENDING");
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(app));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(i -> i.getArguments()[0]);

        Appointment result = appointmentService.confirmAppointment(1L);

        assertEquals("CONFIRMED", result.getStatus());
    }

    @Test
    void confirmAppointment_ShouldThrowException_WhenNotFound() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> appointmentService.confirmAppointment(1L));
    }

    // --- getAvailableSlots Scenarios ---

    @Test
    void getAvailableSlots_ShouldReturnAll_WhenNoBookings() {
        when(appointmentRepository.findByDoctorId(1L)).thenReturn(Collections.emptyList());

        List<String> slots = appointmentService.getAvailableSlots(1L, "2024-01-01");

        // The service defines 9 slots (09:00 to 17:00)
        assertEquals(9, slots.size());
        assertTrue(slots.contains("09:00"));
    }

    @Test
    void getAvailableSlots_ShouldFilterBookedSlots() {
        Appointment booked = new Appointment();
        booked.setStartDateTime(LocalDateTime.parse("2024-01-01T10:00:00"));

        when(appointmentRepository.findByDoctorId(1L)).thenReturn(List.of(booked));

        List<String> slots = appointmentService.getAvailableSlots(1L, "2024-01-01");

        assertEquals(8, slots.size());
        assertFalse(slots.contains("10:00"));
        assertTrue(slots.contains("09:00"));
    }
}
