// 게임 상태
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// 강아지 데이터 (assets/dogs 폴더의 이미지 파일명과 매칭)
const dogBreeds = [
    { image: 'dg1_shephard.webp', name: '저먼 셰퍼드', options: ['저먼 셰퍼드', '골든 리트리버', '허스키', '보더 콜리'] },
    { image: 'dg2_bulldog.jpg', name: '불독', options: ['불독', '퍼그', '프렌치 불독', '복서'] },
    { image: 'dg3_litriber.webp', name: '골든 리트리버', options: ['래브라도', '골든 리트리버', '저먼 셰퍼드', '허스키'] },
    { image: 'dg4_frenchbulldog.jpg', name: '프렌치 불독', options: ['프렌치 불독', '불독', '퍼그', '보스턴 테리어'] },
    { image: 'dg5_huski.jpg', name: '허스키', options: ['허스키', '알래스칸 말라뮤트', '사모예드', '저먼 셰퍼드'] },
    { image: 'dg6_begle.jpg', name: '비글', options: ['비글', '바셋 하운드', '코커 스패니얼', '잭 러셀 테리어'] },
    { image: 'dg7_poodle.jpg', name: '푸들', options: ['푸들', '몰티즈', '비숑 프리제', '요크셔 테리어'] },
    { image: 'dg8_alaskanmalamute.jpg', name: '알래스칸 말라뮤트', options: ['알래스칸 말라뮤트', '허스키', '사모예드', '저먼 셰퍼드'] },
    { image: 'dg9_chiwawa.jpg', name: '치와와', options: ['치와와', '포메라니안', '요크셔 테리어', '말티즈'] },
    { image: 'dg10_dakshoont.jpg', name: '닥스훈트', options: ['닥스훈트', '비글', '코커 스패니얼', '바셋 하운드'] },
    { image: 'dg11_burnizmountaindog.webp', name: '버니즈 마운틴 독', options: ['버니즈 마운틴 독', '세인트 버나드', '그레이트 피레니즈', '뉴펀들랜드'] },
    { image: 'dg12_australiancatledog.webp', name: '오스트레일리안 캐틀 독', options: ['오스트레일리안 캐틀 독', '보더 콜리', '오스트레일리안 셰퍼드', '웰시 코기'] },
    { image: '13_pugdog.jpg', name: '퍼그', options: ['퍼그', '프렌치 불독', '불독', '치와와'] },
    { image: 'dg14_lotbailer.webp', name: '로트와일러', options: ['로트와일러', '도베르만', '저먼 셰퍼드', '불 마스티프'] },
    { image: 'dg15_airdaletalier.webp', name: '에어데일 테리어', options: ['에어데일 테리어', '웰시 테리어', '잭 러셀 테리어', '폭스 테리어'] },
    { image: 'dg16_americanstapherdshirertalier.webp', name: '아메리칸 스태퍼드셔 테리어', options: ['아메리칸 스태퍼드셔 테리어', '핏불 테리어', '불 테리어', '스태퍼드셔 불 테리어'] },
    { image: 'dg17_bordercolie.jpg', name: '보더 콜리', options: ['보더 콜리', '오스트레일리안 셰퍼드', '저먼 셰퍼드', '웰시 코기'] },
    { image: 'dg18_martiz.jpg', name: '말티즈', options: ['말티즈', '비숑 프리제', '푸들', '요크셔 테리어'] }
];

// 게임 시작
function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    questions = getRandomQuestions(3);
    
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    showQuestion();
}

// 랜덤 문제 3개 선택
function getRandomQuestions(count) {
    const shuffled = [...dogBreeds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 문제 표시
function showQuestion() {
    const question = questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex + 1) / 3) * 100;
    
    // 진행률 업데이트
    document.getElementById('progress').style.width = progressPercent + '%';
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    
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
    const couponImage = document.querySelector('.coupon-image');
    
    // 캔버스를 사용하여 이미지 다운로드
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 다운로드 링크 생성
        const link = document.createElement('a');
        link.download = '강아지_간식_쿠폰.png';
        link.href = canvas.toDataURL();
        link.click();
    };
    img.src = couponImage.src;
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