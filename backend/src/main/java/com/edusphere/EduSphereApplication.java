package com.edusphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class EduSphereApplication {
    public static void main(String[] args) {
        SpringApplication.run(EduSphereApplication.class, args);
    }
}
