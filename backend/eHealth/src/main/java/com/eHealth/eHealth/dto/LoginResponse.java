package com.eHealth.eHealth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class LoginResponse {
    private String token; 
    private String role;
    
    @JsonIgnore 
    private String cookieHeader; 

    public LoginResponse(String token, String role, String cookieHeader) {
        this.token = token;
        this.role = role;
        this.cookieHeader = cookieHeader;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCookieHeader() { return cookieHeader; }
    public void setCookieHeader(String cookieHeader) { this.cookieHeader = cookieHeader; }
}