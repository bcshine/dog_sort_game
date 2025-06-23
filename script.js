// ==== Individual Trial Activation 라이센스 관리 시스템 (30일 한정) ====
const LICENSE_DURATION_DAYS = 30;
const WARNING_THRESHOLD_DAYS = 5;

// 라이센스 초기화 및 검증
function initializeLicense() {
    try {
        const activationDate = localStorage.getItem('dogGameActivationDate');
        const currentDate = new Date();
        
        if (!activationDate) {
            // 첫 실행 - 활성화 날짜 저장
            const activationTimestamp = currentDate.getTime();
            localStorage.setItem('dogGameActivationDate', activationTimestamp.toString());
            console.log('라이센스 활성화: 30일 체험판 시작');
            showLicenseWelcome();
            return true;
        }
        
        // 기존 사용자 - 남은 일수 계산
        const activationTimestamp = parseInt(activationDate);
        const activationDateObj = new Date(activationTimestamp);
        const daysPassed = Math.floor((currentDate - activationDateObj) / (1000 * 60 * 60 * 24));
        const daysRemaining = LICENSE_DURATION_DAYS - daysPassed;
        
        console.log(`라이센스 상태: ${daysPassed}일 지남, ${daysRemaining}일 남음`);
        
        if (daysRemaining <= 0) {
            // 라이센스 만료
            showLicenseExpired();
            return false;
        } else if (daysRemaining <= WARNING_THRESHOLD_DAYS) {
            // 만료 임박 경고
            showLicenseWarning(daysRemaining);
            return true;
        }
        
        return true;
    } catch (error) {
        console.error('라이센스 검증 오류:', error);
        return true; // 오류 시 게임 허용
    }
}

// 라이센스 환영 메시지
function showLicenseWelcome() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'license-welcome';
    welcomeDiv.innerHTML = `
        <div class="license-modal">
            <h2>🎉 강아지 품종 맞추기 게임에 오신 것을 환영합니다!</h2>
            <p>30일 무료 체험판이 시작되었습니다.</p>
            <p>마음껏 즐기세요! 🐕</p>
            <button onclick="closeLicenseModal()" class="license-btn">시작하기</button>
        </div>
    `;
    document.body.appendChild(welcomeDiv);
}

// 라이센스 만료 임박 경고
function showLicenseWarning(daysRemaining) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'license-warning';
    warningDiv.innerHTML = `
        <div class="license-modal warning">
            <h2>⚠️ 체험판 만료 임박</h2>
            <p>체험판이 <strong>${daysRemaining}일</strong> 후에 만료됩니다.</p>
            <p>계속 이용하시려면 정식 버전을 구매해주세요.</p>
            <button onclick="closeLicenseModal()" class="license-btn">계속 게임하기</button>
        </div>
    `;
    document.body.appendChild(warningDiv);
}

// 라이센스 만료 화면
function showLicenseExpired() {
    document.body.innerHTML = `
        <div class="license-expired">
            <div class="expired-container">
                <h1>🚫 체험판이 만료되었습니다</h1>
                <p>30일 체험 기간이 종료되었습니다.</p>
                <p>게임을 계속 이용하시려면 정식 버전을 구매해주세요.</p>
                <div class="expired-actions">
                    <button onclick="resetLicense()" class="reset-btn">개발자용: 라이센스 초기화</button>
                    <button onclick="window.close()" class="close-btn">창 닫기</button>
                </div>
            </div>
        </div>
    `;
}

// 라이센스 모달 닫기
function closeLicenseModal() {
    const modals = document.querySelectorAll('.license-welcome, .license-warning');
    modals.forEach(modal => modal.remove());
}

// 개발자용 라이센스 초기화 기능
function resetLicense() {
    if (confirm('정말로 라이센스를 초기화하시겠습니까?\n(개발자 전용 기능입니다)')) {
        localStorage.removeItem('dogGameActivationDate');
        alert('라이센스가 초기화되었습니다. 페이지를 새로고침합니다.');
        location.reload();
    }
}

