package com.intervai;

import org.springframework.test.context.ActiveProfiles;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = com.intervai.Application.class, properties = {
		"JWT_SECRET=AxQlNktdZHp7gJmipaqzvL3G0e7x9PYOFCUmKzRNSEs=",
		"CORS_ALLOWED_ORIGINS=http://localhost:5173",
		"spring.datasource.url=jdbc:h2:mem:dev-context-test;DB_CLOSE_DELAY=-1"
})
@ActiveProfiles("dev")
class DemoApplicationTests {

	@Test
	void contextLoads() {
	}

}
