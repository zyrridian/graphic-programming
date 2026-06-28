# LAPORAN PROYEK UTS

## Pengembangan Prototype First Person View pada Proyek exam-mid

Pada proyek ini, saya membangun prototype game first person berbasis web dengan memanfaatkan Blender untuk pembuatan map dan Three.js untuk rendering serta interaksi di browser. Alur kerjanya dimulai dari pembuatan lingkungan 3D sederhana, lalu dilanjutkan dengan implementasi kontrol player, audio, collision, dan antarmuka dasar sampai project bisa dijalankan melalui Vite.

Secara singkat, fokus pengembangannya ada pada tiga hal utama:
- pembuatan map 3D yang layak dijelajahi dari sudut pandang first person,
- implementasi kontrol gerak dan collision agar pergerakan terasa natural,
- penyusunan struktur kode modular supaya mudah dikembangkan lagi.

Tahap awal dikerjakan di Blender dengan menyusun map dari object dasar seperti persegi, persegi panjang berlubang, floor, dan wall. Supaya scene tidak terlalu kaku, setiap komponen diberikan texture dari gambar. Saya juga menambahkan satu object cylinder dari aset gratis online sebagai bahan uji coba integrasi model eksternal ke dalam lingkungan utama. Setelah bentuk keseluruhan map sesuai, setiap komponen diberi ketebalan menggunakan modifier Solidify agar dinding dan objek tidak terlihat tipis saat dirender dari sudut first person.

Model kemudian diekspor ke format .glb. Secara praktis, .glb adalah versi biner dari glTF yang menggabungkan data mesh, material, dan texture dalam satu file, jadi lebih ringkas dan mudah dibawa ke pipeline web. Format ini cocok untuk Three.js karena proses loading relatif cepat dan minim konfigurasi tambahan. Saat ekspor, opsi Apply Modifiers diaktifkan agar hasil Solidify ikut tersimpan di file akhir. Kalau opsi ini tidak diaktifkan, ketebalan yang terlihat di Blender bisa hilang ketika model dibuka di aplikasi.

Setelah asset map siap, struktur kode JavaScript dipisah ke beberapa modul inti pada folder core supaya logikanya rapi dan gampang dirawat. Modul audio bertanggung jawab untuk ambient music dan efek suara seperti langkah kaki, lompat, mendarat, serta tembakan sederhana berbasis Web Audio API. Modul config menampung nilai konstanta seperti parameter kamera, kecepatan gerak, gravitasi, volume, dan path asset sehingga penyesuaian gameplay bisa dilakukan dari satu tempat. Modul input mengatur pembacaan keyboard untuk WASD, sprint, crouch, dan jump.

Bagian terpenting ada di player-controller yang menangani perilaku player first person: pergerakan horizontal, transisi tinggi badan saat crouch, efek gravitasi, lompatan, serta sinkronisasi audio langkah berdasarkan kecepatan. Modul scene dipakai untuk inisialisasi scene, camera, renderer, lighting, dan resize handler saat ukuran window berubah. Modul ui mengelola pointer/crosshair merah di tengah layar dan mekanisme pointer lock. Sementara itu, modul world memuat map .glb dengan GLTFLoader dan menangani collision menggunakan raycaster, baik untuk deteksi dinding maupun jarak player ke lantai.

Supaya lebih mudah dipahami, pembagian modul intinya bisa diringkas seperti ini:
- modul sistem: scene, world, dan config,
- modul interaksi pemain: input dan player-controller,
- modul pengalaman pengguna: ui dan audio.

Semua modul tersebut diintegrasikan lewat main.js. Di sana aplikasi melakukan inisialisasi scene, kamera, renderer, pointer lock controls, world, audio manager, input manager, dan player controller. Setelah map berhasil dimuat, game loop dijalankan dengan requestAnimationFrame untuk update per frame dan render scene secara real-time. Di sisi HTML, tampilan disiapkan dengan canvas Three.js, crosshair merah, dan HUD instruksi kontrol agar pengguna langsung paham cara menjalankan demo.

Untuk menjalankan proyek, environment development menggunakan Vite. Langkahnya sederhana: install dependency terlebih dahulu jika belum, lalu jalankan npx vite atau npm run dev jika script sudah terdefinisi di package.json. Setelah server aktif, aplikasi bisa dibuka di browser dari alamat lokal yang diberikan Vite.

Kontrol utama saat demo berjalan:
- klik layar untuk mengaktifkan pointer lock,
- WASD untuk bergerak, Shift untuk sprint, Ctrl untuk crouch,
- Space untuk jump dan klik kiri mouse untuk trigger efek tembakan.

Secara hasil, prototype ini sudah menunjukkan fondasi game first person yang cukup solid untuk level UTS: navigasi terasa responsif, collision bekerja di dinding dan lantai, audio sudah terintegrasi, dan struktur kode modular memudahkan pengembangan fitur lanjutan. Dengan fondasi ini, proyek bisa dilanjutkan ke tahap berikutnya seperti interaksi objek, AI musuh, objective system, atau visual polishing.

## Dokumentasi

Video demo:
https://drive.google.com/file/d/1sxG3Mo-BEOMxxt6lfN9oOEUEl-XpcabK/view?usp=sharing

Repository GitHub:
https://github.com/zyrridian/graphic-programming