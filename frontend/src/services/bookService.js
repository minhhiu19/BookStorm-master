import api from './api';

const bookService = {
    getBooks: (page = 0, size = 12, sort = 'createdAt,desc') => {
        return api.get(`/books?page=${page}&size=${size}&sort=${sort}`);
    },
    getBookById: (id) => {
        return api.get(`/books/${id}`);
    },
    getBookBySlug: (slug) => {
        return api.get(`/books/slug/${slug}`);
    },
    getFeaturedBooks: () => {
        return api.get('/books/featured');
    },
    searchBooks: (keyword, page = 0, size = 12) => {
        return api.get(`/books/search?keyword=${keyword}&page=${page}&size=${size}`);
    },
    getBooksByCategory: (categoryId, page = 0, size = 12) => {
        return api.get(`/books/category/${categoryId}?page=${page}&size=${size}`);
    },
    filterBooks: (filters, page = 0, size = 12, sort = 'createdAt,desc') => {
        const params = new URLSearchParams();
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.author) params.append('author', filters.author);
        if (filters.publisher) params.append('publisher', filters.publisher);
        if (filters.publishYear) params.append('publishYear', filters.publishYear);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        params.append('page', page);
        params.append('size', size);
        params.append('sort', sort);
        return api.get(`/books/filter?${params.toString()}`);
    }
};

export default bookService;
