package com.intervai.controller;

import com.intervai.dto.CodeExecutionRequest;
import com.intervai.dto.CodeExecutionResponse;
import com.intervai.security.UserPrincipal;
import com.intervai.service.CodeExecutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;

    @PostMapping("/execute")
    public ResponseEntity<CodeExecutionResponse> executeCode(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CodeExecutionRequest request) {
        CodeExecutionResponse response = codeExecutionService.executeCode(request);
        return ResponseEntity.ok(response);
    }
}

