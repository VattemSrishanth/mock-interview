package com.intervai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemDesignNodeDto {
    private String id;
    private String type; // CLIENT, CDN, LOAD_BALANCER, API_GATEWAY, MICROSERVICE, CACHE, SQL_DATABASE, NOSQL_DATABASE, MESSAGE_QUEUE, OBJECT_STORAGE
    private String label;
    private double x;
    private double y;
    private String technology; // e.g., Redis, Kafka, PostgreSQL, Nginx
    private int instances;
    private String replicationStrategy; // SINGLE, MASTER_SLAVE, MULTI_REGION, CLUSTERED
}
