package com.volunteer.dto;

import java.util.List;
import com.volunteer.entity.Attendance;

public class AttendanceSummaryResponse {

    private int totalDays;
    private int presentDays;
    private int absentDays;
    private double percentage;
    private List<Attendance> records;

    public AttendanceSummaryResponse(
            int totalDays,
            int presentDays,
            int absentDays,
            double percentage,
            List<Attendance> records) {

        this.totalDays = totalDays;
        this.presentDays = presentDays;
        this.absentDays = absentDays;
        this.percentage = percentage;
        this.records = records;
    }

    public int getTotalDays() { return totalDays; }
    public int getPresentDays() { return presentDays; }
    public int getAbsentDays() { return absentDays; }
    public double getPercentage() { return percentage; }
    public List<Attendance> getRecords() { return records; }
}
