package com.intervai.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeExecutionResponse {

    private String language;
    private String version;
    private String stdout;
    private String stderr;
    private String output;
    private Integer exitCode;
    private Long executionTimeMs;
    private String status; // SUCCESS, COMPILE_ERROR, RUNTIME_ERROR, TIMEOUT, ERROR
}

