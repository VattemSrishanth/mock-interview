package com.intervai.security;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {
    @Test
    void acceptsCanonicalBase64EncodingOfThirtyTwoVariedBytes() {
        byte[] bytes = new byte[32];
        for (int i = 0; i < bytes.length; i++) bytes[i] = (byte) (i * 7 + 3);
        String secret = Base64.getEncoder().encodeToString(bytes);

        assertArrayEquals(bytes, JwtTokenProvider.decodeSecret(secret));
    }

    @Test
    void rejectsMissingMalformedWeakAndWrongLengthSecrets() {
        for (String secret : Arrays.asList("", "not-base64!", Base64.getEncoder().encodeToString(new byte[16]),
                Base64.getEncoder().encodeToString(new byte[32]))) {
            assertThrows(IllegalStateException.class, () -> JwtTokenProvider.decodeSecret(secret));
        }
    }
}
