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
public class InterviewTipDto {
    private String category;
    private String title;
    private String summary;
    private List<String> keyPoints;
    private List<String> commonPitfalls;
}
