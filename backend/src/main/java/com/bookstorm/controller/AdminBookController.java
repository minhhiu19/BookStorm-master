package com.bookstorm.controller;

import com.bookstorm.dto.book.BookRequest;
import com.bookstorm.dto.book.BookResponse;
import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.service.BookService;
import com.bookstorm.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/admin/books")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminBookController {

    private final BookService bookService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<BookResponse> bookPage = bookService.getAllBooks(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(bookPage)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookResponse>> getBookById(@PathVariable Long id) {
        BookResponse response = bookService.getBookById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookResponse>> createBook(
            @Valid @RequestBody BookRequest request) {
        BookResponse response = bookService.createBook(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookResponse>> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request) {
        BookResponse response = bookService.updateBook(id, request);
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully"));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<BookResponse>> addImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = cloudinaryService.uploadFile(file, "books");
        BookResponse response = bookService.addBookImage(id, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Image added successfully", response));
    }

    @DeleteMapping("/{bookId}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable Long bookId,
            @PathVariable Long imageId) {
        bookService.deleteBookImage(bookId, imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully"));
    }

    @PatchMapping("/{id}/featured")
    public ResponseEntity<ApiResponse<BookResponse>> toggleFeatured(@PathVariable Long id) {
        BookResponse response = bookService.toggleFeatured(id);
        return ResponseEntity.ok(ApiResponse.success("Book featured status toggled", response));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<ApiResponse<BookResponse>> toggleActive(@PathVariable Long id) {
        BookResponse response = bookService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.success("Book active status toggled", response));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<Void>> updateStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        bookService.updateStock(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Book stock updated successfully"));
    }

    private Pageable buildPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1
                ? Sort.Direction.fromString(sortParams[1])
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
    }
}
