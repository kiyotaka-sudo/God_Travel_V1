package com.godtravel.backend.security;

import com.godtravel.backend.model.entity.Utilisateur;
import com.godtravel.backend.repository.UtilisateurRepository;
import com.godtravel.backend.repository.CompteClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;
    private final CompteClientRepository compteClientRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username != null && username.startsWith("client:")) {
            String email = username.substring("client:".length());
            var compte = compteClientRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Compte client introuvable."));
            var client = compte.getClient();
            String nom = String.join(" ", java.util.Arrays.asList(client.getPrenom(), client.getNom()).stream()
                    .filter(part -> part != null && !part.isBlank()).toList());
            return new CustomUserDetails(client.getIdClient(), username, compte.getMotDePasseHash(),
                    "CLIENT", null, nom, Boolean.TRUE.equals(compte.getEstActif()));
        }
        Utilisateur user = utilisateurRepository.findByLogin(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec le login : " + username));

        String role = user.getProfil() != null ? user.getProfil().getCodeProfil() : "UTILISATEUR";
        String agenceId = user.getEmploye() != null && user.getEmploye().getAgence() != null 
                ? user.getEmploye().getAgence().getIdAgence() : null;
        String nomComplet = user.getEmploye() != null 
                ? user.getEmploye().getPrenom() + " " + user.getEmploye().getNom() 
                : user.getLogin();

        return new CustomUserDetails(
                user.getIdUtilisateur(),
                user.getLogin(),
                user.getMotDePasseHash(),
                role,
                agenceId,
                nomComplet,
                user.getEstActif()
        );
    }
}