// 페이지 로드 시 라이센스 검증
document.addEventListener('DOMContentLoaded', function() {
    if (!initializeLicense()) {
        return; // 라이센스 만료 시 게임 차단
    }
});

// ==== 게임 코드 시작 ====

// 게임 상태
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// 강아지 데이터를 난이도별로 분류 - 총 58종 포함
const dogBreeds = {
    // 쉬운 난이도 - 매우 유명한 강아지들 (20종)
    easy: [
        { image: 'dg5_huski.jpg', name: '허스키', options: ['허스키', '알래스칸 말라뮤트', '사모예드', '저먼 셰퍼드'] },
        { image: 'dg44_Siberian Husky .webp', name: '시베리안 허스키', options: ['시베리안 허스키', '알래스칸 말라뮤트', '사모예드', '저먼 셰퍼드'] },
        { image: 'dg3_litriber.webp', name: '골든 리트리버', options: ['래브라도', '골든 리트리버', '저먼 셰퍼드', '허스키'] },
        { image: 'dg22_Golden Retriever .jpeg', name: '골든 리트리버', options: ['골든 리트리버', '래브라도', '저먼 셰퍼드', '허스키'] },
        { image: 'dg28_Labrador Retriever .jpeg', name: '래브라도 리트리버', options: ['래브라도 리트리버', '골든 리트리버', '저먼 셰퍼드', '허스키'] },
        { image: 'dg7_poodle.jpg', name: '푸들', options: ['푸들', '몰티즈', '비숑 프리제', '요크셔 테리어'] },
        { image: 'dg37_Poodle .jpeg', name: '푸들', options: ['푸들', '몰티즈', '비숑 프리제', '요크셔 테리어'] },
        { image: 'dg2_bulldog.jpg', name: '불독', options: ['불독', '퍼그', '프렌치 불독', '복서'] },
        { image: 'dg20_English Bulldog .avif', name: '잉글리시 불독', options: ['잉글리시 불독', '프렌치 불독', '퍼그', '복서'] },
        { image: 'dg9_chiwawa.jpg', name: '치와와', options: ['치와와', '포메라니안', '요크셔 테리어', '말티즈'] },
        { image: 'dg1_shephard.webp', name: '저먼 셰퍼드', options: ['저먼 셰퍼드', '골든 리트리버', '허스키', '보더 콜리'] },
        { image: 'dg58_pugdog.jpg', name: '퍼그', options: ['퍼그', '프렌치 불독', '불독', '치와와'] },
        { image: 'dg6_begle.jpg', name: '비글', options: ['비글', '바셋 하운드', '코커 스패니얼', '잭 러셀 테리어'] },
        { image: 'dg55_Beagle .jpeg', name: '비글', options: ['비글', '바셋 하운드', '코커 스패니얼', '잭 러셀 테리어'] },
        { image: 'dg18_martiz.jpg', name: '말티즈', options: ['말티즈', '비숑 프리제', '푸들', '요크셔 테리어'] },
        { image: 'dg30_Maltese .jpeg', name: '말티즈', options: ['말티즈', '비숑 프리제', '푸들', '요크셔 테리어'] },
        { image: 'dg36_Pomeranian .avif', name: '포메라니안', options: ['포메라니안', '치와와', '요크셔 테리어', '말티즈'] },
        { image: 'dg46_Yorkshire Terrier .jpeg', name: '요크셔 테리어', options: ['요크셔 테리어', '말티즈', '치와와', '포메라니안'] },
        { image: 'dg39_Samoyed.jpeg', name: '사모예드', options: ['사모예드', '허스키', '알래스칸 말라뮤트', '저먼 셰퍼드'] },
        { image: 'dg45_Welsh Corgi .jpg', name: '웰시 코기', options: ['웰시 코기', '보더 콜리', '저먼 셰퍼드', '오스트레일리안 셰퍼드'] }
    ],
    
    // 중간 난이도 - 어느 정도 알려진 강아지들 (19종)
    medium: [
        { image: 'dg4_frenchbulldog.jpg', name: '프렌치 불독', options: ['프렌치 불독', '불독', '퍼그', '보스턴 테리어'] },
        { image: 'dg21_French Bulldog .webp', name: '프렌치 불독', options: ['프렌치 불독', '불독', '퍼그', '보스턴 테리어'] },
        { image: 'dg8_alaskanmalamute.jpg', name: '알래스칸 말라뮤트', options: ['알래스칸 말라뮤트', '허스키', '사모예드', '저먼 셰퍼드'] },
        { image: 'dg17_bordercolie.jpg', name: '보더 콜리', options: ['보더 콜리', '오스트레일리안 셰퍼드', '저먼 셰퍼드', '웰시 코기'] },
        { image: 'dg19_Doberman Pinscher .jpeg', name: '도베르만 핀셔', options: ['도베르만 핀셔', '로트와일러', '저먼 셰퍼드', '핏불'] },
        { image: 'dg38_Rottweiler .jpg', name: '로트와일러', options: ['로트와일러', '도베르만', '저먼 셰퍼드', '불 마스티프'] },
        { image: 'dg42_Shiba Inu .avif', name: '시바 이누', options: ['시바 이누', '진돗개', '아키타', '호크카이도'] },
        { image: 'dg27_Korean Jindo .jpeg', name: '진돗개', options: ['진돗개', '시바 이누', '아키타', '호크카이도'] },
        { image: 'dg43_Shih Tzu .webp', name: '시츄', options: ['시츄', '라사 압소', '말티즈', '페키니즈'] },
        { image: 'dg52_Boston Terrier .jpeg', name: '보스턴 테리어', options: ['보스턴 테리어', '프렌치 불독', '불독', '퍼그'] },
        { image: 'dg24_Jack Russell Terrier .jpeg', name: '잭 러셀 테리어', options: ['잭 러셀 테리어', '폭스 테리어', '파슨 러셀 테리어', '비글'] },
        { image: 'dg50_Chow Chow .jpeg', name: '차우차우', options: ['차우차우', '포메라니안', '사모예드', '스피츠'] },
        { image: 'dg31_Maltipoo .avif', name: '말티푸', options: ['말티푸', '푸들', '말티즈', '비숑 프리제'] },
        { image: 'dg32_Miniature Schnauzer .jpeg', name: '미니어처 슈나우저', options: ['미니어처 슈나우저', '스탠다드 슈나우저', '요크셔 테리어', '와이어 폭스 테리어'] },
        { image: 'dg47_Dalmatian.webp', name: '달마시안', options: ['달마시안', '포인터', '잉글리시 세터', '비즐라'] },
        { image: 'dg25_Japanese Spitz .jpeg', name: '재패니즈 스피츠', options: ['재패니즈 스피츠', '포메라니안', '사모예드', '아메리칸 에스키모'] },
        { image: 'dg41_Shetland Sheepdog.jpg', name: '셰틀랜드 셰퍼드', options: ['셰틀랜드 셰퍼드', '러프 콜리', '보더 콜리', '오스트레일리안 셰퍼드'] },
        { image: 'dg49_Cocker Spaniel .jpeg', name: '코커 스패니얼', options: ['코커 스패니얼', '잉글리시 스프링어 스패니얼', '카발리에 킹 찰스 스패니얼', '비글'] },
        { image: 'dg53_Bichon Frisé .jpeg', name: '비숑 프리제', options: ['비숑 프리제', '말티즈', '푸들', '코통 드 튈레아'] }
    ],
    
    // 어려운 난이도 - 전문적 지식이 필요한 강아지들 (19종)
    hard: [
        { image: 'dg10_dakshoont.jpg', name: '닥스훈트', options: ['닥스훈트', '비글', '코커 스패니얼', '바셋 하운드'] },
        { image: 'dg11_burnizmountaindog.webp', name: '버니즈 마운틴 독', options: ['버니즈 마운틴 독', '세인트 버나드', '그레이트 피레니즈', '뉴펀들랜드'] },
        { image: 'dg54_Bernese Mountain Dog .avif', name: '버니즈 마운틴 독', options: ['버니즈 마운틴 독', '세인트 버나드', '그레이트 피레니즈', '뉴펀들랜드'] },
        { image: 'dg12_australiancatledog.webp', name: '오스트레일리안 캐틀 독', options: ['오스트레일리안 캐틀 독', '보더 콜리', '오스트레일리안 셰퍼드', '웰시 코기'] },
        { image: 'dg14_lotbailer.webp', name: '로트와일러', options: ['로트와일러', '도베르만', '저먼 셰퍼드', '불 마스티프'] },
        { image: 'dg15_airdaletalier.webp', name: '에어데일 테리어', options: ['에어데일 테리어', '웨일스 테리어', '잭 러셀 테리어', '폭스 테리어'] },
        { image: 'dg16_americanstapherdshirertalier.webp', name: '아메리칸 스태퍼드셔 테리어', options: ['아메리칸 스태퍼드셔 테리어', '핏불 테리어', '불 테리어', '스태퍼드셔 불 테리어'] },
        { image: 'dg57_Afghan Hound .webp', name: '아프간 하운드', options: ['아프간 하운드', '살루키', '그레이하운드', '보르조이'] },
        { image: 'dg56_American Cocker Spaniel .jpeg', name: '아메리칸 코커 스패니얼', options: ['아메리칸 코커 스패니얼', '잉글리시 코커 스패니얼', '브르타뉴', '웰시 스프링어 스패니얼'] },
        { image: 'dg51_Cavalier King Charles Spaniel .avif', name: '카발리에 킹 찰스 스패니얼', options: ['카발리에 킹 찰스 스패니얼', '킹 찰스 스패니얼', '잉글리시 토이 스패니얼', '코커 스패니얼'] },
        { image: 'dg26_King Charles Spaniel.jpg', name: '킹 찰스 스패니얼', options: ['킹 찰스 스패니얼', '카발리에 킹 찰스 스패니얼', '잉글리시 토이 스패니얼', '코커 스패니얼'] },
        { image: 'dg23_Italian Greyhound .jpg', name: '이탈리안 그레이하운드', options: ['이탈리안 그레이하운드', '그레이하운드', '휘펫', '살루키'] },
        { image: 'dg29_Lhasa Apso .avif', name: '라사 압소', options: ['라사 압소', '시츄', '티베탄 테리어', '페키니즈'] },
        { image: 'dg33_Norfolk Terrier.webp', name: '노퍽 테리어', options: ['노퍽 테리어', '노리치 테리어', '케언 테리어', '웨스트 하이랜드 화이트 테리어'] },
        { image: 'dg34_Papillon .jpeg', name: '파피용', options: ['파피용', '펄렌', '치와와', '포메라니안'] },
        { image: 'dg35_Pointer.jpeg', name: '포인터', options: ['포인터', '잉글리시 세터', '고든 세터', '아이리시 세터'] },
        { image: 'dg40_Scottish Terrier.jpg', name: '스코티시 테리어', options: ['스코티시 테리어', '웨스트 하이랜드 화이트 테리어', '케언 테리어', '스카이 테리어'] },
        { image: 'dg45_Whippet.png', name: '휘펫', options: ['휘펫', '그레이하운드', '이탈리안 그레이하운드', '살루키'] },
        { image: 'dg48_Coton de Tulear.jpg', name: '코통 드 튈레아', options: ['코통 드 튈레아', '비숑 프리제', '말티즈', '하바니즈'] }
    ]
};

