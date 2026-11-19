package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.model.dto.auth.AuthResponse;
import com.godtravel.backend.model.dto.auth.LoginRequest;
import com.godtravel.backend.model.entity.Utilisateur;
import com.godtravel.backend.model.entity.Client;
import com.godtravel.backend.model.entity.CompteClient;
import com.godtravel.backend.model.dto.auth.ClientRegisterRequest;
import com.godtravel.backend.repository.ClientRepository;
import com.godtravel.backend.repository.CompteClientRepository;
import com.godtravel.backend.repository.UtilisateurRepository;
import com.godtravel.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtUtil jwtUtil;
    private final ClientRepository clientRepository;
    private final CompteClientRepository compteClientRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse inscrireClient(ClientRegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);
        if (compteClientRepository.findByEmailIgnoreCase(email).isPresent())
            throw new BusinessException("Cette adresse e-mail possède déjà un compte client.");
        String telephone = request.getTelephone().replaceAll("\\D", "");
        if (telephone.startsWith("237")) telephone = telephone.substring(3);
        if (!telephone.matches("6\\d{8}"))
            throw new BusinessException("Saisissez un numéro mobile camerounais valide à 9 chiffres.");

        List<Client> clientsCorrespondants = clientRepository.findByTelephoneDigits(telephone);
        if (clientsCorrespondants.size() > 1)
            throw new BusinessException("Ce numéro correspond à plusieurs profils. Contactez l’agence pour sécuriser votre compte.");

        Client client;
        if (!clientsCorrespondants.isEmpty()) {
            client = clientsCorrespondants.get(0);
            if (client.getEmail() == null || client.getEmail().isBlank())
                throw new BusinessException("Ce numéro est déjà associé à un profil sans adresse e-mail. Contactez l’agence pour sécuriser le rattachement.");
            if (!client.getEmail().equalsIgnoreCase(email))
                throw new BusinessException("Ce numéro est déjà associé à un profil client. Utilisez l’adresse e-mail enregistrée ou contactez l’agence.");
        } else {
            if (clientRepository.findByEmailIgnoreCase(email).isPresent())
                throw new BusinessException("Cette adresse e-mail est déjà associée à un profil client. Connectez-vous ou contactez l’agence.");
            String id = "CLI-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
            client = clientRepository.saveAndFlush(Client.builder().idClient(id).nom(request.getNom().trim())
                    .prenom(request.getPrenom().trim()).telephone(telephone).email(email).build());
        }

        CompteClient compte = compteClientRepository.saveAndFlush(CompteClient.builder().idClient(client.getIdClient()).client(client)
                .email(email).motDePasseHash(passwordEncoder.encode(request.getPassword())).estActif(true).build());
        return reponseClient(compte);
    }

    @Transactional
    public AuthResponse loginClient(LoginRequest request) {
        String email = request.getLogin().trim().toLowerCase(java.util.Locale.ROOT);
        var optCompte = compteClientRepository.findByEmailIgnoreCase(email);
        if (optCompte.isPresent()) {
            CompteClient compte = optCompte.get();
            if (!Boolean.TRUE.equals(compte.getEstActif()) || !passwordEncoder.matches(request.getPassword(), compte.getMotDePasseHash()))
                throw new BusinessException("Adresse e-mail ou mot de passe incorrect.");
            return reponseClient(compte);
        }
        if (utilisateurRepository.findByLogin(email).isPresent()) {
            return login(request);
        }
        throw new BusinessException("Adresse e-mail ou mot de passe incorrect.");
    }

    private AuthResponse reponseClient(CompteClient compte) {
        Client c = compte.getClient();
        if (c == null) {
            c = clientRepository.findById(compte.getIdClient())
                    .orElseThrow(() -> new BusinessException("Profil client introuvable."));
        }
        String nomComplet = String.join(" ", java.util.Arrays.asList(c.getPrenom(), c.getNom()).stream()
                .filter(part -> part != null && !part.isBlank()).toList());
        String subject = "client:" + compte.getEmail().toLowerCase(java.util.Locale.ROOT);
        String token = jwtUtil.generateToken(subject, "CLIENT", Map.of("userId", c.getIdClient(), "nomComplet", nomComplet));
        return AuthResponse.builder().token(token).type("Bearer").idUtilisateur(c.getIdClient())
                .login(compte.getEmail()).nomComplet(nomComplet).role("CLIENT").telephone(c.getTelephone()).build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String login = request.getLogin().trim().toLowerCase(java.util.Locale.ROOT);
        if (utilisateurRepository.findByLogin(login).isPresent()) {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(login, request.getPassword())
            );

            Utilisateur user = utilisateurRepository.findByLogin(login)
                    .orElseThrow(() -> new BusinessException("Utilisateur non trouvé."));

            if (!user.getEstActif()) {
                throw new BusinessException("Ce compte utilisateur est désactivé.");
            }

            // Mettre à jour la date de dernière connexion et réinitialiser les échecs
            user.setDerniereConnexion(LocalDateTime.now());
            user.setTentativesEchec(0);
            utilisateurRepository.save(user);

            String role = user.getProfil() != null ? user.getProfil().getCodeProfil() : "UTILISATEUR";
            String agenceId = user.getEmploye() != null && user.getEmploye().getAgence() != null 
                    ? user.getEmploye().getAgence().getIdAgence() : null;
            String nomAgence = user.getEmploye() != null && user.getEmploye().getAgence() != null 
                    ? user.getEmploye().getAgence().getNomAgence() : null;
            String nomComplet = user.getEmploye() != null 
                    ? user.getEmploye().getPrenom() + " " + user.getEmploye().getNom() 
                    : user.getLogin();

            Map<String, Object> extra = new HashMap<>();
            extra.put("userId", user.getIdUtilisateur());
            extra.put("agenceId", agenceId);
            extra.put("nomComplet", nomComplet);

            String token = jwtUtil.generateToken(user.getLogin(), role, extra);

            return AuthResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .idUtilisateur(user.getIdUtilisateur())
                    .login(user.getLogin())
                    .nomComplet(nomComplet)
                    .role(role)
                    .idAgence(agenceId)
                    .nomAgence(nomAgence)
                    .build();
        }

        var optCompte = compteClientRepository.findByEmailIgnoreCase(login);
        if (optCompte.isPresent()) {
            CompteClient compte = optCompte.get();
            if (!Boolean.TRUE.equals(compte.getEstActif()) || !passwordEncoder.matches(request.getPassword(), compte.getMotDePasseHash()))
                throw new BusinessException("Identifiant ou mot de passe incorrect.");
            return reponseClient(compte);
        }

        throw new BusinessException("Identifiant ou mot de passe incorrect.");
    }

    public AuthResponse getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new BusinessException("Aucun utilisateur authentifié.");
        }

        String login = auth.getName();
        if (login != null && login.startsWith("client:")) {
            CompteClient compte = compteClientRepository.findByEmailIgnoreCase(login.substring("client:".length()))
                    .orElseThrow(() -> new BusinessException("Compte client introuvable."));
            Client client = compte.getClient();
            if (client == null) {
                client = clientRepository.findById(compte.getIdClient())
                        .orElseThrow(() -> new BusinessException("Profil client introuvable."));
            }
            String nom = String.join(" ", java.util.Arrays.asList(client.getPrenom(), client.getNom()).stream()
                    .filter(part -> part != null && !part.isBlank()).toList());
            return AuthResponse.builder().idUtilisateur(client.getIdClient()).login(compte.getEmail())
                    .nomComplet(nom).role("CLIENT").telephone(client.getTelephone()).build();
        }
        Utilisateur user = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new BusinessException("Utilisateur non trouvé."));

        String role = user.getProfil() != null ? user.getProfil().getCodeProfil() : "UTILISATEUR";
        String agenceId = user.getEmploye() != null && user.getEmploye().getAgence() != null 
                ? user.getEmploye().getAgence().getIdAgence() : null;
        String nomAgence = user.getEmploye() != null && user.getEmploye().getAgence() != null 
                ? user.getEmploye().getAgence().getNomAgence() : null;
        String nomComplet = user.getEmploye() != null 
                ? user.getEmploye().getPrenom() + " " + user.getEmploye().getNom() 
                : user.getLogin();

        return AuthResponse.builder()
                .idUtilisateur(user.getIdUtilisateur())
                .login(user.getLogin())
                .nomComplet(nomComplet)
                .role(role)
                .idAgence(agenceId)
                .nomAgence(nomAgence)
                .build();
    }
}

