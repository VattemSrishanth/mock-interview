package com.intervai.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @Size(max = 4096, message = "TTS text must be at most 4096 characters")
    private String text;

    @Size(max = 40, message = "Voice identifier must be at most 40 characters")
    @Builder.Default
    private String voice = "alloy";

    @Size(max = 40, message = "Persona identifier must be at most 40 characters")
    @Builder.Default
    private String persona = "sarah";

    @DecimalMin(value = "0.25", message = "TTS speed must be at least 0.25")
    @DecimalMax(value = "4.0", message = "TTS speed must be at most 4.0")
    @Builder.Default
    private Double speed = 1.0;
}

