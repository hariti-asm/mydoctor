import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService]
    });
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // --- Scenario 1: Successful Load ---
  it('should load config and return the correct apiUrl from JSON', async () => {
    const mockConfig = { apiUrl: 'https://production-api.mydoctor.com' };

    const loadPromise = service.loadConfig();

    const req = httpMock.expectOne('/assets/config.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);

    await loadPromise;

    expect(service.apiUrl).toBe('https://production-api.mydoctor.com');
  });

  // --- Scenario 2: File Not Found (404) ---
  it('should fallback to localhost if config file is missing (404)', async () => {
    const loadPromise = service.loadConfig();

    const req = httpMock.expectOne('/assets/config.json');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await loadPromise;

    expect(service.apiUrl).toBe('http://localhost:9000');
  });

  // --- Scenario 3: Server Error (500) ---
  it('should fallback to localhost on server error (500)', async () => {
    const loadPromise = service.loadConfig();

    const req = httpMock.expectOne('/assets/config.json');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    await loadPromise;

    expect(service.apiUrl).toBe('http://localhost:9000');
  });

  // --- Scenario 4: Empty config in JSON ---
  it('should fallback to localhost if JSON is empty or missing apiUrl property', async () => {
    const mockConfig = { someOtherProp: 'value' }; // apiUrl is missing

    const loadPromise = service.loadConfig();

    const req = httpMock.expectOne('/assets/config.json');
    req.flush(mockConfig);

    await loadPromise;

    // The current service logic should logically handle this by returning the fallback in the getter
    expect(service.apiUrl).toBe('http://localhost:9000');
  });
});
