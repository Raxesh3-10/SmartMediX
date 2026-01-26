package com.eHealth.eHealth.dto;
import lombok.*;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserActivityStats {
    private long activeDoctors;
    private long inactiveDoctors;
    private long activePatients;
    private long inactivePatients;
}