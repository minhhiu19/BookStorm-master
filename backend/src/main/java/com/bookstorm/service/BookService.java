package com.bookstorm.service;

import com.bookstorm.dto.book.BookRequest;
import com.bookstorm.dto.book.BookResponse;
import com.bookstorm.dto.book.ImageResponse;
import com.bookstorm.exception.BadRequestException;
import com.bookstorm.exception.ResourceNotFoundException;
import com.bookstorm.model.Book;
import com.bookstorm.model.BookImage;
import com.bookstorm.model.Category;
import com.bookstorm.repository.BookImageRepository;
import com.bookstorm.repository.BookRepository;
import com.bookstorm.repository.CategoryRepository;
import com.bookstorm.repository.ReviewRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BookImageRepository bookImageRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public Page<BookResponse> getAllBooks(Pageable pageable) {
        return bookRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        return toResponse(book);
    }

    @Transactional(readOnly = true)
    public BookResponse getBookBySlug(String slug) {
        Book book = bookRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "slug", slug));
        return toResponse(book);
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getFeaturedBooks() {
        return bookRepository.findByFeaturedTrueAndActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BookResponse> searchBooks(String keyword, Pageable pageable) {
        return bookRepository.search(keyword, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<BookResponse> getBooksByCategory(Long categoryId, Pageable pageable) {
        return bookRepository.findByCategoryIdAndActiveTrue(categoryId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<BookResponse> filterBooks(Long categoryId, String author, String publisher,
                                           Integer publishYear, BigDecimal minPrice,
                                           BigDecimal maxPrice, Pageable pageable) {
        Specification<Book> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("active")));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (author != null && !author.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("author")), "%" + author.toLowerCase() + "%"));
            }

            if (publisher != null && !publisher.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("publisher")), "%" + publisher.toLowerCase() + "%"));
            }

            if (publishYear != null) {
                predicates.add(cb.equal(root.get("publishYear"), publishYear));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return bookRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional
    public BookResponse createBook(BookRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        String slug = generateSlug(request.getName());
        String originalSlug = slug;
        int counter = 1;
        while (bookRepository.findBySlug(slug).isPresent()) {
            slug = originalSlug + "-" + counter;
            counter++;
        }

        Book book = Book.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .category(category)
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .isbn(request.getIsbn())
                .publishYear(request.getPublishYear())
                .pageCount(request.getPageCount())
                .stockQuantity(request.getStockQuantity())
                .basePrice(request.getBasePrice())
                .salePrice(request.getSalePrice())
                .featured(request.isFeatured())
                .active(request.isActive())
                .build();

        Book savedBook = bookRepository.save(book);

        // Save images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                BookImage image = BookImage.builder()
                        .book(savedBook)
                        .imageUrl(request.getImageUrls().get(i))
                        .isPrimary(i == 0)
                        .sortOrder(i)
                        .build();
                bookImageRepository.save(image);
            }
        }

        return toResponse(savedBook);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        if (request.getName() != null) {
            book.setName(request.getName());
            String slug = generateSlug(request.getName());
            String originalSlug = slug;
            int counter = 1;
            while (bookRepository.findBySlug(slug).isPresent() && !slug.equals(book.getSlug())) {
                slug = originalSlug + "-" + counter;
                counter++;
            }
            book.setSlug(slug);
        }
        if (request.getDescription() != null) {
            book.setDescription(request.getDescription());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            book.setCategory(category);
        }
        if (request.getAuthor() != null) {
            book.setAuthor(request.getAuthor());
        }
        if (request.getPublisher() != null) {
            book.setPublisher(request.getPublisher());
        }
        if (request.getIsbn() != null) {
            book.setIsbn(request.getIsbn());
        }
        if (request.getPublishYear() != null) {
            book.setPublishYear(request.getPublishYear());
        }
        if (request.getPageCount() != null) {
            book.setPageCount(request.getPageCount());
        }
        if (request.getStockQuantity() != null) {
            book.setStockQuantity(request.getStockQuantity());
        }
        if (request.getBasePrice() != null) {
            book.setBasePrice(request.getBasePrice());
        }
        if (request.getSalePrice() != null) {
            book.setSalePrice(request.getSalePrice());
        }

        // Update images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            // Remove old images
            book.getImages().clear();
            bookRepository.save(book);

            for (int i = 0; i < request.getImageUrls().size(); i++) {
                BookImage image = BookImage.builder()
                        .book(book)
                        .imageUrl(request.getImageUrls().get(i))
                        .isPrimary(i == 0)
                        .sortOrder(i)
                        .build();
                bookImageRepository.save(image);
            }
        }

        Book savedBook = bookRepository.save(book);
        return toResponse(savedBook);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        book.setActive(false);
        bookRepository.save(book);
    }

    @Transactional
    public BookResponse addBookImage(Long bookId, String imageUrl) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        int nextOrder = book.getImages() != null ? book.getImages().size() : 0;
        boolean isPrimary = nextOrder == 0;

        BookImage image = BookImage.builder()
                .book(book)
                .imageUrl(imageUrl)
                .isPrimary(isPrimary)
                .sortOrder(nextOrder)
                .build();
        bookImageRepository.save(image);

        return toResponse(book);
    }

    @Transactional
    public void deleteBookImage(Long bookId, Long imageId) {
        BookImage image = bookImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("BookImage", "id", imageId));
        if (!image.getBook().getId().equals(bookId)) {
            throw new BadRequestException("Image does not belong to this book");
        }
        bookImageRepository.delete(image);
    }

    @Transactional
    public BookResponse toggleFeatured(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        book.setFeatured(!book.getFeatured());
        bookRepository.save(book);
        return toResponse(book);
    }

    @Transactional
    public BookResponse toggleActive(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        book.setActive(!book.getActive());
        bookRepository.save(book);
        return toResponse(book);
    }

    @Transactional
    public void updateStock(Long id, Integer quantity) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        book.setStockQuantity(quantity);
        bookRepository.save(book);
    }

    public long countActiveBooks() {
        return bookRepository.countByActiveTrue();
    }

    public BookResponse toResponse(Book book) {
        Double avgRating = reviewRepository.getAverageRatingByBookId(book.getId());
        long reviewCount = reviewRepository.countByBookId(book.getId());

        List<ImageResponse> imageResponses = book.getImages() != null
                ? book.getImages().stream().map(img -> ImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .isPrimary(img.getIsPrimary())
                        .sortOrder(img.getSortOrder())
                        .build())
                    .collect(Collectors.toList())
                : Collections.emptyList();

        return BookResponse.builder()
                .id(book.getId())
                .name(book.getName())
                .slug(book.getSlug())
                .description(book.getDescription())
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .isbn(book.getIsbn())
                .publishYear(book.getPublishYear())
                .pageCount(book.getPageCount())
                .stockQuantity(book.getStockQuantity())
                .basePrice(book.getBasePrice())
                .salePrice(book.getSalePrice())
                .featured(book.getFeatured())
                .active(book.getActive())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .reviewCount((int) reviewCount)
                .createdAt(book.getCreatedAt())
                .images(imageResponses)
                .build();
    }

    private String generateSlug(String name) {
        // Normalize Vietnamese characters to ASCII
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        // Remove combining diacritical marks
        String ascii = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        // Handle special Vietnamese characters
        ascii = ascii.replace("\u0111", "d").replace("\u0110", "D");

        return ascii.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
