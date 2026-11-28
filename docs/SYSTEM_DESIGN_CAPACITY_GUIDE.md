# System Design Capacity & Topology Reference

## Estimation Formulas
- **Total Daily Requests**: $\text{DAU} \times \text{InteractionsPerUser}$
- **Average QPS**: $\frac{\text{TotalDailyRequests}}{86400}$
- **Peak QPS Multiplier**: $2.5 \times \text{AverageQPS}$
- **Shard Count (`estimateShardCount`)**: $\max\left(1, \left\lceil \frac{\text{DailyStorageGB}}{\text{MaxShardSizeGB}} \right\rceil\right)$

## Built-In Topology Presets (`ARCHITECTURE_PRESETS`)
- `tinyurl`: URL Shortener (NGINX + Redis + Cassandra)
- `uber`: Ride Dispatch System (WebSocket Gateway + Kafka + Geospatial Redis)
- `whatsapp`: Real-Time Messaging System (WebSocket Chat Gateway + Message Router + Presence Redis + Cassandra)
