package com.edusphere.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class AcademicGuidanceResponse {

    private Boolean available;
    private String summary;
    private List<String> strengths = new ArrayList<>();
    private List<String> areasToFocus = new ArrayList<>();
    private List<String> studySuggestions = new ArrayList<>();
    private String academicContextSummary;
    private String message;

    public AcademicGuidanceResponse() {}

    public static AcademicGuidanceResponse unavailable(String message) {
        AcademicGuidanceResponse res = new AcademicGuidanceResponse();
        res.setAvailable(false);
        res.setMessage(message);
        return res;
    }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getAreasToFocus() { return areasToFocus; }
    public void setAreasToFocus(List<String> areasToFocus) { this.areasToFocus = areasToFocus; }

    public List<String> getStudySuggestions() { return studySuggestions; }
    public void setStudySuggestions(List<String> studySuggestions) { this.studySuggestions = studySuggestions; }

    public String getAcademicContextSummary() { return academicContextSummary; }
    public void setAcademicContextSummary(String academicContextSummary) { this.academicContextSummary = academicContextSummary; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
