# Contributing Guidelines

Terima kasih atas minat Anda untuk berkontribusi pada Sistem Penilaian Sekolah Dasar! 🎉

## Cara Berkontribusi

### 1. Melaporkan Bug 🐛

Jika Anda menemukan bug, mohon buat issue dengan informasi:
- **Deskripsi bug**: Jelaskan apa yang terjadi
- **Langkah reproduksi**: Cara untuk mengulang bug
- **Expected behavior**: Apa yang seharusnya terjadi
- **Screenshots**: Jika memungkinkan
- **Environment**: OS, browser, Node.js version

### 2. Request Fitur Baru 💡

Untuk mengajukan fitur baru:
- Buka issue dengan label "feature request"
- Jelaskan use case dan manfaatnya untuk guru/sekolah
- Diskusikan implementasi yang memungkinkan

### 3. Code Contribution 👨‍💻

#### Setup Development Environment

```bash
# Fork repository di GitHub
# Clone repository Anda
git clone https://github.com/your-username/sekolah-dasar-app.git
cd sekolah-dasar-app

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan database credentials Anda

# Setup database
npx prisma generate
npx prisma db push

# Jalankan development server
npm run dev
```

#### Workflow Contribution

1. **Buat branch baru**
```bash
git checkout -b feature/nama-fitur
# atau
git checkout -b bugfix/nama-bug
```

2. **Commit dengan pesan yang jelas**
```bash
git commit -m "feat: tambah fitur export PDF"
git commit -m "fix: perbaiki bug kalkulasi rata-rata"
git commit -m "docs: update README installation steps"
```

3. **Push dan buat Pull Request**
```bash
git push origin feature/nama-fitur
```

#### Code Style Guidelines

- **TypeScript**: Wajib menggunakan TypeScript
- **ESLint**: Jalankan `npm run lint` sebelum commit
- **Prettier**: Format kode dengan konsisten
- **Comments**: Tulis komentar dalam Bahasa Indonesia
- **Naming**: Gunakan camelCase untuk variabel, PascalCase untuk komponen

#### Testing

```bash
# Jalankan linting
npm run lint

# Test build
npm run build

# Test semua fitur utama:
# - Register/Login
# - CRUD mata pelajaran
# - CRUD siswa & nilai
# - Export Excel
```

### 4. Documentation 📚

Bantuan untuk dokumentasi sangat diterima:
- Perbaikan README.md
- Tambah contoh penggunaan
- Translation ke bahasa daerah
- Tutorial video

## Code Review Process

1. **Automated checks**: PR harus pass semua checks otomatis
2. **Manual review**: Tim akan review kode Anda
3. **Testing**: Pastikan fitur bekerja di development
4. **Approval**: Setelah approved, PR akan di-merge

## Priority Features

Fitur yang paling dibutuhkan saat ini:

### High Priority 🔥
- [ ] Bulk import siswa via CSV
- [ ] Print functionality untuk laporan
- [ ] Dashboard analytics dengan charts
- [ ] Multi-semester support
- [ ] Backup data otomatis

### Medium Priority ⭐
- [ ] Parent portal untuk orang tua
- [ ] Mobile responsive improvements
- [ ] Dark mode theme
- [ ] Advanced search & filter
- [ ] Data validation enhancements

### Low Priority 💡
- [ ] Multi-language support
- [ ] Integration dengan sistem lain
- [ ] Advanced reporting
- [ ] Mobile app (React Native)
- [ ] Real-time notifications

## Development Guidelines

### Database Changes
- Selalu buat migration untuk perubahan schema
- Test migration di development dulu
- Dokumentasikan breaking changes

### API Changes
- Maintain backward compatibility
- Update API documentation
- Add proper error handling
- Include input validation

### UI/UX
- Ikuti design system yang ada
- Pastikan responsive di semua device
- Test accessibility
- Consistent dengan tema blue/white

### Security
- Validate semua input
- Sanitize data sebelum disimpan
- Protect sensitive endpoints
- Follow OWASP guidelines

## Community Guidelines

### Be Respectful 🤝
- Hormati kontributor lain
- Berikan feedback yang konstruktif
- Bantu newcomer dengan sabar

### Bahasa Indonesia First 🇮🇩
- Comments dalam kode: Bahasa Indonesia
- Documentation: Bahasa Indonesia
- UI text: Bahasa Indonesia
- Issues/PR: Bahasa Indonesia atau English OK

### Educational Focus 🎓
- Prioritaskan fitur yang membantu guru
- Pertimbangkan kemudahan penggunaan
- Think about rural school contexts
- Keep it simple but powerful

## Recognition

Kontributor akan diakui di:
- README.md contributors section
- CHANGELOG.md untuk setiap release
- Website credits page (jika ada)
- Social media appreciation

## Questions?

Jika ada pertanyaan:
- Buka issue dengan label "question"
- Email: [your-email@example.com]
- Diskusi di GitHub Discussions

---

**Setiap kontribusi, sekecil apapun, sangat berarti untuk kemajuan pendidikan Indonesia! 🚀**

Happy coding! 👨‍💻👩‍💻