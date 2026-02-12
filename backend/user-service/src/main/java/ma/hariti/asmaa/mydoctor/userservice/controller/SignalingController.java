package ma.hariti.asmaa.mydoctor.userservice.controller;

import ma.hariti.asmaa.mydoctor.userservice.dto.request.WebRTCMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    public SignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/signal")
    public void handleSignal(@Payload WebRTCMessage message) {
        System.out.println("Forwarding " + message.getType() + " for appointment " + message.getAppointmentId());
        messagingTemplate.convertAndSend("/topic/appointment/" + message.getAppointmentId(), message);
    }
}