// 게임 시작
function startGame() {
    // 라이센스 검증
    if (!initializeLicense()) {
        return; // 라이센스 만료 시 게임 차단
    }
    
    currentQuestionIndex = 0;
    score = 0;
    questions = getProgressiveQuestions();
    
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    showQuestion();
}

// 난이도 순으로 문제 선택 (쉬움 → 중간 → 어려움)
function getProgressiveQuestions() {
    const selectedQuestions = [];
    
    // 1문제: 쉬운 난이도에서 랜덤 선택
    const easyQuestion = dogBreeds.easy[Math.floor(Math.random() * dogBreeds.easy.length)];
    selectedQuestions.push(easyQuestion);
    
    // 2문제: 중간 난이도에서 랜덤 선택
    const mediumQuestion = dogBreeds.medium[Math.floor(Math.random() * dogBreeds.medium.length)];
    selectedQuestions.push(mediumQuestion);
    
    // 3문제: 어려운 난이도에서 랜덤 선택
    const hardQuestion = dogBreeds.hard[Math.floor(Math.random() * dogBreeds.hard.length)];
    selectedQuestions.push(hardQuestion);
    
    return selectedQuestions;
}

// 문제 표시
function showQuestion() {
    const question = questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex + 1) / 3) * 100;
    
    // 진행률 업데이트
    document.getElementById('progress').style.width = progressPercent + '%';
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    
    // 난이도 표시 업데이트
    const difficultyElement = document.getElementById('difficultyLevel');
    if (currentQuestionIndex === 0) {
        difficultyElement.textContent = '쉬운 문제 🐕';
        difficultyElement.className = 'easy';
    } else if (currentQuestionIndex === 1) {
        difficultyElement.textContent = '보통 문제 🐾';
        difficultyElement.className = 'medium';
    } else {
        difficultyElement.textContent = '어려운 문제 🐺';
        difficultyElement.className = 'hard';
    }
    
    // 강아지 이미지 설정
    const dogImage = document.getElementById('dogImage');
    dogImage.src = `assets/dogs/${question.image}`;
    dogImage.alt = question.name;
    
    // 선택지 생성
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    // 선택지 섞기
    const shuffledOptions = [...question.options].sort(() => 0.5 - Math.random());
    
    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(option, question.name, button);
        optionsContainer.appendChild(button);
    });
}

