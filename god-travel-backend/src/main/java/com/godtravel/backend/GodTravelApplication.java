package com.godtravel.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GodTravelApplication {

    public static void main(String[] args) {
        SpringApplication.run(GodTravelApplication.class, args);
    }
}

