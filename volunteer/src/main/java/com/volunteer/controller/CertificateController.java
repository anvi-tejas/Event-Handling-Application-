package com.volunteer.controller;

import com.volunteer.entity.Participation;
import com.volunteer.entity.Event;
import com.volunteer.repository.ParticipationRepository;
import com.volunteer.repository.EventRepository;
import com.volunteer.service.CertificateService;
import com.volunteer.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/certificate")
@CrossOrigin(origins = "http://localhost:5173")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EmailService emailService;

    // ================= DOWNLOAD CERTIFICATE =================
    @GetMapping("/download/{participationId}")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long participationId) {

        Participation p = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        Event event = eventRepository.findById(p.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        byte[] pdf = certificateService.generateCertificate(participationId);

        // 📧 Notify volunteer (safe)
        try {
            emailService.sendCertificateAvailableEmail(
                    p.getVolunteerEmail(),
                    event.getTitle()
            );
        } catch (Exception e) {
            System.out.println("Certificate email failed: " + e.getMessage());
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=certificate.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
