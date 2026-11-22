package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateShortlistDto {
    private String shortlistId;
    private String shortlistName;
    private String recruiterName;
    private int totalCandidates;
    private double averageCohortScore;
    private List<CandidateApplicationDto> candidates;
}