// 답 선택
function selectAnswer(selectedAnswer, correctAnswer, buttonElement) {
    const isCorrect = selectedAnswer === correctAnswer;
    const allButtons = document.querySelectorAll('.option-btn');
    
    // 모든 버튼 비활성화
    allButtons.forEach(btn => {
        btn.classList.add('disabled');
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn === buttonElement && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    // 즉시 피드백 표시
    showFeedback(isCorrect);
    
    if (isCorrect) {
        score++;
        playSound('correctSound');
    } else {
        playSound('incorrectSound');
    }
    
    // 1.5초 후 다음 문제 또는 결과 화면으로
    setTimeout(() => {
        hideFeedback();
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    }, 1500);
}

// 결과 화면 표시
function showResult() {
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('resultScreen').classList.add('active');
    
    const resultEmoji = document.getElementById('resultEmoji');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const finalScore = document.getElementById('finalScore');
    const couponSection = document.getElementById('couponSection');
    const couponBtn = document.getElementById('couponBtn');
    
    finalScore.textContent = score;
    
    if (score === 3) {
        // 초고수
        resultEmoji.textContent = '🏆';
        resultTitle.textContent = '강아지 초고수!';
        resultMessage.textContent = '축하합니다!';
        couponSection.classList.remove('hidden');
        couponBtn.classList.remove('hidden');
        
        // 축포 효과
        createConfetti();
        
        // 성공 사운드
        playSound('successSound');
        
    } else if (score === 2) {
        // 고수
        resultEmoji.textContent = '🥈';
        resultTitle.textContent = '강아지 고수!';
        resultMessage.textContent = '아깝습니다!';
        couponSection.classList.add('hidden');
        couponBtn.classList.add('hidden');
        
        // 실패 사운드 및 ggg 이미지 애니메이션
        playSound('failSound');
        showMovingGgg();
        
    } else {
        // 하수
        resultEmoji.textContent = '🥉';
        resultTitle.textContent = '강아지 하수...';
        resultMessage.textContent = '아깝습니다!';
        couponSection.classList.add('hidden');
        couponBtn.classList.add('hidden');
        
        // 농담 사운드 및 ggg 이미지 애니메이션
        playSound('kiddingSound');
        showMovingGgg();
    }
}

// 사운드 재생
function playSound(soundId) {
    const audio = document.getElementById(soundId);
    audio.currentTime = 0;
    audio.play().catch(e => {
        console.log('오디오 재생 실패:', e);
    });
}

// 축포 효과 생성
function createConfetti() {
    const confetti = document.getElementById('confetti');
    confetti.innerHTML = '';
    
    const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22'];
    
    for (let i = 0; i < 100; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 3 + 's';
        piece.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.appendChild(piece);
    }
    
    // 5초 후 축포 제거
    setTimeout(() => {
        confetti.innerHTML = '';
    }, 5000);
}

// 쿠폰 저장
function saveCoupon() {
    // 캔버스 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정 (쿠폰 크기)
    canvas.width = 400;
    canvas.height = 300;
    
    // 배경 그라데이션 생성
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#FFD700'); // 금색
    gradient.addColorStop(1, '#FFA500'); // 주황색
    
    // 배경 그리기
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 둥근 모서리 효과를 위한 클리핑
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 15);
    ctx.clip();
    
    // 점선 테두리 그리기
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
    
    // 배경 패턴 (선택사항)
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + canvas.height, canvas.height);
        ctx.stroke();
    }
    
    ctx.restore();
    
    // 텍스트 스타일 설정
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 헤더 - 강아지 간식 쿠폰
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('🐕 강아지 간식 쿠폰 🦴', canvas.width / 2, 50);
    
    // 중앙 화이트 박스 배경
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(30, 80, canvas.width - 60, 140);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 80, canvas.width - 60, 140);
    
    // 축하 메시지
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('🎉 축하 쿠폰 🎉', canvas.width / 2, 110);
    
    // 혜택 내용
    ctx.fillStyle = '#27ae60';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('강아지 간식 무료 증정', canvas.width / 2, 140);
    
    // 설명
    ctx.fillStyle = '#555';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('강아지 간식 쿠폰폰 1개', canvas.width / 2, 165);
    
    // 유효기간
    ctx.fillStyle = '#777';
    ctx.font = 'italic 14px Arial, sans-serif';
    ctx.fillText('유효기간: 2025.12.31', canvas.width / 2, 190);
    
    // 하단 쿠폰번호 박스
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(50, 240, canvas.width - 100, 30);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.strokeRect(50, 240, canvas.width - 100, 30);
    
    // 쿠폰번호
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Courier New, monospace';
    ctx.fillText('쿠폰번호: DOG2025', canvas.width / 2, 255);
    
    // 하단 메시지
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('🎁 강아지 품종 맞추기 게임 획득 쿠폰', canvas.width / 2, 285);
    
    // 이미지 다운로드
    const link = document.createElement('a');
    link.download = '강아지_간식_쿠폰.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 성공 메시지 표시
    alert('🎉 강아지 간식 쿠폰 이미지가 저장되었습니다!\n\n쿠폰번호: DOG2025\n유효기간: 2025.12.31\n\n* 저장된 이미지를 펫샵이나 동물병원에서 제시하세요!');
}

// 홈으로 돌아가기
function goHome() {
    document.getElementById('resultScreen').classList.remove('active');
    document.getElementById('startScreen').classList.add('active');
    
    // 축포 효과 제거
    document.getElementById('confetti').innerHTML = '';
    
    // 게임 상태 초기화
    currentQuestionIndex = 0;
    score = 0;
    questions = [];
}

// 피드백 표시/숨기기
function showFeedback(isCorrect) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.textContent = isCorrect ? '정답입니다!' : '오답입니다!';
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${isCorrect ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 1.2rem;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: fadeInOut 1.5s ease;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 1500);
}

function hideFeedback() {
    const feedback = document.querySelector('.feedback-message');
    if (feedback && feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
    }
}

// ggg 이미지 애니메이션
function showMovingGgg() {
    const movingGgg = document.getElementById('movingGgg');
    movingGgg.classList.add('animate');
    
    setTimeout(() => {
        movingGgg.classList.remove('animate');
    }, 4000);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 오디오 볼륨 설정
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        audio.volume = 0.5;
    });
    
    // 피드백 애니메이션 CSS 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
}); 