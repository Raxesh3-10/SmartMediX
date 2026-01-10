package com.eHealth.eHealth.family.controller;

import com.eHealth.eHealth.family.FamilyService;
import com.eHealth.eHealth.model.Family;
import com.eHealth.eHealth.model.FamilyMember;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyService service;

    public FamilyController(FamilyService service) {
        this.service = service;
    }

    @PostMapping("/add-member")
    public Family addMember(@RequestBody Family family,
                            @RequestBody FamilyMember member) {

        service.addMember(family, member);
        return family;
    }
}
