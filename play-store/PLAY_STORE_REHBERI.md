# 🚀 Kavşak Kaosu — Google Play Store Yayınlama Rehberi

Bu klasör, **Kavşak Kaosu** oyununu Google Play Console üzerinden yayınlamak için gereken tüm teknik çıktıları, görselleri ve mağaza metinlerini içerir.

---

## 📦 Hazırlanan Dosyalar
- **İmzalı Uygulama Paketi (.aab):** `play-store/KavsakKaosu-release.aab` (Google Play'e yüklenecek dosya)
- **Uygulama İkonu (512x512 PNG):** `play-store/icon-512.png`
- **Öne Çıkan Grafik (1024x500 PNG):** `play-store/feature-graphic-1024x500.png`
- **Gizlilik Politikası (HTML):** `play-store/privacy-policy.html`
- **Yükleme Anahtarı (Keystore):** `android/app/kavsakkaosu-upload.keystore` *(ÇOK ÖNEMLİ: Bu dosyayı ve `android/keystore.properties` şifrelerini mutlaka güvenli bir yere yedekle! Kaybedersen mevcut uygulamaya güncelleme atamazsın.)*

---

## 📝 Mağaza Girişi (Kopyala-Yapıştır Metinler)

### Uygulama Adı (maks. 30 karakter)
`Kavşak Kaosu`

### Kısa Açıklama (maks. 80 karakter)
`Trafik ışıklarını yönet, Nitro Turbo ver, Zamanı Yavaşlat! Kavşakta kaosu önle.`

### Tam Açıklama (Türkçe)
```text
🚦 KAVŞAK KAOSU — Şehir Trafiği Senin Ellerinde!

Dört yönden akın eden araçlar, sabırsız sürücüler, acil durum ambulansları ve VIP konvoylar... Tek bir yanlış ışık kararı tüm kavşağı kaosa sürükleyebilir!

✨ ÖNE ÇIKAN ÖZELLİKLER:
• 🚦 Akıllı Trafik Kontrolü: 4 köşedeki ışıklara tek tek dokun veya alttaki Kuzey-Güney / Doğu-Batı / Tümü Dur hızlı tuşlarını kullan.
• 💨 Nitro Turbo Dokunuşu: Hareket halindeki herhangi bir araca dokunarak anında hızlandır ve son milisaniye çarpışmalarını önle!
• ⏱️ Zamanı Yavaşlat (Slow-Mo): Enerji barını doldur, en kaotik anlarda zamanı yavaşlatarak imkansız kurtarışlar yap.
• 🌦️ Canlı Şehir & Hava Döngüsü: Gündüz, Gün Batımı, farların parladığı Gece ve yolların kayganlaştığı Yağmur atmosferinde oyna.
• 👑 VIP Konvoylar & 🚑 Ambulanslar: Özel araçlara öncelik ver, ekstra puan ve enerji kazan.
• 🎯 Canlı Mini Görevler & 🔥 2x Ateş Modu: Görevleri tamamla, seri kombo yakala ve skorunu katla.
• 📤 Sosyal Medya Paylaşımı: Rekorunu tek dokunuşla WhatsApp, X ve diğer platformlarda arkadaşlarınla paylaş!

Reflekslerine güveniyorsan hemen indir ve kavşağın kontrolünü ele al!
```

### Sürüm Notları (v1.1.0)
```text
İlk Play Store sürümü!
• Tam ekran detaylı şehir ortamı (park, kafe meydanı, apartmanlar, heliport)
• Araca dokunarak Nitro Turbo hızlandırma
• Zamanı Yavaşlatma (Slow-Mo) gücü
• Canlı Gündüz/Gün Batımı/Gece/Yağmur döngüsü
• VIP Konvoylar, Ambulanslar, Canlı Görevler ve 2x Ateş Modu
• Sosyal medyada skor paylaşımı
```

---

## 🛡️ Play Console Form Cevapları

1. **Veri Güvenliği (Data Safety):**
   - *"Uygulamanız kullanıcı verilerinin herhangi birini topluyor veya paylaşıyor mu?"* → **Hayır**
   - Gizlilik Politikası URL'si: `https://ferdikocaa.github.io/kavsak-kaosu/privacy-policy.html` (GitHub Pages üzerinde yayında)
2. **İçerik Derecelendirmesi (Content Rating — IARC):**
   - Kategori: **Oyun (Arcade / Aksiyon)**
   - Şiddet, kan, kumar, uygunsuz dil, kullanıcılar arası sohbet: **Hayır** → Otomatik olarak **PEGI 3 / Herkes (Everyone)** alır.
3. **Hedef Kitle:** 13+ veya Tüm Yaşlar (Reklam ve veri toplama olmadığı için sorunsuz onaylanır).
4. **Reklamlar:** *"Uygulamanız reklam içeriyor mu?"* → **Hayır**.
5. **Uygulama Erişimi:** Giriş gerektirmez, tüm özellikler herkese açık.

---

## ✅ Google Play Console Adım Adım Yükleme
1. [Google Play Console](https://play.google.com/console) hesabına giriş yap (yoksa tek seferlik \$25 geliştirici kaydı gerekir).
2. **Uygulama Oluştur** → Ad: `Kavşak Kaosu`, Varsayılan dil: `Türkçe`, Tür: `Oyun`, Ücretsiz.
3. **Mağaza Ayarları → Ana Mağaza Girişi** kısmına yukarıdaki metinleri, `icon-512.png` ikonunu, `feature-graphic-1024x500.png` öne çıkan grafiği ve telefonundan alacağın **en az 2 ekran görüntüsünü** (oyun içi + menü) yükle.
4. **Uygulama İçeriği** bölümündeki Gizlilik Politikası, Reklamlar, İçerik Derecelendirmesi ve Veri Güvenliği formlarını tamamla.
5. **Test → Kapalı Test** (yeni bireysel hesaplarda Play Store 14 gün boyunca 12 test kullanıcısı ister) veya **Üretim → Yeni Sürüm Oluştur** ekranına gidip `play-store/KavsakKaosu-release.aab` dosyasını yükle ve incelemeye gönder!
