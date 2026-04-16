package ma.hariti.asmaa.mydoctor.userservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import jakarta.annotation.PostConstruct;

@Slf4j
@Configuration("databasePreFlightFixer")
public class DatabasePreFlightFixer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixSequence() {
        log.info("[Pre-Flight] Checking and correcting user_sequence...");
        try {
            // Create the sequence with a start value of 2000 if it doesn't exist
            jdbcTemplate.execute(
                "DO $$ BEGIN " +
                "  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'user_sequence') THEN " +
                "    CREATE SEQUENCE user_sequence START 2000; " +
                "  END IF; " +
                "END $$;"
            );
            // Always advance the sequence to at least 2000
            jdbcTemplate.execute("SELECT setval('user_sequence', GREATEST(2000, nextval('user_sequence') - 1), true)");
            log.info("[Pre-Flight] user_sequence is set to start at 2000+. All clear.");
        } catch (Exception e) {
            log.error("[Pre-Flight] Could not fix user_sequence: {}", e.getMessage());
        }
    }
}
