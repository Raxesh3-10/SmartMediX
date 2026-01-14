package com.eHealth.eHealth.patient.service;

import java.util.List;
import java.util.Map;

public interface PatientBillingService {
    List<Map<String, Object>> getMyBillingHistory(String jwt);
}