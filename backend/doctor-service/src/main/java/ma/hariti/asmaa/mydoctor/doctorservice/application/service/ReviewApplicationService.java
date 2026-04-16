package ma.hariti.asmaa.mydoctor.doctorservice.application.service;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Review;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.entity.ReviewEntity;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewApplicationService {

    private final ReviewRepository reviewRepository;

    public List<Review> getReviewsByDoctorId(Long doctorId) {
        return reviewRepository.findByDoctorId(doctorId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    public Review addReview(Long doctorId, Review review) {
        review.setDoctorId(doctorId);
        ReviewEntity entity = toEntity(review);
        ReviewEntity saved = reviewRepository.save(entity);
        return toDomain(saved);
    }

    private Review toDomain(ReviewEntity entity) {
        if (entity == null) return null;
        return Review.builder()
                .id(entity.getId())
                .doctorId(entity.getDoctorId())
                .author(entity.getAuthor())
                .rating(entity.getRating())
                .date(entity.getDate())
                .text(entity.getText())
                .build();
    }

    private ReviewEntity toEntity(Review domain) {
        if (domain == null) return null;
        return ReviewEntity.builder()
                .id(domain.getId())
                .doctorId(domain.getDoctorId())
                .author(domain.getAuthor())
                .rating(domain.getRating())
                .date(domain.getDate())
                .text(domain.getText())
                .build();
    }
}
