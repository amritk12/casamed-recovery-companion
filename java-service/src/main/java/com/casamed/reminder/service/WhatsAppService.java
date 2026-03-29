package com.casamed.reminder.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class WhatsAppService {

    @Value("${whatsapp.token}")
    private String whatsappToken;

    @Value("${whatsapp.phone.id}")
    private String phoneId;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendReminder(String phone, String patientName,
                              String therapistName, String dateTime) {
        String url = "https://graph.facebook.com/v18.0/" + phoneId + "/messages";

        Map<String, Object> parameter1 = new HashMap<>();
        parameter1.put("type", "text");
        parameter1.put("text", patientName);

        Map<String, Object> parameter2 = new HashMap<>();
        parameter2.put("type", "text");
        parameter2.put("text", therapistName);

        Map<String, Object> parameter3 = new HashMap<>();
        parameter3.put("type", "text");
        parameter3.put("text", dateTime);

        Map<String, Object> component = new HashMap<>();
        component.put("type", "body");
        component.put("parameters", List.of(parameter1, parameter2, parameter3));

        Map<String, Object> language = new HashMap<>();
        language.put("code", "en");

        Map<String, Object> template = new HashMap<>();
        template.put("name", "casamed_session_reminder");
        template.put("language", language);
        template.put("components", List.of(component));

        Map<String, Object> body = new HashMap<>();
        body.put("messaging_product", "whatsapp");
        body.put("to", phone);
        body.put("type", "template");
        body.put("template", template);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(whatsappToken);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                url, request, String.class
            );
            System.out.println("WhatsApp sent to " + phone + 
                               " | Status: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("WhatsApp error for " + phone + ": " + e.getMessage());
        }
    }
}