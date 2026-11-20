package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.packs.PackClientView;
import com.godtravel.backend.model.dto.packs.PackView;
import com.godtravel.backend.model.entity.Client;
import com.godtravel.backend.model.entity.Pack;
import com.godtravel.backend.model.entity.PackClient;
import com.godtravel.backend.repository.ClientRepository;
import com.godtravel.backend.repository.PackClientRepository;
import com.godtravel.backend.repository.PackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PackService {
    private static final ZoneId ZONE_CAMEROUN = ZoneId.of("Africa/Douala");
    private final PackRepository packRepository;
    private final PackClientRepository packClientRepository;
    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public List<PackView> getPacksDisponibles() {
        return packRepository.findByEstActifTrueOrderByPrixPackXafAsc().stream().map(this::toPackView).toList();
    }

    @Transactional
    public PackClientView souscrire(String idClient, String idPack) {
        Pack pack = packRepository.findById(idPack)
                .orElseThrow(() -> new ResourceNotFoundException("Pack", "id", idPack));
        if (!Boolean.TRUE.equals(pack.getEstActif())) throw new BusinessException("Ce pack n’est plus disponible.");
        if (pack.getNbVoyagesInclus() == null || pack.getNbVoyagesInclus() <= 0 || pack.getDureeValiditeJours() == null || pack.getDureeValiditeJours() <= 0)
            throw new BusinessException("La configuration de ce pack est invalide.");
        Client client = clientRepository.findById(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", idClient));
        LocalDateTime achat = LocalDateTime.now(ZONE_CAMEROUN);
        PackClient souscription = packClientRepository.save(PackClient.builder()
                .idPackClient("PCL-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase())
                .pack(pack).client(client).dateAchat(achat)
                .dateExpiration(achat.toLocalDate().plusDays(pack.getDureeValiditeJours()))
                .voyagesRestants(pack.getNbVoyagesInclus()).estEpuise(false).build());
        return toClientView(souscription);
    }

    @Transactional
    public PackClientView consommerVoyage(String idPackClient) {
        PackClient souscription = packClientRepository.findForUpdate(idPackClient)
                .orElseThrow(() -> new ResourceNotFoundException("Souscription pack", "id", idPackClient));
        if (Boolean.TRUE.equals(souscription.getEstEpuise()) || souscription.getVoyagesRestants() <= 0)
            throw new BusinessException("Ce pack a déjà été entièrement consommé.");
        if (souscription.getDateExpiration().isBefore(LocalDate.now(ZONE_CAMEROUN)))
            throw new BusinessException("La période de validité de ce pack est expirée.");
        souscription.setVoyagesRestants(souscription.getVoyagesRestants() - 1);
        souscription.setEstEpuise(souscription.getVoyagesRestants() == 0);
        return toClientView(packClientRepository.save(souscription));
    }

    @Transactional(readOnly = true)
    public List<PackClientView> getPacksClient(String idClient) {
        return packClientRepository.findByClient_IdClientOrderByDateAchatDesc(idClient).stream().map(this::toClientView).toList();
    }

    private PackView toPackView(Pack pack) {
        return new PackView(pack.getIdPack(), pack.getCodePack(), pack.getLibellePack(), pack.getNbVoyagesInclus(),
                pack.getPrixPackXaf(), pack.getDureeValiditeJours());
    }

    private PackClientView toClientView(PackClient item) {
        Pack pack = item.getPack();
        boolean expired = item.getDateExpiration().isBefore(LocalDate.now(ZONE_CAMEROUN));
        return new PackClientView(item.getIdPackClient(), pack.getCodePack(), pack.getLibellePack(), pack.getNbVoyagesInclus(),
                pack.getPrixPackXaf(), item.getDateAchat(), item.getDateExpiration(), item.getVoyagesRestants(),
                Boolean.TRUE.equals(item.getEstEpuise()), expired);
    }
}
