package com.volunteer.service;

import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.volunteer.entity.Event;
import com.volunteer.entity.Participation;
import com.volunteer.repository.EventRepository;
import com.volunteer.repository.ParticipationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class CertificateService {

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private EventRepository eventRepository;

    public byte[] generateCertificate(Long participationId) {

        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        if (!Boolean.TRUE.equals(participation.getCertificateEligible())) {
            throw new RuntimeException("Not eligible for certificate");
        }

        Event event = eventRepository.findById(participation.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("CERTIFICATE OF PARTICIPATION")
                .setBold()
                .setFontSize(20)
                .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

        document.add(new Paragraph("\nThis is to certify that\n\n")
                .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

        document.add(new Paragraph(participation.getVolunteerEmail())
                .setBold()
                .setFontSize(14)
                .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

        document.add(new Paragraph("\nhas successfully participated in the event\n")
                .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

        document.add(new Paragraph(event.getTitle())
                .setBold()
                .setFontSize(14)
                .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

        document.add(new Paragraph("\nAttendance: " +
                String.format("%.2f", participation.getAttendancePercentage()) + "%")
                .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

        document.add(new Paragraph("\nIssued by Community Volunteer Platform")
                .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

        document.close();

        return out.toByteArray();
    }
}
