package com.bookstorm.controller;

import com.bookstorm.dto.book.BookResponse;
import com.bookstorm.dto.common.ApiResponse;
import com.bookstorm.dto.common.PageResponse;
import com.bookstorm.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
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

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<BookResponse>> getBookBySlug(@PathVariable String slug) {
        BookResponse response = bookService.getBookBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getFeaturedBooks() {
        List<BookResponse> response = bookService.getFeaturedBooks();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<BookResponse> bookPage = bookService.searchBooks(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(bookPage)));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getBooksByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<BookResponse> bookPage = bookService.getBooksByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(bookPage)));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> filterBooks(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String publisher,
            @RequestParam(required = false) Integer publishYear,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<BookResponse> bookPage = bookService.filterBooks(
                categoryId, author, publisher, publishYear, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(bookPage)));
    }

    private Pageable buildPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1
                ? Sort.Direction.fromString(sortParams[1])
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
    }
}
