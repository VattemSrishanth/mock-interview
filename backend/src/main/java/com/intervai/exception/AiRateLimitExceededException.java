package com.intervai.exception;

public class AiRateLimitExceededException extends RuntimeException {
    public AiRateLimitExceededException() {
        super("AI request limit exceeded. Please try again later.");
    }
}
