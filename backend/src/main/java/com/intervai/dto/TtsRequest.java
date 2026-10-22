package com.intervai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TtsRequest {

    @NotBlank(message = "Text for TTS synthesis cannot be blank")
    private String text;

    @Builder.Default
    private String voice = "alloy";

    @Builder.Default
    private String persona = "sarah";

    @Builder.Default
    private Double speed = 1.0;
}

