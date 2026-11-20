package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.fidelite.CompteurFideliteView;
import com.godtravel.backend.model.entity.Client;
import com.godtravel.backend.model.entity.CompteurFidelite;
import com.godtravel.backend.repository.ClientRepository;
import com.godtravel.backend.repository.CompteurFideliteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FideliteService {
    public static final String TYPE_COMPTEUR_DEFAUT = "VIP_SIMPLE";
    private static final int SEUIL_GRATUITE = 10;
    private final CompteurFideliteRepository compteurRepository;
    private final ClientRepository clientRepository;

    @Transactional
    public CompteurFideliteView getCompteurClient(String idClient) {
        return toView(obtenirOuCreer(idClient));
    }

    @Transactional
    public CompteurFideliteView incrementerCompteur(String idClient) {
        CompteurFidelite compteur = obtenirOuCreer(idClient);
        compteur = compteurRepository.findForUpdate(idClient, TYPE_COMPTEUR_DEFAUT).orElse(compteur);
        int nouveauTotal = compteur.getBilletsCumules() + 1;
        if (nouveauTotal >= SEUIL_GRATUITE) {
            compteur.setBilletsCumules(0);
            compteur.setGratuitsAcquis(compteur.getGratuitsAcquis() + 1);
        } else {
            compteur.setBilletsCumules(nouveauTotal);
        }
        return toView(compteurRepository.save(compteur));
    }

    @Transactional
    public CompteurFideliteView utiliserGratuit(String idClient) {
        CompteurFidelite compteur = obtenirOuCreer(idClient);
        compteur = compteurRepository.findForUpdate(idClient, TYPE_COMPTEUR_DEFAUT).orElse(compteur);
        int solde = compteur.getGratuitsAcquis() - compteur.getGratuitsUtilises();
        if (solde <= 0) throw new BusinessException("Aucun billet gratuit n’est disponible sur ce compte.");
        compteur.setGratuitsUtilises(compteur.getGratuitsUtilises() + 1);
        return toView(compteurRepository.save(compteur));
    }

    private CompteurFidelite obtenirOuCreer(String idClient) {
        var existing = compteurRepository.findByClient_IdClientAndTypeBilletCumule(idClient, TYPE_COMPTEUR_DEFAUT);
        if (existing.isPresent()) return existing.get();
        Client client = clientRepository.findForFidelityUpdate(idClient)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", idClient));
        return compteurRepository.findByClient_IdClientAndTypeBilletCumule(idClient, TYPE_COMPTEUR_DEFAUT)
                .orElseGet(() -> compteurRepository.save(CompteurFidelite.builder()
                        .idCompteur("FID-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase())
                        .client(client).typeBilletCumule(TYPE_COMPTEUR_DEFAUT)
                        .billetsCumules(0).gratuitsAcquis(0).gratuitsUtilises(0).build()));
    }

    private CompteurFideliteView toView(CompteurFidelite compteur) {
        int solde = compteur.getGratuitsAcquis() - compteur.getGratuitsUtilises();
        int cumules = compteur.getBilletsCumules();
        return new CompteurFideliteView(compteur.getClient().getIdClient(), compteur.getTypeBilletCumule(),
                cumules, SEUIL_GRATUITE - cumules, compteur.getGratuitsAcquis(), compteur.getGratuitsUtilises(), solde);
    }
}
