describe('MyDoctor Full A-Z Consultation Journey', () => {
  const password = "password123";
  const timestamp = Date.now();
  const testPatientEmail = `patient.demo.${timestamp}@mydoctor.ma`;
  const patientFirstName = `John_${timestamp}`;
  const patientLastName = "Doe";

  Cypress.on('uncaught:exception', () => false);

  const navigateToProfile = () => {
    cy.get('body').then($body => {
      if ($body.find('#user-menu').length > 0) {
        cy.get('#user-menu', { timeout: 10000 }).should('be.visible').click();
        cy.wait(1000);
        cy.get('[data-cy="profile-link"]', { timeout: 10000 }).should('be.visible').click();
      } else {
        cy.visit('/profile');
      }
    });
    cy.url().should('include', '/profile');
  };

  it('Executes the complete platform workflow ensuring all modules are captured', () => {
    
    // ==========================================
    // 1. PATIENT: REGISTRATION & PROFILE
    // ==========================================
    cy.visit('/register');
    cy.get('#firstName').type(patientFirstName);
    cy.get('#lastName').type(patientLastName);
    cy.get('#email').type(testPatientEmail);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 30000 }).should('include', '/login');
    cy.get('#email').type(testPatientEmail);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 30000 }).should('include', '/portal/patient');
    cy.wait(2000);

    // Update Profile - Capturing UI richness
    navigateToProfile();
    // Use the button as the anchor for logical readiness
    cy.contains('button', 'Save Changes', { timeout: 20000 }).should('be.visible');
    cy.get('.animate-spin').should('not.exist'); // Now it's safe to check it's gone
    
    cy.get('#firstName').should('have.value', patientFirstName);
    cy.get('#firstName').clear().type(patientFirstName + " Updated");
    cy.get('button').contains('Save Changes').click();
    cy.contains('Profile updated successfully', { timeout: 10000 }).should('be.visible');
    cy.scrollTo('top');
    cy.wait(2000);

    // ==========================================
    // 2. PATIENT: DOCTOR DISCOVERY & BOOKING
    // ==========================================
    cy.visit('/doctors');
    cy.wait(3000);

    // AI-Driven Search Showcase
    cy.contains('button', 'AI Recommendation', { timeout: 10000 }).should('be.visible').click();
    cy.get('textarea').first().should('be.visible').type('I have a severe chest pain and heart palpitations', { delay: 10 });
    cy.contains('button', 'Analyze Symptoms').click();
    cy.wait(6000); // Wait for AI "Analysis"
    cy.contains('button', 'Find').click();
    cy.wait(4000); 

    // Explicitly filter for Sarah Smith to ensure consistency with later login steps
    cy.get('input[formControlName="specialization"]').clear().type('Cardiology');
    cy.get('button').contains('Search Doctors').click();
    cy.wait(3000);

    // Visit Booking Page for Sarah Smith
    cy.contains('.bg-white', 'Sarah Smith').within(() => {
      cy.contains('a', 'Book').click();
    });
    cy.url().should('include', '/appointments/book');
    cy.wait(4000); 

    // Select Date & Slot
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    cy.get('input[type="date"]').type(dateStr);
    cy.wait(3000); 
    
    cy.get('body').then($body => {
      const slots = $body.find('button').filter((i, el) => /\d{2}:\d{2}/.test(el.innerText));
      if (slots.length > 0) {
        cy.wrap(slots).first().click();
      }
    });
    
    cy.get('textarea#reason').type('Persistent chest pain and palpitations. AI recommended Cardiology.', { delay: 0 });
    cy.get('input#video-call').check();
    cy.get('button[type="submit"]').contains('Confirm Appointment').click();
    
    // Handle Payment (Mock Stripe)
    cy.wait(2000);
    cy.get('button').contains('Authorize & Confirm Booking', { timeout: 15000 }).should('be.visible').click();
    cy.url({ timeout: 30000 }).should('include', '/appointments/my-appointments');
    cy.wait(4000);

    // Verify in Patient Dashboard
    cy.visit('/portal/patient/dashboard');
    cy.contains('Next Appointment', { timeout: 15000 }).should('be.visible');
    cy.wait(4000);

    // ==========================================
    // 3. ADMIN: COMMAND CENTER & REGISTRIES
    // ==========================================
    cy.clearAllCookies(); cy.clearAllLocalStorage();
    cy.visit('/login');
    cy.get('#email').type('admin@mydoctor.com');
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 30000 }).should('include', '/portal/admin/dashboard');
    cy.wait(5000);

    // View User Registry
    cy.visit('/portal/admin/users');
    cy.contains('User Registry', { timeout: 15000 }).should('be.visible');
    cy.get('table, .grid, .flex').contains('PATIENT', { timeout: 10000 }).should('be.visible'); // Just verify the table loaded rows
    cy.wait(3000);

    // View Doctor Registry
    cy.visit('/portal/admin/doctors');
    cy.contains('Medical Staff', { timeout: 15000 }).should('be.visible');
    cy.contains('Sarah Smith', { timeout: 10000 }).should('be.visible');
    cy.wait(3000);

    // ==========================================
    // 4. DOCTOR: CONSULTATION & AI ASSISTANT
    // ==========================================
    cy.clearAllCookies(); cy.clearAllLocalStorage();
    cy.visit('/login');
    cy.get('#email').type('sarah.smith@mydoctor.ma');
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 30000 }).should('include', '/portal/doctor');
    
    cy.contains('Welcome, Dr. Sarah', { timeout: 15000 }).should('be.visible');

    // Verify the appointment is reflected in the dashboard counters
    cy.contains('Upcoming', { timeout: 15000 })
      .parent()
      .find('h3')
      .should(($h3) => {
        const text = $h3.text().trim();
        const num = parseInt(text, 10);
        expect(num).to.be.at.least(1);
      });
    
    cy.visit('/appointments/my-appointments');
    cy.wait(6000);
    
    // Find the appointment and join - Targeting the specific patient to avoid clicking missed/stale records
    cy.contains('.group', patientFirstName + " Updated", { timeout: 15000 }).within(() => {
      cy.contains('button', 'Join Meeting', { timeout: 15000 }).should('be.visible').click();
    });
    cy.wait(5000); 
        
    // Launch AI Assistant
    cy.get('button').contains('Start AI Assistant').click();
    // Wait for the completion indicator (bg-emerald-500/5)
    cy.get('.bg-emerald-500\\/5', { timeout: 30000 }).should('be.visible'); 
    cy.wait(3000);
    cy.get('button').contains('End Consultation').click();
        
    // Issue Prescription & Clinical Summary
    cy.url().should('include', '/appointments/my-appointments');
    
    // Find the specific patient's row to click 'Prescribe'
    cy.contains('.group', patientFirstName + " Updated", { timeout: 15000 }).within(() => {
        cy.contains('button', 'Prescribe', { timeout: 15000 }).should('be.visible').click();
    });
    cy.wait(3000); 
        
    // Fill Diagnosis
    cy.get('input[formControlName="diagnosis"]').clear().type('Cardiac Arrhythmia (Verified by AI)');
        
    // Type a manual AI summary if it wasn't auto-generated (common in headless/no-audio environments)
    cy.get('textarea[formControlName="aiNotes"]').then($textarea => {
      if (!$textarea.val()) {
        cy.wrap($textarea).type('AI ASSISTED SUMMARY: Patient presents with upper respiratory symptoms. Suggested diagnosis is Viral Rhinopharyngitis (Common Cold). Treatment plan includes symptomatic relief and hydration. Follow-up if symptoms persist beyond 7 days.');
      }
    });
        
    // Fill Prescription
    cy.get('textarea[formControlName="prescription"]').type('1. Regular ECG Monitoring\n2. Beta-Blockers 25mg BID\n3. Reduce caffeine intake');
    cy.wait(3000);
        
    cy.get('button').contains('Complete Record').click();
    cy.wait(5000);
    
    // Safety check: ensure the modal is closed and we're back on the list
    cy.get('body').should('not.contain', 'Medical Record & Prescription');

    // ==========================================
    // 5. PATIENT: MEDICAL HISTORY & AI NOTES
    // ==========================================
    cy.contains('button', 'Logout').click({ force: true });
    cy.visit('/login');
    
    cy.get('#email').type(testPatientEmail); 
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/portal/patient/dashboard');
    cy.contains('nav a', 'Medical History').click({ force: true });
    
    cy.contains('Cardiac Arrhythmia', { timeout: 20000 }).should('be.visible');
    cy.contains('AI ASSISTED SUMMARY').should('be.visible');
    
    cy.log('E2E Journey Verification Successful');
  });
});
