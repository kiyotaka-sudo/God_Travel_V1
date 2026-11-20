package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.documents.DocumentBusRequest;
import com.godtravel.backend.model.dto.documents.DocumentBusView;
import com.godtravel.backend.model.entity.Bus;
import com.godtravel.backend.model.entity.DocumentBus;
import com.godtravel.backend.model.entity.TypeDocument;
import com.godtravel.backend.model.entity.view.VueDocumentsBusEcheance;
import com.godtravel.backend.repository.BusRepository;
import com.godtravel.backend.repository.DocumentBusRepository;
import com.godtravel.backend.repository.TypeDocumentRepository;
import com.godtravel.backend.repository.VueDocumentsBusEcheanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentBusService {
    private static final List<String> ETATS_ALERTE = List.of("EXPIRE", "A_RENOUVELER_DANS_30_JOURS");
    private static final ZoneId ZONE_CAMEROUN = ZoneId.of("Africa/Douala");
    private final DocumentBusRepository documentRepository;
    private final VueDocumentsBusEcheanceRepository vueRepository;
    private final BusRepository busRepository;
    private final TypeDocumentRepository typeDocumentRepository;

    @Transactional(readOnly = true)
    public List<DocumentBusView> getDocuments() {
        return vueRepository.findAll().stream().map(this::toView).sorted(Comparator.comparing(DocumentBusView::dateExpiration)).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentBusView> getAlertes() {
        return vueRepository.findByEtatEcheanceInOrderByJoursAvantExpirationAsc(ETATS_ALERTE).stream().map(this::toView).toList();
    }

    @Transactional
    public DocumentBusView enregistrer(DocumentBusRequest request) {
        if (request.dateExpiration().isBefore(request.dateEmission())) throw new BusinessException("L’expiration doit être postérieure à la date d’émission.");
        Bus bus = busRepository.findById(request.idBus()).orElseThrow(() -> new ResourceNotFoundException("Bus", "id", request.idBus()));
        TypeDocument type = typeDocumentRepository.findById(request.idTypeDoc())
                .orElseThrow(() -> new ResourceNotFoundException("Type de document", "id", request.idTypeDoc()));
        LocalDate today = LocalDate.now(ZONE_CAMEROUN);
        DocumentBus document = documentRepository.save(DocumentBus.builder()
                .idDocument("DOC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase())
                .bus(bus).typeDocument(type).numeroPiece(request.numeroPiece().trim())
                .dateEmission(request.dateEmission()).dateExpiration(request.dateExpiration())
                .fichierScan(request.fichierScan() == null || request.fichierScan().isBlank() ? null : request.fichierScan().trim())
                .estValide(!request.dateExpiration().isBefore(today)).build());
        long days = ChronoUnit.DAYS.between(today, document.getDateExpiration());
        return new DocumentBusView(document.getIdDocument(), bus.getIdBus(), bus.getImmatriculation(), bus.getMarque(), bus.getModele(),
                type.getCodeType(), type.getLibelleType(), document.getDateEmission(), document.getDateExpiration(),
                Boolean.TRUE.equals(document.getEstValide()), Math.toIntExact(days), state(days));
    }

    @Transactional(readOnly = true)
    public List<Bus> getBus() { return busRepository.findAll(); }

    @Transactional(readOnly = true)
    public List<TypeDocument> getTypes() { return typeDocumentRepository.findAll(); }

    private DocumentBusView toView(VueDocumentsBusEcheance item) {
        return new DocumentBusView(item.getIdDocument(), item.getIdBus(), item.getImmatriculation(), item.getMarque(), item.getModele(),
                item.getCodeType(), item.getLibelleType(), item.getDateEmission(), item.getDateExpiration(),
                Boolean.TRUE.equals(item.getEstValide()), item.getJoursAvantExpiration(), item.getEtatEcheance());
    }

    private String state(long days) {
        if (days < 0) return "EXPIRE";
        if (days <= 30) return "A_RENOUVELER_DANS_30_JOURS";
        return "HORS_FENETRE_30_JOURS";
    }
}
