package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.promotion.PromotionApplication;
import com.godtravel.backend.model.dto.promotion.PromotionValidationView;
import com.godtravel.backend.model.dto.promotion.PromotionView;
import com.godtravel.backend.model.entity.Promotion;
import com.godtravel.backend.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private static final ZoneId ZONE_CAMEROUN = ZoneId.of("Africa/Douala");
    private final PromotionRepository promotionRepository;

    @Transactional(readOnly = true)
    public PromotionValidationView verifierPromo(String codePromo) {
        Promotion promo = promotionRepository.findByCodePromoIgnoreCase(normaliser(codePromo))
                .orElseThrow(() -> new ResourceNotFoundException("Code promo", "code", codePromo));
        valider(promo, LocalDate.now(ZONE_CAMEROUN));
        return new PromotionValidationView(true, promo.getCodePromo(), promo.getLibellePromo(), promo.getTypeRemise(),
                promo.getValeurRemise(), promo.getDateFin(), Math.max(0, promo.getUsagesMax() - promo.getUsagesActuels()));
    }

    @Transactional
    public PromotionApplication appliquerPromo(String codePromo, BigDecimal prixOriginal) {
        if (prixOriginal == null || prixOriginal.signum() <= 0) throw new BusinessException("Le tarif initial est invalide.");
        Promotion promo = promotionRepository.findByCodeForUpdate(normaliser(codePromo))
                .orElseThrow(() -> new ResourceNotFoundException("Code promo", "code", codePromo));
        valider(promo, LocalDate.now(ZONE_CAMEROUN));
        BigDecimal remise = calculerRemise(promo, prixOriginal);
        BigDecimal prixFinal = prixOriginal.subtract(remise).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        promo.setUsagesActuels(promo.getUsagesActuels() + 1);
        promotionRepository.save(promo);
        return new PromotionApplication(promo, remise, prixFinal);
    }

    @Transactional
    public void annulerUtilisation(Promotion promotion) {
        if (promotion == null || promotion.getCodePromo() == null) return;
        promotionRepository.findByCodeForUpdate(promotion.getCodePromo()).ifPresent(promo -> {
            if (promo.getUsagesActuels() != null && promo.getUsagesActuels() > 0) {
                promo.setUsagesActuels(promo.getUsagesActuels() - 1);
                promotionRepository.save(promo);
            }
        });
    }

    @Transactional(readOnly = true)
    public List<PromotionView> getPromotions() {
        return promotionRepository.findAllByOrderByDateDebutDesc().stream().map(this::toView).toList();
    }

    private BigDecimal calculerRemise(Promotion promo, BigDecimal prix) {
        BigDecimal valeur = promo.getValeurRemise();
        if (valeur == null || valeur.signum() <= 0) throw new BusinessException("La remise de ce code promo est invalide.");
        if ("POURCENTAGE".equalsIgnoreCase(promo.getTypeRemise())) {
            if (valeur.compareTo(new BigDecimal("100")) > 0) throw new BusinessException("Le pourcentage de remise ne peut pas dépasser 100 %.");
            return prix.multiply(valeur).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP).min(prix);
        }
        if ("MONTANT_FIXE".equalsIgnoreCase(promo.getTypeRemise())) return valeur.min(prix).setScale(2, RoundingMode.HALF_UP);
        throw new BusinessException("Le type de remise de ce code promo n’est pas pris en charge.");
    }

    private void valider(Promotion promo, LocalDate today) {
        if (!Boolean.TRUE.equals(promo.getEstActive())) throw new BusinessException("Ce code promo n’est plus actif.");
        if (today.isBefore(promo.getDateDebut()) || today.isAfter(promo.getDateFin())) throw new BusinessException("Ce code promo n’est pas valable à cette date.");
        if (promo.getUsagesActuels() == null || promo.getUsagesMax() == null || promo.getUsagesActuels() >= promo.getUsagesMax())
            throw new BusinessException("Le quota de ce code promo est atteint.");
        if (!List.of("POURCENTAGE", "MONTANT_FIXE").contains(promo.getTypeRemise())) throw new BusinessException("Le type de remise de ce code promo est invalide.");
        if (promo.getValeurRemise() == null || promo.getValeurRemise().signum() <= 0
                || "POURCENTAGE".equalsIgnoreCase(promo.getTypeRemise()) && promo.getValeurRemise().compareTo(new BigDecimal("100")) > 0)
            throw new BusinessException("La valeur de remise de ce code promo est invalide.");
    }

    private String normaliser(String codePromo) {
        return codePromo == null ? "" : codePromo.trim().toUpperCase();
    }

    private PromotionView toView(Promotion promo) {
        return new PromotionView(promo.getCodePromo(), promo.getLibellePromo(), promo.getTypeRemise(), promo.getValeurRemise(),
                promo.getDateDebut(), promo.getDateFin(), promo.getUsagesMax(), promo.getUsagesActuels(), Boolean.TRUE.equals(promo.getEstActive()));
    }
}
