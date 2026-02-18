# myDoctor

Full-stack telemedicine platform with Angular micro-frontends and Spring Boot microservices, deployed to AWS EKS with Terraform.

## Features & Implementation

- **Role-based portals**: Patient, Doctor, and Admin portals with JWT authentication and profile management.
- **Doctor Search**: Search functionality with AI-driven symptom-to-specialist suggestions.
- **Video Consultations**: Integrated WebRTC and STOMP/SockJS for real-time video calls with recording support.
- **Prescription Management**: Digital prescription generation with automated email delivery to patients.
- **Medical Records**: Automated document pipeline using S3, SQS, and Amazon Transcribe for AI-driven transcription and attachment handling.
- **Payments**: Stripe integration for appointment billing and payment processing.
- **Microservices Architecture**: Distributed system using Spring Cloud Gateway, Eureka discovery, and Kafka for asynchronous event processing.

## Technical Stack

- **Backend:** Java 21, Spring Boot 3.5.6, Spring Security JWT, Spring Cloud Gateway, Netflix Eureka, Spring Kafka, PostgreSQL, Stripe SDK, AWS SDK (S3, SQS, Transcribe).
- **Frontend:** Angular 18/19 (Nx workspace), TailwindCSS, Module Federation (MFE), STOMP/SockJS, WebRTC.
- **Infra/DevOps:** Docker, Kubernetes (EKS), Terraform (AWS VPC + EKS), GitHub Actions CI/CD to ECR/EKS, AWS (S3, SQS, Transcribe, KMS, CloudWatch).

## Design Patterns

### Architectural Patterns

- **Hexagonal Architecture (Ports & Adapters)**: Each microservice is structured following Hexagonal principles, separating the core business logic (**Domain**) from technical implementation details (**Infrastructure**) and entry points (**Web**). This ensures the business logic remains decoupled and easily testable.
- **Domain-Driven Design (DDD)**: The project follows DDD principles, emphasizing a rich domain model and clear bounded contexts for each microservice.
- **Microservices Architecture**: The system is decomposed into small, independent services (User, Appointment, Medical Record, etc.) that communicate over network protocols.
- **API Gateway Pattern**: A single entry point (Spring Cloud Gateway) handles routing, security, and cross-cutting concerns for all backend services.
- **Service Discovery**: Netflix Eureka is used for dynamic service registration and discovery, enabling horizontal scalability.
- **Database per Service**: Each microservice manages its own PostgreSQL instance, ensuring loose coupling and data encapsulation.
- **Event-Driven Architecture**: Asynchronous communication between services (e.g., Appointment to Notification) is handled via **Apache Kafka** (Pub/Sub).
- **Micro-Frontends (MFE)**: The frontend is split into independent apps using **Webpack Module Federation**, allowing for modular development and deployment.

### Backend Design Patterns

- **Layered (N-Tier) Architecture**: Traditional separation of concerns into Controller, Service, and Repository layers.
- **Dependency Injection**: Core Spring pattern used for decoupling object creation from usage.
- **Data Transfer Object (DTO)**: Used to transfer data between layers and across service boundaries without exposing internal entities.
- **Builder Pattern**: Extensively used (via Lombok) for creating complex domain objects and entities with a clear, fluent API.
- **Repository Pattern**: Abstracts data persistence logic using Spring Data JPA.

### Frontend Application Patterns

- **Observer Pattern**: Heavy use of **RxJS** Observables to handle asynchronous data streams and event-driven UI updates.
- **Component-Based Architecture**: Standard Angular approach to building reusable, encapsulated UI elements.
- **Singleton Pattern**: Angular services are provided at the root level, ensuring unique instances for shared logic and state.

## Architecture and Data Model

The following diagram illustrates the core entities and their relationships.

```mermaid
classDiagram
    class User {
        +Long id
        +String name
        +String email
        +String password
        +Role role
    }

    class Patient {
        +Long id
        +String dateOfBirth
    }

    class Doctor {
        +Long id
        +String speciality
        +Double consultationFee
    }

    class Appointment {
        +Long id
        +Long doctorId
        +Long patientId
        +LocalDateTime startDateTime
        +String status
    }

    class MedicalRecord {
        +Long id
        +Long appointmentId
        +String diagnosis
        +String recordingUrl
    }

    class Prescription {
        +String medications
        +String dosage
    }

    class MedicalCertificate {
        +String fileUrl
        +LocalDateTime issuedAt
    }

    class Payment {
        +Long id
        +Long appointmentId
        +Double amount
        +String status
    }

    User <|-- Patient
    User <|-- Doctor
    User "1" -- "*" Appointment : has
    Patient "1" -- "*" Appointment : schedules
    Doctor "1" -- "*" Appointment : attends
    Appointment "1" -- "1" MedicalRecord : generates
    MedicalRecord "1" -- "1" Prescription : contains
    MedicalRecord "1" -- "*" MedicalCertificate : includes
    Appointment "1" -- "0..1" Payment : requires
```

## Project Structure

- `backend/`: Spring Boot microservices.
- `mydoctor-mfe/`: Angular micro-frontend workspace (Nx).
- `k8s/`: Kubernetes manifest files.
- `terraform/`: Infrastructure as Code for AWS.

## Getting Started

### Local Development

1. Clone the repository.
2. Run `docker-compose up -d` for infrastructure (Postgres, Kafka).
3. Run services via `./start-services.sh`.
4. Run frontend via `nx serve shell` in `mydoctor-mfe`.

### Kubernetes (EKS)

1. Update kubeconfig: `aws eks update-kubeconfig --region us-east-1 --name mydoctor-cluster`
2. Apply manifests: `kubectl apply -f k8s/`
