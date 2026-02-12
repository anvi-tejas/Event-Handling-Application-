package com.volunteer.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HealthController {

    @GetMapping("/health")
    public String health() {
        return "UP";
    }
}
