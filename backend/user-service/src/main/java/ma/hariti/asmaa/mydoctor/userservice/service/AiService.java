package ma.hariti.asmaa.mydoctor.userservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${OPENAI_API_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final Map<String, String> SYMPTOM_SPECIALIZATION_MAP = new HashMap<>();

    static {
        SYMPTOM_SPECIALIZATION_MAP.put("heart", "Cardiology");
        SYMPTOM_SPECIALIZATION_MAP.put("chest", "Cardiology");
        SYMPTOM_SPECIALIZATION_MAP.put("skin", "Dermatology");
        SYMPTOM_SPECIALIZATION_MAP.put("rash", "Dermatology");
        SYMPTOM_SPECIALIZATION_MAP.put("stomach", "Gastroenterology");
        SYMPTOM_SPECIALIZATION_MAP.put("eye", "Ophthalmology");
        SYMPTOM_SPECIALIZATION_MAP.put("tooth", "Dentist");
        SYMPTOM_SPECIALIZATION_MAP.put("bone", "Orthopedics");
        SYMPTOM_SPECIALIZATION_MAP.put("child", "Pediatrics");
        SYMPTOM_SPECIALIZATION_MAP.put("brain", "Neurology");
        SYMPTOM_SPECIALIZATION_MAP.put("ear", "ENT");
    }

    public String recommendSpecialist(String symptoms) {
        if (symptoms == null || symptoms.trim().isEmpty()) {
            return "General Medicine";
        }

        if (apiKey != null && !apiKey.isEmpty() && !apiKey.startsWith("sk-proj-YOUR")) {
            try {
                return callOpenAi(symptoms);
            } catch (Exception e) {
                System.err.println("OpenAI call failed, falling back to keywords: " + e.getMessage());
            }
        }

        return fallbackRecommend(symptoms);
    }

    private String callOpenAi(String symptoms) {
        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini");
        requestBody.put("messages", List.of(
            Map.of("role", "system", "content", "You are a medical routing assistant. Based on the user's symptoms, suggest the single most relevant medical specialty from this list: Cardiology, Dermatology, Gastroenterology, Ophthalmology, Dentist, Orthopedics, Pediatrics, Neurology, ENT, General Medicine. Reply ONLY with the name of the specialty."),
            Map.of("role", "user", "content", symptoms)
        ));
        requestBody.put("max_tokens", 50);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error calling OpenAI API", e);
        }

        return "General Medicine";
    }

    private String fallbackRecommend(String symptoms) {
        String lowerSymptoms = symptoms.toLowerCase();
        for (Map.Entry<String, String> entry : SYMPTOM_SPECIALIZATION_MAP.entrySet()) {
            if (lowerSymptoms.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "General Practitioner";
    }
}
