package com.intervai.controller;

import com.intervai.dto.UpdateProfileRequest;
import com.intervai.dto.UserDto;
import com.intervai.security.UserPrincipal;
import com.intervai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/users/profile")
    public ResponseEntity<UserDto> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto profile = userService.getUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/users/profile")
    public ResponseEntity<UserDto> updateUserProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDto updated = userService.updateUserProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/leaderboard/public")
    public ResponseEntity<List<UserDto>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }

    @GetMapping("/skills/public")
    public ResponseEntity<List<String>> getAllSkills() {
        return ResponseEntity.ok(userService.getAllSkills());
    }
}
