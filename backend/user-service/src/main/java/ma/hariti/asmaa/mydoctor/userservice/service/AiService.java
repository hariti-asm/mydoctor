package ma.hariti.asmaa.mydoctor.userservice.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiService {

    private static final Map<String, String> SYMPTOM_SPECIALIZATION_MAP = new HashMap<>();

    static {
        // Cardiologist
        SYMPTOM_SPECIALIZATION_MAP.put("heart", "Cardiologist");
        SYMPTOM_SPECIALIZATION_MAP.put("chest", "Cardiologist");
        SYMPTOM_SPECIALIZATION_MAP.put("palpitation", "Cardiologist");
        SYMPTOM_SPECIALIZATION_MAP.put("pulse", "Cardiologist");

        // Dermatologist
        SYMPTOM_SPECIALIZATION_MAP.put("skin", "Dermatologist");
        SYMPTOM_SPECIALIZATION_MAP.put("rash", "Dermatologist");
        SYMPTOM_SPECIALIZATION_MAP.put("acne", "Dermatologist");
        SYMPTOM_SPECIALIZATION_MAP.put("itch", "Dermatologist");
        SYMPTOM_SPECIALIZATION_MAP.put("spot", "Dermatologist");

        // Gastroenterologist
        SYMPTOM_SPECIALIZATION_MAP.put("stomach", "Gastroenterologist");
        SYMPTOM_SPECIALIZATION_MAP.put("belly", "Gastroenterologist");
        SYMPTOM_SPECIALIZATION_MAP.put("digest", "Gastroenterologist");
        SYMPTOM_SPECIALIZATION_MAP.put("vomit", "Gastroenterologist");

        // Ophthalmologist
        SYMPTOM_SPECIALIZATION_MAP.put("eye", "Ophthalmologist");
        SYMPTOM_SPECIALIZATION_MAP.put("vision", "Ophthalmologist");
        SYMPTOM_SPECIALIZATION_MAP.put("blur", "Ophthalmologist");
        SYMPTOM_SPECIALIZATION_MAP.put("see", "Ophthalmologist");

        // Dentist
        SYMPTOM_SPECIALIZATION_MAP.put("tooth", "Dentist");
        SYMPTOM_SPECIALIZATION_MAP.put("teeth", "Dentist");
        SYMPTOM_SPECIALIZATION_MAP.put("gum", "Dentist");
        SYMPTOM_SPECIALIZATION_MAP.put("mouth", "Dentist");

        // Orthopedist
        SYMPTOM_SPECIALIZATION_MAP.put("bone", "Orthopedist");
        SYMPTOM_SPECIALIZATION_MAP.put("joint", "Orthopedist");
        SYMPTOM_SPECIALIZATION_MAP.put("knee", "Orthopedist");
        SYMPTOM_SPECIALIZATION_MAP.put("back", "Orthopedist");
        SYMPTOM_SPECIALIZATION_MAP.put("spine", "Orthopedist");

        // Pediatrician
        SYMPTOM_SPECIALIZATION_MAP.put("child", "Pediatrician");
        SYMPTOM_SPECIALIZATION_MAP.put("baby", "Pediatrician");
        SYMPTOM_SPECIALIZATION_MAP.put("infant", "Pediatrician");

        // Neurologist
        SYMPTOM_SPECIALIZATION_MAP.put("nerve", "Neurologist");
        SYMPTOM_SPECIALIZATION_MAP.put("brain", "Neurologist");
        SYMPTOM_SPECIALIZATION_MAP.put("headache", "Neurologist");
        SYMPTOM_SPECIALIZATION_MAP.put("dizzy", "Neurologist");
        SYMPTOM_SPECIALIZATION_MAP.put("migraine", "Neurologist");

        // ENT
        SYMPTOM_SPECIALIZATION_MAP.put("ear", "ENT");
        SYMPTOM_SPECIALIZATION_MAP.put("nose", "ENT");
        SYMPTOM_SPECIALIZATION_MAP.put("throat", "ENT");
        SYMPTOM_SPECIALIZATION_MAP.put("sinus", "ENT");
    }

    public String recommendSpecialist(String symptoms) {
        System.out.println("AI Service received symptoms: " + symptoms); // Debug log

        if (symptoms == null || symptoms.trim().isEmpty()) {
            return "General Practitioner";
        }

        String lowerSymptoms = symptoms.toLowerCase();

        for (Map.Entry<String, String> entry : SYMPTOM_SPECIALIZATION_MAP.entrySet()) {
            if (lowerSymptoms.contains(entry.getKey())) {
                System.out.println("Matched keyword: " + entry.getKey() + " -> " + entry.getValue());
                return entry.getValue();
            }
        }

        System.out.println("No match found, defaulting to GP");
        return "General Practitioner";
    }
}
