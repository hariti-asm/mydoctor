package ma.hariti.asmaa.mydoctor.userservice.controller;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.userservice.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/recommend")
    public ResponseEntity<Map<String, String>> recommendDoctor(@RequestBody Map<String, String> request) {
        String symptoms = request.get("symptoms");
        String specialization = aiService.recommendSpecialist(symptoms);
        return ResponseEntity.ok(Map.of("specialization", specialization));
    }
}
