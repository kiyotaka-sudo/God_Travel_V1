package com.godtravel.backend.service;

import com.godtravel.backend.repository.VerrouSiegeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final VerrouSiegeRepository verrouSiegeRepository;

    @Scheduled(fixedDelay = 120_000)
    @Transactional
    public void nettoyerVerrousExpires() {
        verrouSiegeRepository.deleteExpired(LocalDateTime.now());
    }
}
