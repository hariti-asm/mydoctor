package ma.hariti.asmaa.mydoctor.medicalrecordservice.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.model.MedicalRecord;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.ports.MedicalRecordRepository;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.infrastructure.persistence.entity.MedicalRecordJpaEntity;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.infrastructure.persistence.repository.MedicalRecordJpaRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MedicalRecordPersistenceAdapter implements MedicalRecordRepository {
    private final MedicalRecordJpaRepository jpaRepository;

    @Override
    public MedicalRecord save(MedicalRecord record) {
        return toDomain(jpaRepository.save(toEntity(record)));
    }

    @Override
    public Optional<MedicalRecord> findByTranscriptionJobName(String transcriptionJobName) {
        return jpaRepository.findByTranscriptionJobName(transcriptionJobName).map(this::toDomain);
    }

    @Override
    public Optional<MedicalRecord> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }
    
    @Override
    public List<MedicalRecord> findByPatientId(Long patientId) {
        return jpaRepository.findByPatientId(patientId).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<MedicalRecord> findByAppointmentId(String appointmentId) {
        return jpaRepository.findByAppointmentId(appointmentId).map(this::toDomain);
    }

    @Override
    public List<MedicalRecord> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private MedicalRecordJpaEntity toEntity(MedicalRecord record) {
        return MedicalRecordJpaEntity.builder()
                .id(record.getId())
                .appointmentId(record.getAppointmentId())
                .patientId(record.getPatientId())
                .doctorId(record.getDoctorId())
                .recordDate(record.getRecordDate())
                .diagnosis(record.getDiagnosis())
                .prescription(record.getPrescription())
                .notes(record.getNotes())
                .recordingUrl(record.getRecordingUrl())
                .aiNotes(record.getAiNotes())
                .transcript(record.getTranscript())
                .summary(record.getSummary())
                .attachments(record.getAttachments())
                .transcriptionJobName(record.getTranscriptionJobName())
                .build();
    }

    private MedicalRecord toDomain(MedicalRecordJpaEntity entity) {
        return MedicalRecord.builder()
                .id(entity.getId())
                .appointmentId(entity.getAppointmentId())
                .patientId(entity.getPatientId())
                .doctorId(entity.getDoctorId())
                .recordDate(entity.getRecordDate())
                .diagnosis(entity.getDiagnosis())
                .prescription(entity.getPrescription())
                .notes(entity.getNotes())
                .recordingUrl(entity.getRecordingUrl())
                .aiNotes(entity.getAiNotes())
                .transcript(entity.getTranscript())
                .summary(entity.getSummary())
                .attachments(entity.getAttachments())
                .transcriptionJobName(entity.getTranscriptionJobName())
                .build();
    }
}
