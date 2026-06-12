package com.bookstorm.config;

import com.bookstorm.model.*;
import com.bookstorm.repository.*;
import com.bookstorm.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seeder.enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final BookImageRepository bookImageRepository;
    private final BannerRepository bannerRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final AddressRepository addressRepository;
    private final WishlistRepository wishlistRepository;
    private final ShippingRepository shippingRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    // Saved entities for cross-references
    private final List<User> customers = new ArrayList<>();
    private final List<Book> allBooks = new ArrayList<>();
    private final List<Order> allOrders = new ArrayList<>();

    // Book cover image URLs
    private static final Map<String, String[]> BOOK_IMAGES = new LinkedHashMap<>();
    private static final Map<String, String> CATEGORY_IMAGES = new LinkedHashMap<>();
    private static final String[] BANNER_IMAGES = {
            "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&h=600&fit=crop",
            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&h=600&fit=crop",
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=600&fit=crop",
            "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1920&h=600&fit=crop"
    };

    static {
        // Category thumbnails
        CATEGORY_IMAGES.put("van-hoc", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop");
        CATEGORY_IMAGES.put("kinh-te", "https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?w=400&h=400&fit=crop");
        CATEGORY_IMAGES.put("ky-nang-song", "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=400&fit=crop");
        CATEGORY_IMAGES.put("khoa-hoc", "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop");
        CATEGORY_IMAGES.put("thieu-nhi", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop");
        CATEGORY_IMAGES.put("nghe-thuat", "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop");
        CATEGORY_IMAGES.put("cong-nghe", "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400&h=400&fit=crop");

        // Book images
        BOOK_IMAGES.put("nha-gia-kim", new String[]{
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1000&fit=crop"
        });
        BOOK_IMAGES.put("cho-toi-xin-mot-ve-di-tuoi-tho", new String[]{
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=1000&fit=crop"
        });
        BOOK_IMAGES.put("tu-duy-nhanh-va-cham", new String[]{
                "https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=1000&fit=crop"
        });
        BOOK_IMAGES.put("sapiens-luoc-su-loai-nguoi", new String[]{
                "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&h=1000&fit=crop"
        });
        BOOK_IMAGES.put("dac-nhan-tam", new String[]{
                "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=1000&fit=crop"
        });
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping data seeder.");
            return;
        }

        log.info("========== Starting database seeding ==========");
        long startTime = System.currentTimeMillis();

        seedUsers();
        seedAddresses();
        seedCategories();
        seedBooks();
        seedBanners();
        seedCoupons();
        seedOrders();
        seedReviews();
        seedNotifications();
        seedWishlists();

        long elapsed = System.currentTimeMillis() - startTime;
        log.info("========== Database seeding completed in {}ms ==========", elapsed);
    }

    // ==================== USERS ====================

    private void seedUsers() {
        log.info("Seeding users...");
        String encodedPassword = passwordEncoder.encode("password123");

        List<User> users = List.of(
                User.builder().fullName("Nguy\u1EC5n V\u0103n Admin").email("admin@bookstorm.com")
                        .password(encodedPassword).phone("0901000001").role(Role.ADMIN).enabled(true).build(),
                User.builder().fullName("Tr\u1EA7n Th\u1ECB Staff").email("staff@bookstorm.com")
                        .password(encodedPassword).phone("0901000002").role(Role.STAFF).enabled(true).build(),
                User.builder().fullName("L\u00EA V\u0103n Nh\u00E2n").email("staff2@bookstorm.com")
                        .password(encodedPassword).phone("0901000003").role(Role.STAFF).enabled(true).build(),
                User.builder().fullName("Ph\u1EA1m Th\u1ECB Mai").email("mai@gmail.com")
                        .password(encodedPassword).phone("0912345678").role(Role.CUSTOMER).enabled(true).build(),
                User.builder().fullName("Ho\u00E0ng V\u0103n \u0110\u1EE9c").email("duc@gmail.com")
                        .password(encodedPassword).phone("0923456789").role(Role.CUSTOMER).enabled(true).build(),
                User.builder().fullName("Nguy\u1EC5n Th\u1ECB Lan").email("lan@gmail.com")
                        .password(encodedPassword).phone("0934567890").role(Role.CUSTOMER).enabled(true).build(),
                User.builder().fullName("V\u0169 Minh Tu\u1EA5n").email("tuan@gmail.com")
                        .password(encodedPassword).phone("0945678901").role(Role.CUSTOMER).enabled(true).build(),
                User.builder().fullName("\u0110\u1EB7ng Th\u00F9y Linh").email("linh@gmail.com")
                        .password(encodedPassword).phone("0956789012").role(Role.CUSTOMER).enabled(true).build()
        );

        List<User> saved = userRepository.saveAll(users);
        customers.addAll(saved.subList(3, 8));
        log.info("Seeded {} users ({} customers)", saved.size(), customers.size());
    }

    // ==================== ADDRESSES ====================

    private void seedAddresses() {
        log.info("Seeding addresses...");
        List<Address> addresses = new ArrayList<>();

        addresses.add(Address.builder().user(customers.get(0)).fullName("Ph\u1EA1m Th\u1ECB Mai")
                .phone("0912345678").province("H\u00E0 N\u1ED9i").district("C\u1EA7u Gi\u1EA5y")
                .ward("D\u1ECBch V\u1ECDng H\u1EADu").addressDetail("S\u1ED1 15, ng\u00F5 42, Ph\u1ED1 Tr\u1EA7n Th\u00E1i T\u00F4ng")
                .isDefault(true).build());
        addresses.add(Address.builder().user(customers.get(0)).fullName("Ph\u1EA1m Th\u1ECB Mai")
                .phone("0912345678").province("H\u00E0 N\u1ED9i").district("Ho\u00E0n Ki\u1EBFm")
                .ward("Tr\u00E0ng Ti\u1EC1n").addressDetail("S\u1ED1 8, Ph\u1ED1 Tr\u00E0ng Ti\u1EC1n")
                .isDefault(false).build());

        addresses.add(Address.builder().user(customers.get(1)).fullName("Ho\u00E0ng V\u0103n \u0110\u1EE9c")
                .phone("0923456789").province("TP. H\u1ED3 Ch\u00ED Minh").district("Qu\u1EADn 1")
                .ward("B\u1EBFn Ngh\u00E9").addressDetail("25 L\u00EA L\u1EE3i, Ph\u01B0\u1EDDng B\u1EBFn Ngh\u00E9")
                .isDefault(true).build());

        addresses.add(Address.builder().user(customers.get(2)).fullName("Nguy\u1EC5n Th\u1ECB Lan")
                .phone("0934567890").province("\u0110\u00E0 N\u1EB5ng").district("H\u1EA3i Ch\u00E2u")
                .ward("Thanh Kh\u00EA \u0110\u00F4ng").addressDetail("120 Nguy\u1EC5n V\u0103n Linh")
                .isDefault(true).build());
        addresses.add(Address.builder().user(customers.get(2)).fullName("Nguy\u1EC5n Th\u1ECB Lan")
                .phone("0934567890").province("\u0110\u00E0 N\u1EB5ng").district("S\u01A1n Tr\u00E0")
                .ward("An H\u1EA3i B\u1EAFc").addressDetail("45 Ph\u1EA1m V\u0103n \u0110\u1ED3ng")
                .isDefault(false).build());

        addresses.add(Address.builder().user(customers.get(3)).fullName("V\u0169 Minh Tu\u1EA5n")
                .phone("0945678901").province("TP. H\u1ED3 Ch\u00ED Minh").district("Qu\u1EADn 7")
                .ward("T\u00E2n Phong").addressDetail("S\u1ED1 10 Nguy\u1EC5n V\u0103n Linh, Khu Ph\u00FA M\u1EF9 H\u01B0ng")
                .isDefault(true).build());

        addresses.add(Address.builder().user(customers.get(4)).fullName("\u0110\u1EB7ng Th\u00F9y Linh")
                .phone("0956789012").province("H\u00E0 N\u1ED9i").district("Thanh Xu\u00E2n")
                .ward("Kh\u01B0\u01A1ng Trung").addressDetail("Chung c\u01B0 Hapulico, 83 V\u0169 Tr\u1ECDng Ph\u1EE5ng")
                .isDefault(true).build());

        addressRepository.saveAll(addresses);
        log.info("Seeded {} addresses", addresses.size());
    }

    // ==================== CATEGORIES ====================

    private final Map<String, Category> categoryMap = new LinkedHashMap<>();

    private void seedCategories() {
        log.info("Seeding categories...");

        List<Object[]> catData = List.of(
                new Object[]{"van-hoc", "V\u0103n h\u1ECDc", "S\u00E1ch v\u0103n h\u1ECDc Vi\u1EC7t Nam v\u00E0 th\u1EBF gi\u1EDBi"},
                new Object[]{"kinh-te", "Kinh t\u1EBF", "S\u00E1ch kinh t\u1EBF, t\u00E0i ch\u00EDnh, qu\u1EA3n tr\u1ECB"},
                new Object[]{"ky-nang-song", "K\u1EF9 n\u0103ng s\u1ED1ng", "S\u00E1ch ph\u00E1t tri\u1EC3n b\u1EA3n th\u00E2n, k\u1EF9 n\u0103ng"},
                new Object[]{"khoa-hoc", "Khoa h\u1ECDc", "S\u00E1ch khoa h\u1ECDc, c\u00F4ng ngh\u1EC7, t\u1EF1 nhi\u00EAn"},
                new Object[]{"thieu-nhi", "Thi\u1EBFu nhi", "S\u00E1ch d\u00E0nh cho tr\u1EBB em v\u00E0 thanh thi\u1EBFu ni\u00EAn"},
                new Object[]{"nghe-thuat", "Ngh\u1EC7 thu\u1EADt", "S\u00E1ch ngh\u1EC7 thu\u1EADt, thi\u1EBFt k\u1EBF, \u00E2m nh\u1EA1c"},
                new Object[]{"cong-nghe", "C\u00F4ng ngh\u1EC7", "S\u00E1ch l\u1EADp tr\u00ECnh, CNTT, digital"}
        );

        for (Object[] row : catData) {
            String slug = (String) row[0];
            String name = (String) row[1];
            String desc = (String) row[2];

            String imageUrl = uploadImage(CATEGORY_IMAGES.getOrDefault(slug, "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=400&fit=crop"), "categories");

            Category cat = Category.builder()
                    .name(name).slug(slug).description(desc).imageUrl(imageUrl)
                    .active(true)
                    .build();
            cat = categoryRepository.save(cat);
            categoryMap.put(slug, cat);
        }

        log.info("Seeded {} categories", categoryMap.size());
    }

    // ==================== BOOKS ====================

    private void seedBooks() {
        log.info("Seeding books...");

        // --- Van hoc ---
        createBook("van-hoc", "Nh\u00E0 gi\u1EA3 kim", "nha-gia-kim",
                "Paulo Coelho", "NXB H\u1ED9i Nh\u00E0 V\u0103n", "978-604-1-12345-0", 1988, 228, 79000, null, true,
                "Tuy\u1EC7t t\u00E1c \u0111\u01B0\u1EE3c d\u1ECBch ra 80 ng\u00F4n ng\u1EEF, k\u1EC3 v\u1EC1 h\u00E0nh tr\u00ECnh theo \u0111u\u1ED5i gi\u1EA5c m\u01A1 c\u1EE7a c\u1EADu b\u00E9 ch\u0103n c\u1EEBu Santiago.");

        createBook("van-hoc", "Cho t\u00F4i xin m\u1ED9t v\u00E9 \u0111i tu\u1ED5i th\u01A1", "cho-toi-xin-mot-ve-di-tuoi-tho",
                "Nguy\u1EC5n Nh\u1EADt \u00C1nh", "NXB Tr\u1EBB", "978-604-1-12346-7", 2008, 216, 85000, null, true,
                "C\u00E2u chuy\u1EC7n c\u1EA3m \u0111\u1ED9ng v\u1EC1 tu\u1ED5i th\u01A1 h\u1ED3n nhi\u00EAn, trong s\u00E1ng c\u1EE7a nh\u00E0 v\u0103n Nguy\u1EC5n Nh\u1EADt \u00C1nh.");

        createBook("van-hoc", "T\u00F4i th\u1EA5y hoa v\u00E0ng tr\u00EAn c\u1ECF xanh", "toi-thay-hoa-vang-tren-co-xanh",
                "Nguy\u1EC5n Nh\u1EADt \u00C1nh", "NXB Tr\u1EBB", "978-604-1-12347-4", 2010, 378, 110000, 89000L, false,
                "Ti\u1EC3u thuy\u1EBFt v\u1EC1 tu\u1ED5i th\u01A1 mi\u1EC1n qu\u00EA, \u0111\u01B0\u1EE3c chuy\u1EC3n th\u1EC3 th\u00E0nh phim \u0111i\u1EC7n \u1EA3nh.");

        createBook("van-hoc", "R\u1EEBng Na Uy", "rung-na-uy",
                "Haruki Murakami", "NXB H\u1ED9i Nh\u00E0 V\u0103n", "978-604-1-12348-1", 1987, 480, 135000, null, false,
                "Ti\u1EC3u thuy\u1EBFt kinh \u0111i\u1EC3n c\u1EE7a Murakami v\u1EC1 t\u00ECnh y\u00EAu, m\u1EA5t m\u00E1t v\u00E0 s\u1EF1 c\u00F4 \u0111\u01A1n.");

        createBook("van-hoc", "Tri\u1EC7u ph\u00FA khu \u1ED5 chu\u1ED9t", "trieu-phu-khu-o-chuot",
                "Vikas Swarup", "NXB Lao \u0110\u1ED9ng", "978-604-1-12349-8", 2005, 350, 98000, null, false,
                "C\u00E2u chuy\u1EC7n \u0111\u1EA7y c\u1EA3m h\u1EE9ng v\u1EC1 c\u1EADu b\u00E9 m\u1ED3 c\u00F4i \u1EDF \u1EA4n \u0110\u1ED9 t\u1EEB khu \u1ED5 chu\u1ED9t v\u01B0\u01A1n l\u00EAn.");

        // --- Kinh te ---
        createBook("kinh-te", "T\u01B0 duy nhanh v\u00E0 ch\u1EADm", "tu-duy-nhanh-va-cham",
                "Daniel Kahneman", "NXB Th\u1EBF Gi\u1EDBi", "978-604-1-22345-0", 2011, 500, 199000, null, true,
                "Kh\u00E1m ph\u00E1 hai h\u1EC7 th\u1ED1ng t\u01B0 duy chi ph\u1ED1i c\u00E1ch ch\u00FAng ta ra quy\u1EBFt \u0111\u1ECBnh.");

        createBook("kinh-te", "Cha gi\u00E0u cha ngh\u00E8o", "cha-giau-cha-ngheo",
                "Robert Kiyosaki", "NXB Tr\u1EBB", "978-604-1-22346-7", 1997, 320, 108000, null, false,
                "Cu\u1ED1n s\u00E1ch t\u00E0i ch\u00EDnh c\u00E1 nh\u00E2n b\u00E1n ch\u1EA1y nh\u1EA5t m\u1ECDi th\u1EDDi \u0111\u1EA1i.");

        createBook("kinh-te", "T\u1EEB t\u1ED1t \u0111\u1EBFn v\u0129 \u0111\u1EA1i", "tu-tot-den-vi-dai",
                "Jim Collins", "NXB Th\u1EBF Gi\u1EDBi", "978-604-1-22347-4", 2001, 432, 159000, null, true,
                "Nghi\u00EAn c\u1EE9u v\u1EC1 c\u00E1c c\u00F4ng ty \u0111\u00E3 chuy\u1EC3n \u0111\u1ED5i t\u1EEB t\u1ED1t th\u00E0nh v\u0129 \u0111\u1EA1i.");

        createBook("kinh-te", "Ngh\u0129 gi\u00E0u l\u00E0m gi\u00E0u", "nghi-giau-lam-giau",
                "Napoleon Hill", "NXB Th\u1EBF Gi\u1EDBi", "978-604-1-22348-1", 1937, 296, 89000, 69000L, false,
                "B\u00ED quy\u1EBFt l\u00E0m gi\u00E0u \u0111\u01B0\u1EE3c \u0111\u00FAc k\u1EBFt t\u1EEB 500 ng\u01B0\u1EDDi gi\u00E0u nh\u1EA5t n\u01B0\u1EDBc M\u1EF9.");

        // --- Ky nang song ---
        createBook("ky-nang-song", "\u0110\u1EAFc nh\u00E2n t\u00E2m", "dac-nhan-tam",
                "Dale Carnegie", "NXB T\u1ED5ng H\u1EE3p", "978-604-1-32345-0", 1936, 320, 86000, null, true,
                "Ngh\u1EC7 thu\u1EADt \u0111\u1ED1i nh\u00E2n x\u1EED th\u1EBF \u0111\u1EC3 th\u00E0nh c\u00F4ng trong cu\u1ED9c s\u1ED1ng.");

        createBook("ky-nang-song", "7 th\u00F3i quen hi\u1EC7u qu\u1EA3", "7-thoi-quen-hieu-qua",
                "Stephen Covey", "NXB Tr\u1EBB", "978-604-1-32346-7", 1989, 384, 125000, null, false,
                "Nh\u1EEFng nguy\u00EAn t\u1EAFc \u0111\u1EC3 th\u00E0nh c\u00F4ng trong c\u00F4ng vi\u1EC7c v\u00E0 cu\u1ED9c s\u1ED1ng.");

        createBook("ky-nang-song", "S\u1EE9c m\u1EA1nh c\u1EE7a th\u00F3i quen", "suc-manh-cua-thoi-quen",
                "Charles Duhigg", "NXB Lao \u0110\u1ED9ng", "978-604-1-32347-4", 2012, 408, 139000, null, false,
                "T\u1EA1i sao ch\u00FAng ta l\u00E0m nh\u1EEFng g\u00EC ch\u00FAng ta l\u00E0m v\u00E0 c\u00E1ch thay \u0111\u1ED5i th\u00F3i quen.");

        createBook("ky-nang-song", "Tu\u1ED5i tr\u1EBB \u0111\u00E1ng gi\u00E1 bao nhi\u00EAu", "tuoi-tre-dang-gia-bao-nhieu",
                "Rosie Nguy\u1EC5n", "NXB H\u1ED9i Nh\u00E0 V\u0103n", "978-604-1-32348-1", 2016, 280, 76000, null, true,
                "Nh\u1EEFng b\u00E0i h\u1ECDc qu\u00FD gi\u00E1 cho tu\u1ED5i tr\u1EBB v\u1EC1 s\u1ED1ng c\u00F3 \u00FD ngh\u0129a.");

        // --- Khoa hoc ---
        createBook("khoa-hoc", "Sapiens: L\u01B0\u1EE3c s\u1EED lo\u00E0i ng\u01B0\u1EDDi", "sapiens-luoc-su-loai-nguoi",
                "Yuval Noah Harari", "NXB Th\u1EBF Gi\u1EDBi", "978-604-1-42345-0", 2011, 560, 199000, null, true,
                "L\u1ECBch s\u1EED h\u00E0ng ch\u1EE5c ngh\u00ECn n\u0103m c\u1EE7a lo\u00E0i ng\u01B0\u1EDDi t\u1EEB kh\u1EDFi \u0111\u1EA7u \u0111\u1EBFn hi\u1EC7n \u0111\u1EA1i.");

        createBook("khoa-hoc", "L\u01B0\u1EE3c s\u1EED th\u1EDDi gian", "luoc-su-thoi-gian",
                "Stephen Hawking", "NXB Tr\u1EBB", "978-604-1-42346-7", 1988, 256, 95000, null, false,
                "V\u0169 tr\u1EE5 t\u1EEB Big Bang \u0111\u1EBFn h\u1ED1 \u0111en qua g\u00F3c nh\u00ECn c\u1EE7a thi\u00EAn t\u00E0i v\u1EADt l\u00FD.");

        createBook("khoa-hoc", "Cosmos", "cosmos",
                "Carl Sagan", "NXB Th\u1EBF Gi\u1EDBi", "978-604-1-42347-4", 1980, 432, 175000, 145000L, false,
                "H\u00E0nh tr\u00ECnh kh\u00E1m ph\u00E1 v\u0169 tr\u1EE5 v\u0129 \u0111\u1EA1i \u0111\u01B0\u1EE3c k\u1EC3 m\u1ED9t c\u00E1ch s\u00E2u s\u1EAFc v\u00E0 thi v\u1ECB.");

        // --- Thieu nhi ---
        createBook("thieu-nhi", "Ho\u00E0ng t\u1EED b\u00E9", "hoang-tu-be",
                "Antoine de Saint-Exup\u00E9ry", "NXB Kim \u0110\u1ED3ng", "978-604-1-52345-0", 1943, 96, 55000, null, true,
                "C\u00E2u chuy\u1EC7n c\u1ED5 t\u00EDch hi\u1EC7n \u0111\u1EA1i \u0111\u01B0\u1EE3c y\u00EAu th\u00EDch nh\u1EA5t m\u1ECDi th\u1EDDi \u0111\u1EA1i.");

        createBook("thieu-nhi", "D\u1EBF m\u00E8n phi\u00EAu l\u01B0u k\u00FD", "de-men-phieu-luu-ky",
                "T\u00F4 Ho\u00E0i", "NXB Kim \u0110\u1ED3ng", "978-604-1-52346-7", 1941, 176, 45000, null, false,
                "T\u00E1c ph\u1EA9m kinh \u0111i\u1EC3n c\u1EE7a v\u0103n h\u1ECDc thi\u1EBFu nhi Vi\u1EC7t Nam.");

        createBook("thieu-nhi", "Harry Potter v\u00E0 h\u00F2n \u0111\u00E1 ph\u00F9 th\u1EE7y", "harry-potter-va-hon-da-phu-thuy",
                "J.K. Rowling", "NXB Tr\u1EBB", "978-604-1-52347-4", 1997, 366, 150000, null, true,
                "T\u1EADp \u0111\u1EA7u ti\u00EAn trong b\u1ED9 truy\u1EC7n ph\u00E9p thu\u1EADt huy\u1EC1n tho\u1EA1i.");

        // --- Nghe thuat ---
        createBook("nghe-thuat", "L\u1ECBch s\u1EED ngh\u1EC7 thu\u1EADt", "lich-su-nghe-thuat",
                "E.H. Gombrich", "NXB M\u1EF9 Thu\u1EADt", "978-604-1-62345-0", 1950, 688, 350000, 299000L, false,
                "Cu\u1ED1n s\u00E1ch kinh \u0111i\u1EC3n v\u1EC1 l\u1ECBch s\u1EED ngh\u1EC7 thu\u1EADt t\u1EEB c\u1ED5 \u0111\u1EA1i \u0111\u1EBFn hi\u1EC7n \u0111\u1EA1i.");

        createBook("nghe-thuat", "Ngh\u1EC7 thu\u1EADt tinh t\u1EBF c\u1EE7a vi\u1EC7c \u0111\u1EBFch m\u1EB9", "nghe-thuat-tinh-te-cua-viec-dech-me",
                "Mark Manson", "NXB Lao \u0110\u1ED9ng", "978-604-1-62346-7", 2016, 240, 89000, null, true,
                "C\u00E1ch s\u1ED1ng t\u1ED1t h\u01A1n b\u1EB1ng vi\u1EC7c quan t\u00E2m \u0111\u00FAng th\u1EE9.");

        // --- Cong nghe ---
        createBook("cong-nghe", "Clean Code", "clean-code",
                "Robert C. Martin", "NXB Th\u1EBF Gi\u1EDBi", "978-604-1-72345-0", 2008, 464, 299000, null, true,
                "H\u01B0\u1EDBng d\u1EABn vi\u1EBFt code s\u1EA1ch, d\u1EC5 b\u1EA3o tr\u00EC v\u00E0 hi\u1EC7u qu\u1EA3.");

        createBook("cong-nghe", "Design Patterns", "design-patterns",
                "Gang of Four", "NXB Th\u1EBF Gi\u1EDBi", "978-604-1-72346-7", 1994, 395, 259000, null, false,
                "C\u00E1c m\u1EABu thi\u1EBFt k\u1EBF ph\u1EA7n m\u1EC1m kinh \u0111i\u1EC3n m\u00E0 m\u1ECDi l\u1EADp tr\u00ECnh vi\u00EAn c\u1EA7n bi\u1EBFt.");

        createBook("cong-nghe", "Kh\u00F4ng l\u1EE1 c\u00F4ng ngh\u1EC7", "khong-lo-cong-nghe",
                "Kara Swisher", "NXB T\u1ED5ng H\u1EE3p", "978-604-1-72347-4", 2023, 384, 185000, 155000L, false,
                "C\u00E2u chuy\u1EC7n v\u1EC1 c\u00E1c \u00F4ng l\u1EDBn c\u00F4ng ngh\u1EC7 v\u00E0 t\u00E1c \u0111\u1ED9ng c\u1EE7a h\u1ECD \u0111\u1EBFn th\u1EBF gi\u1EDBi.");

        log.info("Seeded {} books with images", allBooks.size());
    }

    private void createBook(String categorySlug, String name, String slug,
                            String author, String publisher, String isbn,
                            int publishYear, int pageCount,
                            long basePrice, Long salePrice, boolean featured,
                            String description) {

        Category category = categoryMap.get(categorySlug);
        Random rand = new Random(slug.hashCode());
        int stockQuantity = 20 + rand.nextInt(81); // 20-100

        Book.BookBuilder builder = Book.builder()
                .name(name)
                .slug(slug)
                .description(description)
                .category(category)
                .author(author)
                .publisher(publisher)
                .isbn(isbn)
                .publishYear(publishYear)
                .pageCount(pageCount)
                .stockQuantity(stockQuantity)
                .basePrice(BigDecimal.valueOf(basePrice))
                .featured(featured)
                .active(true);

        if (salePrice != null) {
            builder.salePrice(BigDecimal.valueOf(salePrice));
        }

        Book book = bookRepository.save(builder.build());

        // Upload images
        String[] imageUrls = BOOK_IMAGES.get(slug);
        for (int i = 0; i < 2; i++) {
            String sourceUrl = (imageUrls != null && i < imageUrls.length)
                    ? imageUrls[i]
                    : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1000&fit=crop";
            String imgUrl = uploadImage(sourceUrl, "books");

            BookImage img = BookImage.builder()
                    .book(book)
                    .imageUrl(imgUrl)
                    .isPrimary(i == 0)
                    .sortOrder(i)
                    .build();
            bookImageRepository.save(img);
        }

        allBooks.add(book);
    }

    // ==================== BANNERS ====================

    private void seedBanners() {
        log.info("Seeding banners...");

        Object[][] bannerData = {
                {"S\u00E1ch hay m\u1EDBi v\u1EC1 - Gi\u1EA3m \u0111\u1EBFn 30%", "/shop", 1},
                {"B\u1ED9 s\u01B0u t\u1EADp V\u0103n h\u1ECDc kinh \u0111i\u1EC3n", "/shop?category=van-hoc", 2},
                {"S\u00E1ch Khoa h\u1ECDc & C\u00F4ng ngh\u1EC7", "/shop?category=cong-nghe", 3},
                {"Mi\u1EC5n ph\u00ED v\u1EADn chuy\u1EC3n \u0111\u01A1n t\u1EEB 300K", "/shop", 4}
        };

        for (int i = 0; i < bannerData.length; i++) {
            String title = (String) bannerData[i][0];
            String linkUrl = (String) bannerData[i][1];
            int sortOrder = (int) bannerData[i][2];

            String sourceUrl = (i < BANNER_IMAGES.length) ? BANNER_IMAGES[i] : BANNER_IMAGES[0];
            String imgUrl = uploadImage(sourceUrl, "banners");

            Banner banner = Banner.builder()
                    .title(title)
                    .imageUrl(imgUrl)
                    .linkUrl(linkUrl)
                    .sortOrder(sortOrder)
                    .active(true)
                    .build();
            bannerRepository.save(banner);
        }

        log.info("Seeded {} banners", bannerData.length);
    }

    // ==================== COUPONS ====================

    private void seedCoupons() {
        log.info("Seeding coupons...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = now.plusDays(90);

        List<Coupon> coupons = List.of(
                Coupon.builder()
                        .code("WELCOME10")
                        .description("Gi\u1EA3m 10% cho \u0111\u01A1n h\u00E0ng \u0111\u1EA7u ti\u00EAn")
                        .discountType(Coupon.DiscountType.PERCENTAGE)
                        .discountValue(BigDecimal.valueOf(10))
                        .minOrderAmount(BigDecimal.valueOf(200000))
                        .maxDiscount(BigDecimal.valueOf(100000))
                        .usageLimit(100)
                        .startDate(now).endDate(endDate).build(),
                Coupon.builder()
                        .code("BOOKWORM")
                        .description("Gi\u1EA3m 50.000\u0111 cho m\u1ECDt s\u00E1ch")
                        .discountType(Coupon.DiscountType.FIXED)
                        .discountValue(BigDecimal.valueOf(50000))
                        .minOrderAmount(BigDecimal.valueOf(300000))
                        .usageLimit(50)
                        .startDate(now).endDate(endDate).build(),
                Coupon.builder()
                        .code("VIP20")
                        .description("Gi\u1EA3m 20% cho kh\u00E1ch VIP")
                        .discountType(Coupon.DiscountType.PERCENTAGE)
                        .discountValue(BigDecimal.valueOf(20))
                        .minOrderAmount(BigDecimal.valueOf(500000))
                        .maxDiscount(BigDecimal.valueOf(200000))
                        .usageLimit(30)
                        .startDate(now).endDate(endDate).build(),
                Coupon.builder()
                        .code("FREESHIP")
                        .description("Mi\u1EC5n ph\u00ED v\u1EADn chuy\u1EC3n")
                        .discountType(Coupon.DiscountType.FIXED)
                        .discountValue(BigDecimal.valueOf(30000))
                        .minOrderAmount(BigDecimal.ZERO)
                        .usageLimit(200)
                        .startDate(now).endDate(endDate).build()
        );

        couponRepository.saveAll(coupons);
        log.info("Seeded {} coupons", coupons.size());
    }

    // ==================== ORDERS ====================

    private void seedOrders() {
        log.info("Seeding orders...");

        createOrder(customers.get(0), "BS-ORD-20240101",
                "Ph\u1EA1m Th\u1ECB Mai, 0912345678, S\u1ED1 15, ng\u00F5 42, Ph\u1ED1 Tr\u1EA7n Th\u00E1i T\u00F4ng, D\u1ECBch V\u1ECDng H\u1EADu, C\u1EA7u Gi\u1EA5y, H\u00E0 N\u1ED9i",
                Order.Status.DELIVERED, Order.PaymentMethod.COD, Order.PaymentStatus.PAID,
                "Giao gi\u1EDD h\u00E0nh ch\u00EDnh",
                new int[]{0, 2}, new int[]{1, 1}, BigDecimal.valueOf(30000));

        createOrder(customers.get(1), "BS-ORD-20240102",
                "Ho\u00E0ng V\u0103n \u0110\u1EE9c, 0923456789, 25 L\u00EA L\u1EE3i, B\u1EBFn Ngh\u00E9, Qu\u1EADn 1, TP. H\u1ED3 Ch\u00ED Minh",
                Order.Status.DELIVERED, Order.PaymentMethod.VNPAY, Order.PaymentStatus.PAID,
                null,
                new int[]{5, 9}, new int[]{1, 1}, BigDecimal.valueOf(30000));

        createOrder(customers.get(2), "BS-ORD-20240103",
                "Nguy\u1EC5n Th\u1ECB Lan, 0934567890, 120 Nguy\u1EC5n V\u0103n Linh, Thanh Kh\u00EA \u0110\u00F4ng, H\u1EA3i Ch\u00E2u, \u0110\u00E0 N\u1EB5ng",
                Order.Status.SHIPPING, Order.PaymentMethod.COD, Order.PaymentStatus.PENDING,
                "G\u1ECDi tr\u01B0\u1EDBc khi ship",
                new int[]{13, 17}, new int[]{2, 1}, BigDecimal.valueOf(25000));

        createOrder(customers.get(3), "BS-ORD-20240104",
                "V\u0169 Minh Tu\u1EA5n, 0945678901, S\u1ED1 10 Nguy\u1EC5n V\u0103n Linh, T\u00E2n Phong, Qu\u1EADn 7, TP. H\u1ED3 Ch\u00ED Minh",
                Order.Status.CONFIRMED, Order.PaymentMethod.VNPAY, Order.PaymentStatus.PAID,
                null,
                new int[]{10, 20}, new int[]{1, 1}, BigDecimal.valueOf(30000));

        createOrder(customers.get(4), "BS-ORD-20240105",
                "\u0110\u1EB7ng Th\u00F9y Linh, 0956789012, Chung c\u01B0 Hapulico, 83 V\u0169 Tr\u1ECDng Ph\u1EE5ng, Kh\u01B0\u01A1ng Trung, Thanh Xu\u00E2n, H\u00E0 N\u1ED9i",
                Order.Status.PENDING, Order.PaymentMethod.COD, Order.PaymentStatus.PENDING,
                null,
                new int[]{15, 18}, new int[]{1, 2}, BigDecimal.valueOf(30000));

        createOrder(customers.get(0), "BS-ORD-20240106",
                "Ph\u1EA1m Th\u1ECB Mai, 0912345678, S\u1ED1 15, ng\u00F5 42, Ph\u1ED1 Tr\u1EA7n Th\u00E1i T\u00F4ng, D\u1ECBch V\u1ECDng H\u1EADu, C\u1EA7u Gi\u1EA5y, H\u00E0 N\u1ED9i",
                Order.Status.DELIVERED, Order.PaymentMethod.VNPAY, Order.PaymentStatus.PAID,
                null,
                new int[]{8, 4}, new int[]{1, 1}, BigDecimal.valueOf(0));

        log.info("Seeded {} orders", allOrders.size());
    }

    private void createOrder(User user, String orderCode, String shippingAddress,
                             Order.Status status, Order.PaymentMethod paymentMethod,
                             Order.PaymentStatus paymentStatus, String note,
                             int[] bookIndices, int[] quantities,
                             BigDecimal shippingFee) {

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (int i = 0; i < bookIndices.length; i++) {
            int bIdx = bookIndices[i] % allBooks.size();
            Book book = allBooks.get(bIdx);
            BigDecimal price = book.getSalePrice() != null ? book.getSalePrice() : book.getBasePrice();
            int qty = quantities[i];
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(qty));
            totalAmount = totalAmount.add(subtotal);

            String imageUrl = BOOK_IMAGES.containsKey(book.getSlug())
                    ? BOOK_IMAGES.get(book.getSlug())[0]
                    : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1000&fit=crop";

            items.add(OrderItem.builder()
                    .book(book)
                    .productName(book.getName())
                    .productImage(imageUrl)
                    .price(price)
                    .quantity(qty)
                    .subtotal(subtotal)
                    .build());
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalAmount = totalAmount.add(shippingFee).subtract(discountAmount);

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .shippingAddress(shippingAddress)
                .totalAmount(totalAmount)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(status)
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .note(note)
                .build();

        order = orderRepository.save(order);

        for (OrderItem item : items) {
            item.setOrder(order);
        }
        orderItemRepository.saveAll(items);

        // Create payment for DELIVERED or paid orders
        if (paymentStatus == Order.PaymentStatus.PAID) {
            String txnId = paymentMethod == Order.PaymentMethod.VNPAY
                    ? "VNP" + System.currentTimeMillis() + order.getId()
                    : "COD" + order.getId();

            Payment payment = Payment.builder()
                    .order(order)
                    .transactionId(txnId)
                    .paymentMethod(paymentMethod.name())
                    .amount(finalAmount)
                    .status(Payment.Status.SUCCESS)
                    .paidAt(LocalDateTime.now().minusDays(allOrders.size()))
                    .build();

            if (paymentMethod == Order.PaymentMethod.VNPAY) {
                payment.setVnpayResponseCode("00");
            }

            paymentRepository.save(payment);
        }

        // Create shipping record
        Shipping.ShippingBuilder shippingBuilder = Shipping.builder()
                .order(order)
                .carrier("Giao H\u00E0ng Nhanh")
                .trackingCode("GHN" + String.format("%08d", order.getId()));

        switch (status) {
            case DELIVERED -> {
                shippingBuilder.status(Shipping.Status.DELIVERED);
                shippingBuilder.shippedAt(LocalDateTime.now().minusDays(5));
                shippingBuilder.deliveredAt(LocalDateTime.now().minusDays(2));
                shippingBuilder.estimatedDelivery(LocalDateTime.now().minusDays(1));
            }
            case SHIPPING -> {
                shippingBuilder.status(Shipping.Status.IN_TRANSIT);
                shippingBuilder.shippedAt(LocalDateTime.now().minusDays(1));
                shippingBuilder.estimatedDelivery(LocalDateTime.now().plusDays(2));
            }
            case CONFIRMED -> {
                shippingBuilder.status(Shipping.Status.PENDING);
                shippingBuilder.estimatedDelivery(LocalDateTime.now().plusDays(4));
            }
            default -> {
                shippingBuilder.status(Shipping.Status.PENDING);
                shippingBuilder.estimatedDelivery(LocalDateTime.now().plusDays(5));
            }
        }

        shippingRepository.save(shippingBuilder.build());

        allOrders.add(order);
    }

    // ==================== REVIEWS ====================

    private void seedReviews() {
        log.info("Seeding reviews...");

        List<Order> deliveredOrders = allOrders.stream()
                .filter(o -> o.getStatus() == Order.Status.DELIVERED)
                .toList();

        String[] comments = {
                "S\u00E1ch hay, n\u1ED9i dung r\u1EA5t b\u1ED5 \u00EDch. S\u1EBD mua th\u00EAm.",
                "\u0110\u00FAng b\u1EA3n in, giao h\u00E0ng nhanh. H\u00E0i l\u00F2ng!",
                "N\u1ED9i dung s\u00E2u s\u1EAFc, \u0111\u00E1ng \u0111\u1ECDc m\u1ED9t l\u1EA7n trong \u0111\u1EDDi.",
                "S\u00E1ch t\u1ED1t, gi\u00E1 h\u1EE3p l\u00FD. R\u1EA5t \u0111\u00E1ng mua.",
                "In \u0111\u1EB9p, gi\u1EA5y t\u1ED1t, d\u1ECBch chu\u1EA9n. 5 sao!",
                "B\u00ECa h\u01A1i kh\u00E1c so v\u1EDBi h\u00ECnh nh\u01B0ng n\u1ED9i dung v\u1EABn tuy\u1EC7t v\u1EDDi.",
                "Giao h\u00E0ng h\u01A1i l\u00E2u nh\u01B0ng s\u00E1ch ch\u1EA5t l\u01B0\u1EE3ng.",
                "\u0110\u00F3ng g\u00F3i c\u1EA9n th\u1EADn, s\u00E1ch \u0111\u1EB9p. S\u1EBD quay l\u1EA1i.",
                "\u0110\u1ECDc xong r\u1EA5t t\u00E2m \u0111\u1EAFc, chia s\u1EBB cho b\u1EA1n b\u00E8 ngay.",
                "B\u1EA3n d\u1ECBch t\u1ED1t, d\u1EC5 hi\u1EC3u. R\u1EA5t h\u00E0i l\u00F2ng.",
                "Gi\u1EA5y h\u01A1i m\u1ECFng nh\u01B0ng n\u1ED9i dung b\u00F9 l\u1EA1i.",
                "S\u00E1ch x\u1EE9ng \u0111\u00E1ng v\u1EDBi gi\u00E1 ti\u1EC1n. S\u1EBD gi\u1EDBi thi\u1EC7u cho b\u1EA1n b\u00E8.",
                "\u0110\u1ECDc m\u1ED9t m\u1EA1ch kh\u00F4ng mu\u1ED1n d\u1EEBng. Tuy\u1EC7t v\u1EDDi!",
                "L\u1EA7n \u0111\u1EA7u mua h\u00E0ng \u1EDF \u0111\u00E2y, r\u1EA5t \u1EA5n t\u01B0\u1EE3ng v\u1EC1 ch\u1EA5t l\u01B0\u1EE3ng.",
                "Gi\u00E1 t\u1ED1t m\u00E0 ch\u1EA5t l\u01B0\u1EE3ng c\u0169ng t\u1ED1t. 10 \u0111i\u1EC3m!"
        };

        int[] ratings = {5, 5, 4, 4, 5, 3, 4, 5, 5, 4, 3, 5, 4, 5, 5};
        int reviewIdx = 0;

        for (Order order : deliveredOrders) {
            List<OrderItem> orderItems = orderItemRepository.findAll().stream()
                    .filter(oi -> oi.getOrder().getId().equals(order.getId()))
                    .toList();

            for (OrderItem item : orderItems) {
                if (reviewIdx >= comments.length) break;

                Review review = Review.builder()
                        .user(order.getUser())
                        .book(item.getBook())
                        .order(order)
                        .rating(ratings[reviewIdx])
                        .comment(comments[reviewIdx])
                        .build();
                reviewRepository.save(review);
                reviewIdx++;
            }
        }

        log.info("Seeded {} reviews", reviewIdx);
    }

    // ==================== NOTIFICATIONS ====================

    private void seedNotifications() {
        log.info("Seeding notifications...");
        List<Notification> notifications = new ArrayList<>();

        for (User customer : customers) {
            notifications.add(Notification.builder()
                    .user(customer)
                    .title("Ch\u00E0o m\u1EEBng b\u1EA1n \u0111\u1EBFn BookStorm!")
                    .message("C\u1EA3m \u01A1n b\u1EA1n \u0111\u00E3 \u0111\u0103ng k\u00FD t\u00E0i kho\u1EA3n. Kh\u00E1m ph\u00E1 kho s\u00E1ch phong ph\u00FA c\u1EE7a ch\u00FAng t\u00F4i!")
                    .type(Notification.Type.SYSTEM)
                    .build());
        }

        for (User customer : customers) {
            notifications.add(Notification.builder()
                    .user(customer)
                    .title("S\u00E1ch m\u1EDBi v\u1EC1 - Gi\u1EA3m gi\u00E1 \u0111\u1EB7c bi\u1EC7t!")
                    .message("Nhanh tay s\u0103n s\u00E1ch hay gi\u00E1 t\u1ED1t! Gi\u1EA3m gi\u00E1 l\u00EAn \u0111\u1EBFn 30% cho h\u00E0ng tr\u0103m \u0111\u1EA7u s\u00E1ch. S\u1EED d\u1EE5ng m\u00E3 BOOKWORM \u0111\u1EC3 gi\u1EA3m th\u00EAm 50K.")
                    .type(Notification.Type.PROMOTION)
                    .build());
        }

        for (Order order : allOrders) {
            String statusMsg = switch (order.getStatus()) {
                case DELIVERED -> "\u0110\u01A1n h\u00E0ng " + order.getOrderCode() + " \u0111\u00E3 giao th\u00E0nh c\u00F4ng. C\u1EA3m \u01A1n b\u1EA1n \u0111\u00E3 mua h\u00E0ng!";
                case SHIPPING -> "\u0110\u01A1n h\u00E0ng " + order.getOrderCode() + " \u0111ang \u0111\u01B0\u1EE3c v\u1EADn chuy\u1EC3n. D\u1EF1 ki\u1EBFn giao trong 2-3 ng\u00E0y.";
                case CONFIRMED -> "\u0110\u01A1n h\u00E0ng " + order.getOrderCode() + " \u0111\u00E3 \u0111\u01B0\u1EE3c x\u00E1c nh\u1EADn. Ch\u00FAng t\u00F4i \u0111ang chu\u1EA9n b\u1ECB h\u00E0ng cho b\u1EA1n.";
                case PENDING -> "\u0110\u01A1n h\u00E0ng " + order.getOrderCode() + " \u0111\u00E3 \u0111\u01B0\u1EE3c ti\u1EBFp nh\u1EADn. Vui l\u00F2ng ch\u1EDD x\u00E1c nh\u1EADn.";
                default -> "C\u1EADp nh\u1EADt \u0111\u01A1n h\u00E0ng " + order.getOrderCode();
            };

            notifications.add(Notification.builder()
                    .user(order.getUser())
                    .title("C\u1EADp nh\u1EADt \u0111\u01A1n h\u00E0ng " + order.getOrderCode())
                    .message(statusMsg)
                    .type(Notification.Type.ORDER)
                    .isRead(order.getStatus() == Order.Status.DELIVERED)
                    .build());
        }

        notificationRepository.saveAll(notifications);
        log.info("Seeded {} notifications", notifications.size());
    }

    // ==================== WISHLISTS ====================

    private void seedWishlists() {
        log.info("Seeding wishlists...");
        List<Wishlist> wishlists = new ArrayList<>();
        Random rand = new Random(42);

        for (User customer : customers) {
            Set<Integer> chosen = new HashSet<>();
            int count = 2 + rand.nextInt(2);
            for (int i = 0; i < count; i++) {
                int bIdx;
                do {
                    bIdx = rand.nextInt(allBooks.size());
                } while (chosen.contains(bIdx));
                chosen.add(bIdx);

                wishlists.add(Wishlist.builder()
                        .user(customer)
                        .book(allBooks.get(bIdx))
                        .build());
            }
        }

        wishlistRepository.saveAll(wishlists);
        log.info("Seeded {} wishlist items", wishlists.size());
    }

    // ==================== HELPERS ====================

    private String uploadImage(String sourceUrl, String folder) {
        try {
            return cloudinaryService.uploadFromUrl(sourceUrl, folder);
        } catch (Exception e) {
            log.warn("Failed to upload image to Cloudinary: {}. Using fallback URL.", e.getMessage());
            return sourceUrl;
        }
    }
}
