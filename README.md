# 🚀 OnlyFTP - Web-Based FTP & SFTP Client

[TR] Bu proje, tarayıcı üzerinden FTP ve SFTP sunucularınıza erişmenizi, dosyalarınızı yönetmenizi ve hatta kodlarınızı anlık olarak düzenlemenizi sağlayan modern bir web arayüzüdür. Masaüstü uygulamalarıyla uğraşmak istemeyenler veya her yerden erişim sağlamak isteyen geliştiriciler için hazırlandı.

[EN] This project is a modern web interface that allows you to access your FTP and SFTP servers, manage your files, and even edit your code on the fly directly from your browser. It's built for developers who want to avoid bulky desktop apps or need quick access from anywhere.

---

## ✨ Özellikler / Features

### 🇹🇷 Türkçe
- **FTP & SFTP Desteği:** Hem klasik FTP hem de güvenli SFTP protokollerini destekler.
- **Dosya Gezgini:** Sunucudaki dosyalar arasında hızlıca gezinin, klasör oluşturun veya silin.
- **Dahili Kod Editörü:** Monaco Editor (VS Code altyapısı) sayesinde dosyalarınızı tarayıcıda açıp düzenleyin.
- **Sürükle-Bırak Yükleme:** Dosyalarınızı doğrudan tarayıcıya sürükleyerek sunucuya yükleyin.
- **Bağlantı Yönetimi:** Sık kullandığınız sunucuları kaydedin ve tek tıkla bağlanın.

### 🇺🇸 English
- **FTP & SFTP Support:** Supports both traditional FTP and secure SFTP protocols.
- **File Explorer:** Quickly navigate through server files, create folders, or delete items.
- **Built-in Code Editor:** Powered by Monaco Editor (the engine behind VS Code), edit your files directly in the browser.
- **Drag-and-Drop Upload:** Simply drag your files into the browser to upload them to your server.
- **Connection Management:** Save your frequently used servers and connect with a single click.

---

## 🛠️ Teknolojiler / Tech Stack

Bu proje modern ve performanslı bir yapı üzerine kuruldu:
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Express.js (Custom Server), Prisma ORM
- **State Management:** Zustand
- **Editor:** Monaco Editor
- **Database:** PostgreSQL (Docker ile kolay kurulum)

---

## 🚀 Kurulum / Installation

### 1. Depoyu Klonlayın / Clone the Repo
```bash
git clone https://github.com/onlycmd/onlyftp.git
cd onlyftp
```

### 2. Bağımlılıkları Yükleyin / Install Dependencies
```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın / Setup Environment Variables
`.env` dosyasını oluşturun ve gerekli bilgileri girin (Veritabanı URL'si vb.):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ftp_db"
ENCRYPTION_KEY="32-karakterli-guvenli-bir-anahtar"
PORT=3000
```

### 4. Veritabanını Hazırlayın / Prepare Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Uygulamayı Başlatın / Start the App
```bash
npm run dev
```

---

## 🌟 Destek Olun / Support Us

### 🇹🇷 Türkçe
Eğer bu projeyi faydalı bulduysanız, daha fazla kişiye ulaşmasına yardımcı olmak için bir **⭐️ Star** bırakabilirsiniz.  
Projeyi geliştirmek adına **Fork**’layıp kendi katkılarınızı eklemeniz de büyük destek sağlar.  
Her türlü desteğiniz, projenin sürdürülebilirliği ve gelişimi için çok değerlidir.

### 🇺🇸 English
If you find this project useful, please consider leaving a **⭐️ Star** to help it reach more people.  
You can also **Fork** the repository to contribute improvements or new ideas.  
Your support is vital for the growth and sustainability of this project.

---

## 🤝 Katkıda Bulunun / Contributing

### 🇹🇷 Türkçe
Katkılara tamamen açığız.  
Hata düzeltmeleri, iyileştirmeler veya yeni özellikler için:

1. Projeyi **Fork**’layın  
2. Değişikliklerinizi yapın  
3. Bir **Pull Request** açın  

Her katkı dikkatle incelenir ve projeye değer katan tüm geri bildirimler memnuniyetle karşılanır.

### 🇺🇸 English
Contributions are always welcome.  
For bug fixes, improvements, or new features:

1. **Fork** the repository  
2. Make your changes  
3. Submit a **Pull Request**

All contributions are reviewed carefully, and any feedback that adds value to the project is appreciated.

---

## 📝 Notlar ve Uyarılar / Notes & Warnings

> **[TR]** Bu proje henüz "fırından yeni çıktı" diyebiliriz. Kodları derinlemesine tarayıp her köşesini temizlemedim, bu yüzden sağda solda ufak tefek (belki de büyük) hatalarla karşılaşabilirsiniz. Eğer bir hata görürseniz şaşırmayın, hatta direkt dalıp düzeltirseniz harika olur. Geliştirmeye açık bir proje, el birliğiyle daha iyi hale getirebiliriz.
>
> **[EN]** This project is pretty much "fresh out of the oven." I haven't done a deep dive to squash every single bug, so don't be surprised if you run into some issues here and there. If you find a bug, don't just stare at it—feel free to jump in and fix it! It's an open project, and we can make it better together.

---

**Made with 💖 by [onlycmd]**
