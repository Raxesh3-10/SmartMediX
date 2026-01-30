package com.eHealth.eHealth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class LoginResponse {
    private String role;
    
    @JsonIgnore 
    private String cookieHeader; 
    @JsonIgnore
    private String deviceCookie; 

    public LoginResponse(String deviceCookie, String role, String cookieHeader) {
        this.deviceCookie = deviceCookie;
        this.role = role;
        this.cookieHeader = cookieHeader;
    }

    public String getdeviceCookie() { return deviceCookie; }
    public void setdeviceCookie(String deviceCookie) { this.deviceCookie = deviceCookie; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCookieHeader() { return cookieHeader; }
    public void setCookieHeader(String cookieHeader) { this.cookieHeader = cookieHeader; }
}