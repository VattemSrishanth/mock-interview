package com.intervai.service;

import com.intervai.dto.AuthRequest;
import com.intervai.dto.AuthResponse;
import com.intervai.dto.RegisterRequest;
import com.intervai.entity.Role;
import com.intervai.entity.RoleName;
import com.intervai.entity.Skill;
import com.intervai.entity.User;
import com.intervai.exception.BadRequestException;
import com.intervai.repository.RoleRepository;
import com.intervai.repository.SkillRepository;
import com.intervai.repository.UserRepository;
import com.intervai.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists");
        }

        Role studentRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_STUDENT).build()));

        Set<Role> roles = new HashSet<>();
        roles.add(studentRole);

        Set<Skill> skills = new HashSet<>();
        if (request.getSkills() != null) {
            for (String skillName : request.getSkills()) {
                Skill skill = skillRepository.findByNameIgnoreCase(skillName.trim())
                        .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName.trim()).category("General").build()));
                skills.add(skill);
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .targetRole(request.getTargetRole() != null ? request.getTargetRole() : "Software Engineer")
                .experience(request.getExperience() != null ? request.getExperience() : "Fresher")
                .careerGoal(request.getCareerGoal() != null ? request.getCareerGoal() : "Crack tech interviews")
                .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + request.getName().replaceAll("\\s+", ""))
                .roles(roles)
                .skills(skills)
                .interviewStreak(1)
                .build();

        User savedUser = userRepository.save(user);

        // Authenticate immediately upon registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return buildAuthResponse(savedUser, jwt);
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return buildAuthResponse(user, jwt);
    }

    private AuthResponse buildAuthResponse(User user, String jwt) {
        List<String> roleNames = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(roleNames)
                .targetRole(user.getTargetRole())
                .experience(user.getExperience())
                .careerGoal(user.getCareerGoal())
                .avatarUrl(user.getAvatarUrl())
                .interviewStreak(user.getInterviewStreak() != null ? user.getInterviewStreak() : 1)
                .build();
    }
}
