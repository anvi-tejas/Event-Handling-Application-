package com.volunteer.controller;

import com.volunteer.entity.Complaint;
import com.volunteer.repository.ComplaintRepository;
import com.volunteer.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EmailService emailService;

    // 🧾 Raise complaint
    @PostMapping("/raise")
    public Complaint raiseComplaint(@RequestBody Complaint complaint) {
        complaint.setStatus("OPEN");
        return complaintRepository.save(complaint);
    }

    // 👤 User sees own complaints
    @GetMapping("/user/{email}")
    public List<Complaint> getUserComplaints(@PathVariable String email) {
        return complaintRepository.findByUserEmail(email);
    }

    // 👨‍💼 Admin sees all complaints
    @GetMapping("/admin/all")
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // ✅ Resolve complaint + email
    @PutMapping("/admin/resolve/{id}")
    public Complaint resolveComplaint(@PathVariable Long id) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus("RESOLVED");
        Complaint saved = complaintRepository.save(complaint);

        // 📧 Notify user
        emailService.sendComplaintResolvedEmail(saved.getUserEmail());

        return saved;
    }
}
