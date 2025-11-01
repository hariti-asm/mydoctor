package ma.hariti.asmaa.mydoctor.userservice.security;

import ma.hariti.asmaa.mydoctor.userservice.entity.User;
import ma.hariti.asmaa.mydoctor.userservice.exception.UserNotFoundException;
import ma.hariti.asmaa.mydoctor.userservice.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        return new UserDetailsImpl(user);
    }

}
