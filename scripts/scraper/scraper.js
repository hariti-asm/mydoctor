const cheerio = require('cheerio');

const BASE_URL = 'https://www.cromc.ma/recherche/';
const IMPORT_API = 'http://localhost:9000/api/v1/doctors/import/bulk';

async function scrapePage(pageNumber) {
    const url = `${BASE_URL}?page=${pageNumber}`;
    console.log(`Scraping page ${pageNumber}...`);
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.text();
        const $ = cheerio.load(data);
        const doctors = [];

        $('.cn-entry').each((i, el) => {
            let firstName = $(el).find('.given-name').text().trim();
            let lastName = $(el).find('.family-name').text().trim();
            const specialityText = $(el).find('span.title').text().trim();
            const speciality = specialityText.replace('Spécialité :', '').trim();
            const city = $(el).find('.address-block .locality').text().trim();
            const workplace = $(el).find('.address-block .region').text().trim();

            firstName = firstName.replace(/^Docteur\s*:\s*/i, '').trim();
            lastName = lastName.replace(/^Docteur\s*:\s*/i, '').trim();

            if (firstName && lastName) {
                const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
                
                doctors.push({
                    firstName,
                    lastName,
                    speciality: speciality || 'Généraliste',
                    city: city || 'Casablanca',
                    address: workplace || 'Maroc',
                    email: `${cleanFirst}.${cleanLast}@mydoctor.ma`,
                    phoneNumber: '05' + (Math.floor(Math.random() * 90000000) + 10000000),
                    consultationFee: 200.0,
                    bio: `Médecin spécialiste à ${city || 'Casablanca'}.`
                });
            }
        });

        return doctors;
    } catch (error) {
        console.error(`Error scraping page ${pageNumber}:`, error.message);
        return [];
    }
}

async function runScraper(pages) {
    let allDoctors = [];
    for (let i = 1; i <= pages; i++) {
        console.log(`Scraping page ${i}...`);
        const doctors = await scrapePage(i);
        allDoctors = allDoctors.concat(doctors);
    }

    console.log(`Total doctors scraped: ${allDoctors.length}. Sending bulk...`);
    
    try {
        const response = await fetch(IMPORT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allDoctors)
        });

        if (response.ok) {
            console.log(`Bulk import successful! ${allDoctors.length} doctors imported.`);
        } else {
            const err = await response.text();
            console.error('Failed to send data to backend: HTTP error!', response.status, err);
        }
    } catch (error) {
        console.error('Error sending data to backend:', error);
    }
}

(async () => {
    await runScraper(5);
})();
