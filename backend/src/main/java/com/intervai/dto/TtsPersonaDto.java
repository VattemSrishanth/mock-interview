package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TtsPersonaDto {
    private String id;
    private String name;
    private String title;
    private String accent;
    private String gender;
    private String description;
    private String previewText;
    private String cloudVoice;
    private Double defaultPitch;
    private Double defaultRate;
}

