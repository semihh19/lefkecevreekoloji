const SPREADSHEET_ID = '19so6Ibxxctln8kGnr_T2S33Y0WTUzJHjhJL2TmgP99c';
const SHEET_NAME = 'Sayfa1'; 
const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

let newsList = []; // Excel'den gelen tüm haberleri bu dizide depolayacağız

document.addEventListener("DOMContentLoaded", () => {
    tablodanHaberleriCek();
    setupModalEvents(); // Pop-up kapatma dinleyicilerini kur
});

function tablodanHaberleriCek() {
    fetch(url)
        .then(res => res.text())
        .then(data => {
            const jsonData = JSON.parse(data.substring(47, data.length - 2));
            const rows = jsonData.table.rows;
            
            const featuredContainer = document.getElementById('featured-news-container');
            const gridContainer = document.getElementById('older-news-grid');
            
            featuredContainer.innerHTML = '';
            gridContainer.innerHTML = '';
            newsList = []; // Listeyi temizle

            // 1. Gelen tüm satırları temiz bir diziye aktaralım
            rows.forEach(row => {
                const c = row.c;
                newsList.push({
                    baslik: c[0] ? c[0].v : '',
                    ozet: c[1] ? c[1].v : '',
                    tarih: c[2] ? c[2].v : '',
                    resim: c[3] ? c[3].v : ''
                });
            });

            if (newsList.length === 0) return;

            // 2. EN YENİ HABER (Listenin sonundaki eleman)
            const featuredIndex = newsList.length - 1;
            const enYeniHaber = newsList[featuredIndex];
            
            if (enYeniHaber.baslik) {
                featuredContainer.innerHTML = `
                    <div class="featured-card" onclick="openModal(${featuredIndex})">
                        <div class="featured-img-wrapper">
                            <span class="badge"><i class="fa-solid fa-fire"></i> SON DAKİKA</span>
                            <img src="${enYeniHaber.resim}" alt="${enYeniHaber.baslik}">
                        </div>
                        <div class="featured-info">
                            <span class="meta-date"><i class="fa-regular fa-calendar"></i> ${enYeniHaber.tarih}</span>
                            <h2>${enYeniHaber.baslik}</h2>
                            <p>${enYeniHaber.ozet}</p>
                        </div>
                    </div>
                `;
            }

            // 3. DİĞER ESKİ HABERLER (Sondan ikinci elemandan geriye doğru)
            let animasyonGecikmesi = 0.1;

            for (let i = newsList.length - 2; i >= 0; i--) {
                const eskiHaber = newsList[i];

                if (!eskiHaber.baslik) continue;

                const haberKarti = `
                    <div class="news-card" style="animation-delay: ${animasyonGecikmesi}s" onclick="openModal(${i})">
                        <div class="card-img-wrapper">
                            <img src="${eskiHaber.resim}" alt="${eskiHaber.baslik}">
                        </div>
                        <div class="card-body">
                            <span class="meta-date"><i class="fa-regular fa-calendar"></i> ${eskiHaber.tarih}</span>
                            <h3>${eskiHaber.baslik}</h3>
                            <p>${eskiHaber.ozet}</p>
                        </div>
                    </div>
                `;
                gridContainer.innerHTML += haberKarti;
                animasyonGecikmesi += 0.1;
            }
        })
        .catch(err => {
            console.error("Hata:", err);
            document.getElementById('featured-news-container').innerHTML = "<p style='color:red;'>Haberler şu an yüklenemedi.</p>";
        });
}

// 🚨 POP-UP AÇMA SİHRİ
function openModal(index) {
    const haber = newsList[index];
    if (!haber) return;

    // Pop-up elemanlarının içine veriyi basıyoruz
    document.getElementById('modal-img').src = haber.resim;
    document.getElementById('modal-img').alt = haber.baslik;
    document.getElementById('modal-date').innerHTML = `<i class="fa-regular fa-calendar"></i> ${haber.tarih}`;
    document.getElementById('modal-title').innerText = haber.baslik;
    document.getElementById('modal-text').innerText = haber.ozet;

    const modal = document.getElementById('news-modal');
    modal.style.display = 'flex';
    
    // Animasyonun pürüzsüz devreye girmesi için ufak bir gecikmeyle class ekliyoruz
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // Pop-up açıkken arkadaki ana sayfa kaymasın diye scrollu kilitliyoruz
    document.body.style.overflow = 'hidden';
}

// POP-UP KAPATMA OLAYLARI
function setupModalEvents() {
    const modal = document.getElementById('news-modal');
    const closeBtn = document.querySelector('.close-btn');

    if (!modal || !closeBtn) return;

    // Çarpı butonuna basınca kapat
    closeBtn.addEventListener('click', closeModal);

    // Pop-up dışındaki fluluğa (boşluğa) tıklayınca kapat
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('news-modal');
    modal.classList.remove('show');
    
    // Kapanış animasyonu (0.3 saniye) bittikten sonra tamamen gizle
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);

    // Sayfa scrollunu tekrar serbest bırak
    document.body.style.overflow = 'auto';
}