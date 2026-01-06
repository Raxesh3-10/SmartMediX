package com.eHealth.eHealth.family;

import com.eHealth.eHealth.model.Family;
import com.eHealth.eHealth.model.FamilyMember;
import org.springframework.stereotype.Service;

@Service
public class FamilyService {

    public void addMember(Family f, FamilyMember m) {
        if (f.getMembers().size() >= 4)
            throw new RuntimeException("Max 3 additional family members allowed");
        f.getMembers().add(m);
    }
}
