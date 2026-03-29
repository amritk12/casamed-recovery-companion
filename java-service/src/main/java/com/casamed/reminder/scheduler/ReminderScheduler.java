package com.casamed.reminder.scheduler;

import com.casamed.reminder.model.Session;
import com.casamed.reminder.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
public class ReminderScheduler {

    @Autowired
    private WhatsAppService whatsAppService;

    @Value("${casamed.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Runs every 60 seconds
    @Scheduled(fixedRate = 60000)
    public void checkAndSendReminders() {
        System.out.println("[SCHEDULER] Checking sessions at: " + 
                           LocalDateTime.now());

        try {
            String url = apiUrl + "/api/sessions";
            ResponseEntity<Session[]> response = restTemplate.getForEntity(
                url, Session[].class
            );

            Session[] sessions = response.getBody();
            if (sessions == null || sessions.length == 0) {
                System.out.println("[SCHEDULER] No sessions found.");
                return;
            }

            ZoneId ist = ZoneId.of("Asia/Kolkata");
            ZonedDateTime now = ZonedDateTime.now(ist);

            for (Session session : sessions) {
                if (!"pending".equals(session.getReminderStatus())) {
                    continue;
                }

                ZonedDateTime sessionTime = ZonedDateTime.parse(
                    session.getSessionDateTime(),
                    DateTimeFormatter.ISO_DATE_TIME.withZone(ist)
                );

                long hoursUntil = Duration.between(now, sessionTime).toHours();
                long minutesUntil = Duration.between(now, sessionTime).toMinutes();

                String formattedTime = sessionTime
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

                // 24hr reminder window: between 24h and 23h before
                if (hoursUntil <= 24 && hoursUntil >= 23) {
                    System.out.println("[SCHEDULER] Sending 24hr reminder to: " +
                                       session.getPatientName());
                    whatsAppService.sendReminder(
                        session.getPhoneNumber(),
                        session.getPatientName(),
                        session.getTherapistName(),
                        formattedTime
                    );
                    updateReminderStatus(session.get_id(), "sent_24h");
                }

                // 1hr reminder window: between 60min and 50min before
                else if (minutesUntil <= 60 && minutesUntil >= 50 &&
                         "sent_24h".equals(session.getReminderStatus())) {
                    System.out.println("[SCHEDULER] Sending 1hr reminder to: " +
                                       session.getPatientName());
                    whatsAppService.sendReminder(
                        session.getPhoneNumber(),
                        session.getPatientName(),
                        session.getTherapistName(),
                        formattedTime
                    );
                    updateReminderStatus(session.get_id(), "sent_1h");
                }
            }

        } catch (Exception e) {
            System.err.println("[SCHEDULER] Error: " + e.getMessage());
        }
    }

    private void updateReminderStatus(String sessionId, String status) {
        try {
            String url = apiUrl + "/api/reminders/status";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("sessionId", sessionId);
            body.put("status", status);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, String.class);
            System.out.println("[SCHEDULER] Status updated to: " + status);
        } catch (Exception e) {
            System.err.println("[SCHEDULER] Status update error: " + e.getMessage());
        }
    }
}