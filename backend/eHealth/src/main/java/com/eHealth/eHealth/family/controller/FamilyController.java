package com.eHealth.eHealth.family.controller;

import com.eHealth.eHealth.dto.AddFamilyMemberRequest;
import com.eHealth.eHealth.dto.FamilyMemberResponse;
import com.eHealth.eHealth.family.FamilyService;
import com.eHealth.eHealth.model.Family;

import jakarta.servlet.http.HttpServletRequest;
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
    public Family createFamily(HttpServletRequest request) {
        return familyService.createFamily(request);
    }

    /* ADD MEMBER */
    @PostMapping("/add-member")
    public Family addMember(@RequestBody AddFamilyMemberRequest req, HttpServletRequest request) {
        return familyService.addMember(request, req);
    }

    /* REMOVE MEMBER */
    @DeleteMapping("/remove/{patientId}")
    public void removeMember(@PathVariable String patientId, HttpServletRequest request) {
        familyService.removeMember(request, patientId);
    }

    /* GET FAMILY */
    @GetMapping("/members")
    public List<FamilyMemberResponse> members(HttpServletRequest request) {
        return familyService.getFamilyMembers(request);
    }
}