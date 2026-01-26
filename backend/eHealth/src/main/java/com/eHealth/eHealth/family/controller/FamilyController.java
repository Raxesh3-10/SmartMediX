package com.eHealth.eHealth.family.controller;

import com.eHealth.eHealth.dto.AddFamilyMemberRequest;
import com.eHealth.eHealth.dto.FamilyMemberResponse;
import com.eHealth.eHealth.family.FamilyService;
import com.eHealth.eHealth.model.Family;

import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/family")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    /* CREATE FAMILY */
    @PostMapping("/create")
    public Family createFamily(
            @RequestHeader("JWT") String token
    ) {
        return familyService.createFamily(token);
    }

    /* ADD MEMBER */
    @PostMapping("/add-member")
    public Family addMember(
            @RequestHeader("JWT") String token,
            @RequestBody AddFamilyMemberRequest request
    ) {
        return familyService.addMember(token, request);
    }

    /* REMOVE MEMBER */
    @DeleteMapping("/remove/{patientId}")
    public void removeMember(
            @RequestHeader("JWT") String token,
            @PathVariable String patientId
    ) {
        familyService.removeMember(token, patientId);
    }

    /* GET FAMILY */
    @GetMapping("/members")
    public List<FamilyMemberResponse> members(
            @RequestHeader("JWT") String token
    ) {
        return familyService.getFamilyMembers(token);
    }
}