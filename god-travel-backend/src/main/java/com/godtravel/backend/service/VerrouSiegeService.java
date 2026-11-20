package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.billetterie.VerrouSiegeResponse;
import com.godtravel.backend.model.entity.VerrouSiege;
import com.godtravel.backend.repository.BilletRepository;
import com.godtravel.backend.repository.VerrouSiegeRepository;
import com.godtravel.backend.repository.VoyageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VerrouSiegeService {

    private static final long DUREE_VERROU_MINUTES = 15;
    private static final char[] ID_SUFFIX_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final VerrouSiegeRepository verrouSiegeRepository;
    private final VoyageRepository voyageRepository;
    private final BilletRepository billetRepository;

    @Value("${app.jwt.secret:}")
    private String ownerSigningSecret;

    @Transactional
    public VerrouSiegeResponse verrouiller(String idVoyage, int numSiege) {
        LocalDateTime now = LocalDateTime.now();
        verrouSiegeRepository.deleteExpired(now);

        var voyage = voyageRepository.findById(idVoyage)
                .orElseThrow(() -> new ResourceNotFoundException("Voyage", "id", idVoyage));
        int totalPlaces = voyage.getBus() == null ? 50 : voyage.getBus().getNbPlaces();
        if (numSiege < 1 || numSiege > totalPlaces) {
            throw new BusinessException("Numéro de siège invalide. Ce bus a " + totalPlaces + " places.");
        }

        if (billetRepository.existsByVoyage_IdVoyageAndNumSiegeAndStatutBilletIn(
                idVoyage, numSiege, List.of("VALIDE", "EMBARQUE"))) {
            throw new BusinessException("Ce siège est déjà vendu.");
        }
        if (billetRepository.existsSiegeOccupe(idVoyage, numSiege, now.minusMinutes(10))) {
            throw new BusinessException("Ce siège fait déjà l’objet d’un paiement en cours.");
        }

        var currentLock = verrouSiegeRepository.findByVoyage_IdVoyageAndNumSiege(idVoyage, numSiege);
        if (currentLock.isPresent()) {
            if (currentLock.get().getDateExpirationVerrou().isAfter(now)) {
                throw new BusinessException("Ce siège est temporairement réservé par un autre utilisateur.");
            }
            // Exact-second DATETIME values can equal `now`; delete this expired row before reusing its unique seat key.
            verrouSiegeRepository.delete(currentLock.get());
            verrouSiegeRepository.flush();
        }

        Authentication authentication = currentAuthentication();
        LocalDateTime expiration = now.plusMinutes(DUREE_VERROU_MINUTES);
        VerrouSiege lock = VerrouSiege.builder()
                .idVerrou(newLockId(authentication))
                .voyage(voyage)
                .numSiege(numSiege)
                .dateExpirationVerrou(expiration)
                .build();
        try {
            lock = verrouSiegeRepository.saveAndFlush(lock);
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException("Ce siège est temporairement réservé par un autre utilisateur.");
        }
        return response(lock, now);
    }

    @Transactional
    public void liberer(String idVoyage, int numSiege) {
        if (numSiege < 1) throw new BusinessException("Le numéro de siège doit être supérieur à zéro.");
        var lock = verrouSiegeRepository.findByVoyage_IdVoyageAndNumSiege(idVoyage, numSiege);
        if (lock.isEmpty()) return;
        if (!belongsToCurrentUser(lock.get())) {
            throw new BusinessException("Vous ne pouvez libérer que le siège que vous avez verrouillé.");
        }
        verrouSiegeRepository.delete(lock.get());
    }

    @Transactional(readOnly = true)
    public List<Integer> getSiegesVerrouilles(String idVoyage) {
        return verrouSiegeRepository
                .findByVoyage_IdVoyageAndDateExpirationVerrouAfter(idVoyage, LocalDateTime.now())
                .stream()
                .map(VerrouSiege::getNumSiege)
                .distinct()
                .sorted()
                .toList();
    }

    /** A ticket can only be created while the authenticated account owns the active lock. */
    @Transactional(readOnly = true)
    public void verifierVerrouPourReservation(String idVoyage, int numSiege) {
        VerrouSiege lock = verrouSiegeRepository
                .findByVoyage_IdVoyageAndNumSiege(idVoyage, numSiege)
                .filter(value -> value.getDateExpirationVerrou().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new BusinessException("Verrouillez ce siège avant de confirmer la réservation."));
        if (!belongsToCurrentUser(lock)) {
            throw new BusinessException("Ce siège est temporairement réservé par un autre utilisateur.");
        }
    }

    private VerrouSiegeResponse response(VerrouSiege lock, LocalDateTime now) {
        return new VerrouSiegeResponse(
                lock.getIdVerrou(),
                lock.getVoyage().getIdVoyage(),
                lock.getNumSiege(),
                lock.getDateExpirationVerrou(),
                Math.max(0, java.time.Duration.between(now, lock.getDateExpirationVerrou()).toSeconds())
        );
    }

    private boolean belongsToCurrentUser(VerrouSiege lock) {
        String id = lock.getIdVerrou();
        if (id == null || id.length() != 20 || !id.startsWith("VS")) return false;
        byte[] stored = id.substring(2, 14).getBytes(StandardCharsets.US_ASCII);
        byte[] expected = ownerFingerprint(currentAuthentication()).getBytes(StandardCharsets.US_ASCII);
        return MessageDigest.isEqual(stored, expected);
    }

    /* The existing schema has no owner column. An HMAC tag in the opaque 20-character PK
       lets the API enforce ownership without adding or repurposing a database column. */
    private String newLockId(Authentication authentication) {
        return "VS" + ownerFingerprint(authentication) + randomSuffix();
    }

    private String ownerFingerprint(Authentication authentication) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(ownerSigningSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(("seat-lock-owner:" + authentication.getName()).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().withUpperCase().formatHex(digest, 0, 6);
        } catch (Exception exception) {
            throw new IllegalStateException("Impossible de calculer l’identifiant du verrou de siège.", exception);
        }
    }

    private String randomSuffix() {
        StringBuilder suffix = new StringBuilder(6);
        for (int i = 0; i < 6; i++) suffix.append(ID_SUFFIX_ALPHABET[SECURE_RANDOM.nextInt(ID_SUFFIX_ALPHABET.length)]);
        return suffix.toString();
    }

    private Authentication currentAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new BusinessException("Connectez-vous pour verrouiller ce siège.");
        }
        return authentication;
    }
}
