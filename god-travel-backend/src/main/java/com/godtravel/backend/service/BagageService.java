package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.bagage.BagageRequest;
import com.godtravel.backend.model.dto.bagage.BagageView;
import com.godtravel.backend.model.entity.Bagage;
import com.godtravel.backend.model.entity.Billet;
import com.godtravel.backend.repository.BagageRepository;
import com.godtravel.backend.repository.BilletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BagageService {

    private static final BigDecimal FRANCHISE_KG = new BigDecimal("20.00");
    private static final BigDecimal TARIF_KILO_XAF = new BigDecimal("200.00");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final BagageRepository bagageRepository;
    private final BilletRepository billetRepository;

    @Transactional
    public BagageView enregistrerBagage(BagageRequest request) {
        Billet billet = billetRepository.findByIdForBagageUpdate(request.idBillet())
                .orElseThrow(() -> new ResourceNotFoundException("Billet", "id", request.idBillet()));
        if (!List.of("VALIDE", "EMBARQUE").contains(billet.getStatutBillet())) {
            throw new BusinessException("Un bagage ne peut être enregistré que pour un billet valide ou embarqué.");
        }
        if (bagageRepository.existsByBillet_IdBillet(billet.getIdBillet())) {
            throw new BusinessException("Un seul bagage est autorisé par billet. Ce billet en possède déjà un.");
        }
        if (request.poidsKg() == null || request.poidsKg().signum() <= 0 || request.poidsKg().precision() - request.poidsKg().scale() > 3) {
            throw new BusinessException("Le poids du bagage doit être compris entre 0,01 et 999,99 kg.");
        }

        BigDecimal frais = BigDecimal.ZERO.setScale(2);
        if (request.poidsKg().compareTo(FRANCHISE_KG) > 0) {
            BigDecimal excedentArrondi = request.poidsKg().subtract(FRANCHISE_KG).setScale(0, RoundingMode.CEILING);
            frais = excedentArrondi.multiply(TARIF_KILO_XAF).setScale(2, RoundingMode.UNNECESSARY);
        }

        Bagage bagage = Bagage.builder()
                .idBagage("BAG-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase())
                .billet(billet)
                .numeroEtiquette(genererEtiquette())
                .poidsKg(request.poidsKg().setScale(2, RoundingMode.HALF_UP))
                .fraisSupplementairesXaf(frais)
                .description(request.description() == null || request.description().isBlank() ? null : request.description().trim())
                .build();

        try {
            return toView(bagageRepository.saveAndFlush(bagage));
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException("L’étiquette du bagage n’a pas pu être attribuée. Réessayez l’enregistrement.");
        }
    }

    @Transactional(readOnly = true)
    public List<BagageView> getBagagesBillet(String idBillet) {
        billetRepository.findById(idBillet)
                .orElseThrow(() -> new ResourceNotFoundException("Billet", "id", idBillet));
        return bagageRepository.findByBillet_IdBillet(idBillet).stream().map(this::toView).toList();
    }

    private String genererEtiquette() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String label = "BAG-%08d".formatted(SECURE_RANDOM.nextInt(100_000_000));
            if (!bagageRepository.existsByNumeroEtiquette(label)) return label;
        }
        throw new BusinessException("Impossible de générer une étiquette bagage unique. Réessayez.");
    }

    private BagageView toView(Bagage bagage) {
        return new BagageView(bagage.getIdBagage(), bagage.getBillet().getIdBillet(), bagage.getBillet().getCodeBillet(),
                bagage.getNumeroEtiquette(), bagage.getPoidsKg(), bagage.getFraisSupplementairesXaf(), bagage.getDescription());
    }
}
