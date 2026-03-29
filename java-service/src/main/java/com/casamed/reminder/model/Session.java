package com.casamed.reminder.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Session {
    private String _id;
    private String patientName;
    private String phoneNumber;
    private String sessionType;
    private String sessionDateTime;
    private String therapistName;
    private String reminderStatus;

    public String get_id() { return _id; }
    public void set_id(String _id) { this._id = _id; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }

    public String getSessionDateTime() { return sessionDateTime; }
    public void setSessionDateTime(String sessionDateTime) { this.sessionDateTime = sessionDateTime; }

    public String getTherapistName() { return therapistName; }
    public void setTherapistName(String therapistName) { this.therapistName = therapistName; }

    public String getReminderStatus() { return reminderStatus; }
    public void setReminderStatus(String reminderStatus) { this.reminderStatus = reminderStatus; }
}