<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lern-Belohnungsprogramm</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/js-confetti@latest/dist/js-confetti.browser.js"></script>
    <style>
        :root {
            --primary-color: #0056b3; --secondary-color: #4a90e2; --font-color: #333; --white: #fff;
            --danger-color: #d9534f; --success-color: #5cb85c; --app-bg-color: #f4f7f9;
            --bronze-color: #cd7f32; --silber-color: #c0c0c0; --gold-color: #ffd700;
            --sidebar-width: 70px;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0; padding: 0; color: var(--font-color); background-color: var(--app-bg-color);
            transition: background-color .3s;
        }
        .app-wrapper { display: flex; flex-direction: column; min-height: 100vh; }
        .sidebar {
            width: var(--sidebar-width); position: fixed; top: 0; left: 0; bottom: 0;
            background-color: var(--primary-color); display: flex; flex-direction: column;
            align-items: center; padding-top: 20px; gap: 20px; z-index: 1100;
        }
        .sidebar-btn {
            font-size: 2em; background: none; border: none; color: var(--white);
            cursor: pointer; padding: 10px; border-radius: 8px; opacity: 0.7; transition: opacity .2s, background-color .2s;
        }
        .sidebar-btn:hover, .sidebar-btn.active { opacity: 1; background-color: rgba(255,255,255,0.2); }
        main {
            flex-grow: 1; margin-left: var(--sidebar-width); padding: 2rem; text-align: center;
        }
        .points-container {
            position: fixed; top: 15px; right: 20px; display: flex; gap: 10px; align-items: center;
            background-color: var(--primary-color); color: var(--white); padding: 8px 15px; border-radius: 25px;
            font-weight: 700; box-shadow: 0 2px 5px rgba(0, 0, 0, .2); z-index: 1000;
        }
        #xp-display, #points-display, #rank-display, #streak-display { background-color: rgba(255,255,255,.2); padding: 4px 10px; border-radius: 15px; font-size: .9em; }
        #rank-info-trigger { cursor: pointer; font-size: .9em; padding: 4px 8px; border-radius: 50%; background-color: rgba(255,255,255,.2); margin-left: -5px; border: none; color: var(--white); font-family: inherit; }
        #rank-display.Bronze { border: 2px solid var(--bronze-color); } #rank-display.Silber { border: 2px solid var(--silber-color); } #rank-display.Gold { border: 2px solid var(--gold-color); }
        .view { max-width: 800px; margin: 20px auto; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,.1); border: 1px solid rgba(0,0,0,.1); position: relative; background-color: rgba(255,255,255,.85); backdrop-filter: blur(5px); }
        .hidden { display: none; }
        .view-title { color: var(--primary-color); font-size: 1.8em; margin-top: 0; }
        #greeting { margin-bottom: 8px; }
        .button-group { display: flex; justify-content: center; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
        button { background-color: var(--secondary-color); color: var(--white); border: none; padding: 12px 24px; border-radius: 8px; font-size: 1em; cursor: pointer; transition: background-color .3s, transform .1s; font-weight: 600; }
        button:hover { background-color: var(--primary-color); transform: translateY(-2px); }
        button:disabled { background-color: #ccc; cursor: not-allowed; transform: none; }
        button.danger { background-color: var(--danger-color); }
        .back-to-hub, .game-restart-btn { display: block; background: 0 0; border: 1px solid #ccc; color: #555; padding: 8px 16px; width: fit-content; margin: 20px 0 0 0; }
        .game-restart-btn { margin: 20px auto 0; }
        .back-to-hub:hover, .game-restart-btn:hover { background-color: #e9e9e9; color: #333; }
        #color-picker-container { position: absolute; top: 15px; left: 15px; font-size: 1.8em; cursor: pointer; }
        #color-picker { opacity: 0; width: 30px; height: 30px; position: absolute; top: 0; left: 0; cursor: pointer; }
        .quiz-question { font-size: 2.5em; font-weight: 700; margin: 20px 0; color: var(--primary-color); word-wrap: break-word; }
        input[type=number], input[type=text], input[type=password], select, textarea { padding: 12px; font-size: 1em; text-align: center; border: 2px solid #ddd; border-radius: 8px; margin: 10px; max-width: 200px; }
        .progress-container { width: 100%; background-color: #e0e0e0; border-radius: 10px; margin-bottom: 10px; }
        #progress-bar, #vocab-progress-bar { width: 0; height: 20px; background-color: var(--success-color); border-radius: 10px; transition: width .3s ease-in-out; }
        #results-points { font-size: 1.5em; font-weight: 700; color: var(--success-color); }
        .lern-hub-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
        .lern-hub-grid button { padding: 25px; font-size: 1.2em; }
        .admin-form-container { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
        .admin-form-group { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px; background-color: rgba(0,0,0,.05); border-radius: 8px; flex-wrap: wrap;}
        #vocab-lists-container, #vocab-editor-container { text-align: left; }
        #vocab-lists-container ul { list-style: none; padding: 0; }
        #vocab-lists-container li { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; flex-wrap: wrap; gap: 10px;}
        .shop-items { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .shop-item { border: 1px solid #eee; padding: 20px; border-radius: 8px; transition: all .3s; }
        .shop-item.locked { filter: grayscale(100%); opacity: .7; position: relative; }
        .shop-item.locked::after { content: '🔒'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3em; background-color: rgba(255, 255, 255, .5); padding: 10px; border-radius: 50%; }

        /* --- Vokabel-Editor Styles --- */
        .vocab-editor-type-selector { display: flex; gap: 20px; margin-bottom: 15px; justify-content: center; }
        #vocab-input-fields { display: flex; flex-direction: column; gap: 10px; max-height: 250px; overflow-y: auto; padding: 10px; border: 1px solid #ccc; border-radius: 8px; margin: 10px 0; }
        .vocab-pair { display: flex; gap: 10px; align-items: center; }
        .vocab-pair input { flex-grow: 1; text-align: left; padding-left: 10px; max-width: none; }
        .vocab-pair .vocab-translation-input.hidden { display: none; }
        .vocab-pair button { padding: 5px 10px; font-size: 0.8em; background-color: var(--danger-color); min-width: 40px; }
        #play-word-btn { font-size: 1.5em; padding: 10px 15px; margin-left: 10px; }

        /* --- Gemini & Modal Styles --- */
        .gemini-feature-box { border: 2px dashed var(--secondary-color); margin-bottom: 2rem; padding: 1.5rem; border-radius: 8px; background: #fafcff; }
        .loading-spinner { border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 1200; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
        .modal-overlay.visible { opacity: 1; pointer-events: auto; }
        .modal { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center; max-width: 400px; width: 90%; transform: scale(0.9); transition: transform 0.3s; }
        .modal-overlay.visible .modal { transform: scale(1); }
        .modal h3 { margin-top: 0; color: var(--primary-color); }
        .modal .button-group { flex-direction: row; gap: 10px; }

        /* --- Game Styles --- */
        #game-content { display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .tic-tac-toe-board { display: grid; grid-template-columns: repeat(3, minmax(60px, 100px)); grid-template-rows: repeat(3, minmax(60px, 100px)); gap: 10px; margin-top: 20px; }
        .tic-tac-toe-cell { width: 100%; height: 100%; aspect-ratio: 1; background-color: #eee; border-radius: 8px; display: flex; justify-content: center; align-items: center; font-size: 3em; font-weight: bold; cursor: pointer; transition: background-color .2s; }
        .tic-tac-toe-cell:hover { background-color: #ddd; }
        .tic-tac-toe-board.disabled { pointer-events: none; opacity: 0.7; }
        #hangman-word { font-size: 2em; letter-spacing: 0.5em; margin: 20px 0; text-align: center; }
        #hangman-letters { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 500px; }
        #hangman-letters button { min-width: 40px; padding: 10px; }
        #hangman-drawing { font-family: monospace; white-space: pre; font-size: 1.2em; margin-top: 15px; }
        .memory-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 500px; width: 100%; margin: 20px auto; }
        .memory-card { width: 100%; aspect-ratio: 1; background-color: var(--secondary-color); border-radius: 8px; cursor: pointer; position: relative; transform-style: preserve-3d; transition: transform 0.5s; }
        .memory-card.flipped, .memory-card.matched { transform: rotateY(180deg); background-color: #eee; }
        .memory-card .card-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; justify-content: center; align-items: center; font-size: 2.5em; }
        .card-back { transform: rotateY(180deg); }
        #dino-canvas { border: 2px solid #333; background-color: #f7f7f7; max-width: 600px; width: 100%; }
        
        /* --- Mobile Optimierungen --- */
        @media (max-width: 768px) {
            body { padding-bottom: 70px; /* Platz für die untere Leiste */ }
            .sidebar {
                flex-direction: row;
                justify-content: space-around;
                width: 100%;
                height: 60px;
                top: auto;
                bottom: 0;
                padding-top: 0;
            }
            .sidebar-btn[title="Admin-Panel"] { margin: 0 !important; }
            main { margin-left: 0; padding: 1rem; }
            .points-container {
                position: relative;
                top: 0;
                right: 0;
                width: 100%;
                box-sizing: border-box;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 1rem;
                border-radius: 8px;
            }
            .view { padding: 1.5rem; }
            .view-title { font-size: 1.5em; }
            .quiz-question { font-size: 2em; }
            input[type=number], input[type=text], input[type=password] { width: 80%; max-width: none; }
            .lern-hub-grid { grid-template-columns: 1fr; }
            .shop-items { grid-template-columns: 1fr; }
            .admin-form-group { flex-direction: column; align-items: stretch; }
            .admin-form-group input { width: 100%; box-sizing: border-box; margin: 5px 0; }
        }
    </style>
</head>
<body>
    <div class="app-wrapper">
        <nav class="sidebar">
            <button data-hash="#learning-hub" class="sidebar-btn" title="Lernen">🧠</button>
            <button data-hash="#shop" class="sidebar-btn" title="Spielen">🎮</button>
            <button data-hash="#admin-login" class="sidebar-btn" title="Admin-Panel" style="margin-top: auto; margin-bottom: 20px;">🔧</button>
        </nav>

        <main id="app-container">
            <div class="points-container">
                <div id="streak-display" title="Dein Lern-Streak">🔥 0</div>
                <div id="rank-display" title="Dein Rang">Bronze</div>
                <button id="rank-info-trigger" data-hash="#ranks" title="Rang-Übersicht">ℹ️</button>
                <div id="xp-display" title="Erfahrungspunkte">0 XP</div>
                <div id="points-display" title="Punkte">0</div>
            </div>

            <!-- Views -->
            <div id="name-prompt-view" class="view">
                <h2 class="view-title">Willkommen!</h2>
                <p>Wie lautet dein Name?</p>
                <input type="text" id="name-input" placeholder="Dein Name"><button data-action="save-name">Speichern</button>
            </div>
            
            <div id="learning-hub" class="view hidden">
                <h2 id="greeting" class="view-title"></h2>
                <p>Wähle eine Lernmethode, um Punkte und XP zu sammeln.</p>
                <div class="lern-hub-grid">
                    <button data-hash="#math">🧮 Mathe-Training</button>
                    <button data-hash="#german">📖 Lese-Timer</button>
                    <button data-hash="#vocabulary">🌐 Vokabeltrainer</button>
                </div>
                <div id="color-picker-container" title="Hintergrundfarbe ändern">💧 <input type="color" id="color-picker"></div>
            </div>

            <div id="math-module" class="view hidden">
                <button class="back-to-hub" data-hash="#learning-hub">‹ Zurück</button>
                <div id="math-home">
                    <h2 class="view-title">Mathe-Training</h2><p>Löse Aufgaben. Der Schwierigkeitsgrad passt sich deinem Rang an.</p>
                    <div id="math-selection" class="button-group">
                        <button data-action="start-math" data-op="addition">Addition</button><button data-action="start-math" data-op="subtraction">Subtraktion</button>
                        <button data-action="start-math" data-op="multiplication">Multiplikation</button><button data-action="start-math" data-op="division">Division</button>
                        <button data-action="start-math" data-op="potenzen">Potenzen</button>
                        <button data-action="start-math" data-op="fractions">Brüche</button>
                    </div>
                </div>
                <div id="math-quiz" class="hidden">
                    <div class="progress-container"><div id="progress-bar"></div></div>
                    <div id="question-counter"></div><div id="problem-display" class="quiz-question"></div>
                    <input type="text" id="math-answer" placeholder="Deine Antwort"><button data-action="check-math-answer">Prüfen</button>
                    <p id="feedback-message"></p>
                </div>
                <div id="math-results" class="hidden">
                    <h2 class="view-title">Super gemacht!</h2><p id="results-summary"></p>
                    <p id="results-points" class="points-highlight"></p><p id="results-duration"></p>
                    <button data-action="back-to-math-menu">Neue Runde</button>
                </div>
            </div>

            <div id="german-module" class="view hidden">
                <button class="back-to-hub" data-hash="#learning-hub">‹ Zurück</button>
                <h2 class="view-title">Lese-Timer</h2><p>Starte den Timer, um in den ablenkungsfreien Vollbild-Lesemodus zu wechseln.</p>
                <div id="timer-display" style="font-size: 2.5em; margin: 15px 0;">00:00:00</div>
                <div class="timer-controls button-group">
                    <button data-action="reading-timer-start">Start</button>
                    <button data-action="reading-timer-pause" class="hidden">Pause</button>
                    <button data-action="reading-timer-resume" class="hidden">Fortsetzen</button>
                    <button data-action="reading-timer-stop" class="hidden danger">Beenden & Punkte erhalten</button>
                </div>
            </div>

            <div id="vocabulary-module" class="view hidden">
                <button class="back-to-hub" data-hash="#learning-hub">‹ Zurück</button>
                <h2 class="view-title">Vokabeltrainer</h2>
                <div id="vocab-lists-view">
                     <div class="gemini-feature-box">
                         <h3>✨ Vokabelliste scannen (BETA)</h3>
                         <p>Lade ein Foto deiner Vokabelliste hoch. Die KI versucht, die Wörter zu extrahieren.</p>
                         <input type="file" id="vocab-scan-input" accept="image/*">
                         <button data-action="scan-vocab-list">📷 Scan starten</button>
                         <div id="vocab-scan-feedback"></div>
                     </div>
                    <div id="vocab-lists-container"></div><button data-action="show-vocab-editor">Neue Liste manuell erstellen</button>
                </div>
                <div id="vocab-editor-view" class="hidden">
                    <h3 id="vocab-editor-title">Neue Liste erstellen</h3>
                    <div class="vocab-editor-type-selector">
                        <label><input type="radio" name="vocab-list-type" value="vocab" checked> Vokabeln</label>
                        <label><input type="radio" name="vocab-list-type" value="spelling"> Rechtschreibung</label>
                    </div>
                    <input type="text" id="vocab-list-name" placeholder="Name der Liste (z.B. Englisch Unit 1)">
                    <div id="vocab-input-fields"></div>
                    <button data-action="add-vocab-pair">+ Weitere Vokabel hinzufügen</button>
                    <div class="button-group">
                        <button data-action="save-vocab-list">Liste speichern</button>
                        <button data-action="cancel-vocab-edit">Abbrechen</button>
                    </div>
                </div>
                <div id="vocab-quiz-view" class="hidden">
                    <div class="progress-container"><div id="vocab-progress-bar"></div></div>
                    <div id="vocab-question-counter"></div>
                    <p><span id="vocab-question-prompt">Was heißt</span> <strong id="vocab-word"></strong>?</p>
                    <div style="display: flex; align-items: center; justify-content: center;">
                        <input type="text" id="vocab-answer" placeholder="Antwort">
                        <button id="play-word-btn" data-action="play-word" class="hidden" title="Wort vorlesen">🔊</button>
                        <button data-action="check-vocab-answer">Prüfen</button>
                    </div>
                    <p id="vocab-feedback"></p>
                </div>
                <div id="vocab-results-view" class="hidden"></div>
            </div>

            <div id="shop-module" class="view hidden">
                <h2 class="view-title">Belohnungs-Shop</h2>
                <div id="shop-items" class="shop-items">
                    <div class="shop-item" data-rank="Bronze"><h3>Guess The Number</h3><p>Kosten: 12 Punkte</p><button data-action="buy-game" data-game="guess-the-number" data-cost="12">Spielen</button></div>
                    <div class="shop-item" data-rank="Bronze"><h3>Dino Run</h3><p>Kosten: 15 Punkte</p><button data-action="buy-game" data-game="dino-run" data-cost="15">Spielen</button></div>
                    <div class="shop-item" data-rank="Silber"><h3>Memory</h3><p>Kosten: 18 Punkte</p><button data-action="buy-game" data-game="memory" data-cost="18">Spielen</button></div>
                    <div class="shop-item" data-rank="Silber"><h3>Tic-Tac-Toe</h3><p>Kosten: 20 Punkte</p><button data-action="buy-game" data-game="tic-tac-toe" data-cost="20">Spielen</button></div>
                    <div class="shop-item" data-rank="Gold"><h3>Hangman</h3><p>Kosten: 40 Punkte</p><button data-action="buy-game" data-game="hangman" data-cost="40">Spielen</button></div>
                </div>
            </div>

            <div id="game-container" class="view hidden"><button class="back-to-hub" data-action="back-to-shop">‹ Zurück zum Shop</button><div id="game-content"></div></div>

            <div id="admin-login-view" class="view hidden"><button class="back-to-hub" data-hash="#learning-hub">‹ Zurück</button><h2 class="view-title">Admin-Login</h2><p>Bitte gib die PIN ein.</p><input type="password" id="admin-pin-input" placeholder="PIN"><button data-action="admin-login">Anmelden</button></div>
            <div id="admin-panel-view" class="view hidden">
                <button class="back-to-hub" data-hash="#learning-hub">‹ Zurück</button><h2 class="view-title">Admin-Panel</h2>
                <p>Hier kannst du die Nutzerdaten anpassen.</p>
                <div class="admin-form-container">
                    <div class="admin-form-group"><label>Name:</label><input type="text" id="admin-name-input"><button data-action="admin-set-name">Setzen</button></div>
                    <div class="admin-form-group"><label>Punkte:</label><input type="number" id="admin-points-input"><button data-action="admin-set-points">Setzen</button></div>
                    <div class="admin-form-group"><label>XP:</label><input type="number" id="admin-xp-input"><button data-action="admin-set-xp">Setzen</button></div>
                    <div class="admin-form-group"><label>Rang:</label><select id="admin-rank-select"><option value="Bronze">Bronze</option><option value="Silber">Silber</option><option value="Gold">Gold</option></select><button data-action="admin-set-rank">Setzen</button></div>
                    <div class="admin-form-group"><label>Streak:</label><input type="number" id="admin-streak-input"><button data-action="admin-set-streak">Setzen</button></div>
                </div>
            </div>
            
            <div id="rank-info-view" class="view hidden">
                <button class="back-to-hub" data-hash="#learning-hub">‹ Zurück</button>
                <h2 class="view-title">Rang-Übersicht</h2><p>Sammle XP in Lektionen, um aufzusteigen!</p>
                <div class="rank-list" style="text-align: left;">
                    <div class="rank-item bronze"><h3>Bronze</h3><p>0+ XP</p><span>Startrang.</span></div>
                    <div class="rank-item silber"><h3>Silber</h3><p>100+ XP</p><span>Schaltet Tic-Tac-Toe & Memory frei.</span></div>
                    <div class="rank-item gold"><h3>Gold</h3><p>300+ XP</p><span>Schaltet Hangman frei.</span></div>
                </div>
            </div>
        </main>
    </div>

    <!-- Modals -->
    <div id="vocab-start-modal" class="modal-overlay">
        <div class="modal">
            <h3 id="modal-list-title">Wie möchtest du lernen?</h3>
            <p id="modal-list-name"></p>
            <div class="button-group">
                <button data-action="start-all-vocab">Alle Vokabeln</button>
                <button data-action="start-difficult-vocab">Nur schwierige Vokabeln</button>
                <button data-action="close-modal" class="danger">Abbrechen</button>
            </div>
        </div>
    </div>
    <div id="alert-modal" class="modal-overlay">
        <div class="modal">
            <h3 id="alert-modal-title">Hinweis</h3>
            <p id="alert-modal-message"></p>
            <button data-action="close-modal">OK</button>
        </div>
    </div>
    <div id="confirm-modal" class="modal-overlay">
        <div class="modal">
            <h3 id="confirm-modal-title">Bestätigen</h3>
            <p id="confirm-modal-message"></p>
            <div class="button-group">
                <button id="confirm-modal-yes">Ja</button>
                <button id="confirm-modal-no" class="danger" data-action="close-modal">Nein</button>
            </div>
        </div>
    </div>


    <script>
    document.addEventListener("DOMContentLoaded", () => {
        // === App Zustand ===
        let userPoints = 0, userXp = 0, userRank = "Bronze", userName = "", jsConfetti, userStreak = 0, lastActivityDate = null;
        let quizQuestions = [], currentQuestionIndex = 0, correctAnswersCount = 0;
        let currentMathOperation = "", quizStartTime = 0, currentQuizType = '';
        let timerState = 'stopped', readingTimerInterval = null, secondsElapsed = 0;
        let activeGameInterval = null;
        let vocabLists = {};
        let canSkipFeedback = false, feedbackTimeout = null;
        
        // Spielzustände
        let ttt_boardState, ttt_gameActive;
        let hg_secretWord, hg_guessedLetters, hg_wrongGuesses, hg_gameActive;
        let dinoGame = {};
        
        let currentVocabList, vocabStartMode;
        let confirmCallback = null;

        const RANK_THRESHOLDS = { Silber: 100, Gold: 300 };
        const RANK_ORDER = { Bronze: 1, Silber: 2, Gold: 3 };
        const routes = {
            '#name-prompt': 'name-prompt-view', '#learning-hub': 'learning-hub', '#shop': 'shop-module',
            '#math': 'math-module', '#german': 'german-module', '#vocabulary': 'vocabulary-module',
            '#ranks': 'rank-info-view', '#admin-login': 'admin-login-view', '#admin-panel': 'admin-panel-view',
            '#game': 'game-container'
        };

        const allViews = document.querySelectorAll(".view");
        const greetingElement = document.getElementById("greeting");
        
        // === Initialisierung ===
        function init() {
            jsConfetti = new JSConfetti();
            loadUserData();
            loadVocabLists();
            checkStreakOnLoad();
            updateAllDisplays();
            loadTheme();
            setupEventListeners();
            const savedName = localStorage.getItem("userName");
            if (savedName) { userName = savedName; window.location.hash = '#learning-hub'; } 
            else { window.location.hash = '#name-prompt'; }
            router();
        }

        // === Router & View Management ===
        function router() { const hash = window.location.hash || '#name-prompt'; const viewId = routes[hash]; showView(viewId || 'name-prompt-view'); updateSidebarActiveState(hash); }
        function showView(viewId) {
            stopAllActivities();
            allViews.forEach(view => view.classList.add("hidden"));
            const viewToShow = document.getElementById(viewId);
            if (viewToShow) viewToShow.classList.remove("hidden");
            if (viewId === 'learning-hub') displayGreeting();
            if (viewId === 'shop-module') renderShop();
            if (viewId === 'admin-panel-view') populateAdminPanel();
            if (viewId === 'vocabulary-module') renderVocabListsView();
        }
        function updateSidebarActiveState(hash) { document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active')); const navLearn = document.querySelector('[data-hash="#learning-hub"]'); const navPlay = document.querySelector('[data-hash="#shop"]'); if (['#learning-hub', '#math', '#german', '#vocabulary', '#ranks'].includes(hash)) { navLearn.classList.add('active'); } else if (['#shop', '#game'].includes(hash)) { navPlay.classList.add('active'); } }

        // === Event Listeners ===
        function setupEventListeners() {
            document.body.addEventListener('click', handleGlobalClick);
            document.addEventListener('keyup', handleGlobalKeyup);
            window.addEventListener('hashchange', router);
            document.getElementById('color-picker').addEventListener('input', (e) => {
                const newColor = e.target.value;
                document.documentElement.style.setProperty('--app-bg-color', newColor);
                localStorage.setItem("appThemeColor", newColor);
            });
            document.getElementById('confirm-modal-yes').addEventListener('click', () => {
                if (confirmCallback) confirmCallback();
                closeAllModals();
            });
             document.addEventListener('keydown', (e) => {
                if(dinoGame.active && e.code === 'Space') {
                    e.preventDefault();
                    dinoGame.jump();
                }
            });
            document.querySelectorAll('input[name="vocab-list-type"]').forEach(radio => {
                radio.addEventListener('change', (e) => toggleVocabEditorMode(e.target.value));
            });
        }
        function handleGlobalKeyup(e) { if (e.key !== 'Enter') return; if (canSkipFeedback) { clearTimeout(feedbackTimeout); proceedToNextQuestion(); return; } const activeEl = document.activeElement; if (activeEl.id === 'name-input') document.querySelector('[data-action="save-name"]').click(); if (activeEl.id === 'admin-pin-input') document.querySelector('[data-action="admin-login"]').click(); if (activeEl.id === 'math-answer') document.querySelector('[data-action="check-math-answer"]').click(); if (activeEl.id === 'vocab-answer') document.querySelector('[data-action="check-vocab-answer"]').click(); }

        // === Daten & UI ===
        function loadUserData() { userName = localStorage.getItem("userName") || ""; userPoints = parseInt(localStorage.getItem("userPoints") || "0", 10); userXp = parseInt(localStorage.getItem("userXp") || "0", 10); userRank = localStorage.getItem("userRank") || "Bronze"; userStreak = parseInt(localStorage.getItem("userStreak") || "0", 10); lastActivityDate = localStorage.getItem("lastActivityDate"); }
        function saveUserData() { localStorage.setItem("userName", userName); localStorage.setItem("userPoints", userPoints); localStorage.setItem("userXp", userXp); localStorage.setItem("userRank", userRank); localStorage.setItem("userStreak", userStreak); localStorage.setItem("lastActivityDate", lastActivityDate); }
        function updateAllDisplays() { document.getElementById("points-display").textContent = userPoints; document.getElementById("xp-display").textContent = `${userXp} XP`; document.getElementById("rank-display").textContent = userRank; document.getElementById("rank-display").className = userRank; document.getElementById("streak-display").textContent = `🔥 ${userStreak}`; }
        function addPoints(amount) { userPoints += amount; updateAllDisplays(); saveUserData(); }
        function addXp(amount) { userXp += amount; checkRankUp(); updateAllDisplays(); saveUserData(); }
        function spendPoints(amount) { if (userPoints >= amount) { userPoints -= amount; updateAllDisplays(); saveUserData(); return true; } return false; }
        function loadTheme() { const savedColor = localStorage.getItem("appThemeColor") || "#f4f7f9"; document.documentElement.style.setProperty("--app-bg-color", savedColor); document.getElementById("color-picker").value = savedColor; }
        function displayGreeting() { if(userName) { const hour = new Date().getHours(); let greetingText = (hour < 12) ? 'Guten Morgen' : (hour < 18) ? 'Guten Tag' : 'Guten Abend'; greetingElement.textContent = `${greetingText}, ${userName}!`; } }
        function checkRankUp() { const oldRank = userRank; if (userXp >= RANK_THRESHOLDS.Gold && userRank !== "Gold") { userRank = "Gold"; } else if (userXp >= RANK_THRESHOLDS.Silber && userRank === "Bronze") { userRank = "Silber"; } if (oldRank !== userRank) { setTimeout(() => showAlert(`Herzlichen Glückwunsch! Du hast den ${userRank}-Rang erreicht!`, 'Rangaufstieg'), 500); } }

        // === Streak Logic ===
        function getISODateString(date) { return date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0'); }
        function checkStreakOnLoad() {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            
            const todayStr = getISODateString(today);
            const yesterdayStr = getISODateString(yesterday);

            if (lastActivityDate && lastActivityDate !== todayStr && lastActivityDate !== yesterdayStr) {
                userStreak = 0;
                saveUserData();
            }
        }
        function updateStreak() {
            const today = new Date();
            const todayStr = getISODateString(today);

            if (lastActivityDate === todayStr) return; // Bereits für heute gelernt

            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = getISODateString(yesterday);

            if (lastActivityDate === yesterdayStr) {
                userStreak++;
                showAlert(`Super, du hast deinen Streak auf ${userStreak} Tage erhöht!`, 'Streak verlängert!');
            } else {
                userStreak = 1;
                showAlert('Dein erster Tag eines neuen Streaks! Weiter so!', 'Neuer Streak!');
            }
            lastActivityDate = todayStr;
            saveUserData();
            updateAllDisplays();
        }

        // === Modal System ===
        function showAlert(message, title = "Hinweis") {
            document.getElementById('alert-modal-title').textContent = title;
            document.getElementById('alert-modal-message').textContent = message;
            document.getElementById('alert-modal').classList.add('visible');
        }
        function showConfirm(message, callback, title = "Bestätigen") {
            document.getElementById('confirm-modal-title').textContent = title;
            document.getElementById('confirm-modal-message').textContent = message;
            confirmCallback = callback;
            document.getElementById('confirm-modal').classList.add('visible');
        }
        function closeAllModals() {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('visible'));
        }

        // === Admin & User Setup ===
        function handleSaveName() { const nameValue = document.getElementById("name-input").value.trim(); if (nameValue) { userName = nameValue; saveUserData(); window.location.hash = '#learning-hub'; } else { showAlert("Bitte gib einen Namen ein."); } }
        function populateAdminPanel() { document.getElementById("admin-name-input").value = userName; document.getElementById("admin-points-input").value = userPoints; document.getElementById("admin-xp-input").value = userXp; document.getElementById("admin-rank-select").value = userRank; document.getElementById("admin-streak-input").value = userStreak; }
        function handleAdminLogin() { if (document.getElementById("admin-pin-input").value === "6728") { window.location.hash = '#admin-panel'; } else { showAlert("Falsche PIN!"); } document.getElementById("admin-pin-input").value = ""; }
        function handleAdminSetName() { userName = document.getElementById("admin-name-input").value.trim(); saveUserData(); displayGreeting(); showAlert(`Name auf "${userName}" geändert.`); }
        function handleSetPoints() { const val = parseInt(document.getElementById("admin-points-input").value, 10); if (!isNaN(val) && val >= 0) { userPoints = val; updateAllDisplays(); saveUserData(); showAlert(`Punkte auf ${val} gesetzt.`); } }
        function handleSetXp() { const val = parseInt(document.getElementById("admin-xp-input").value, 10); if (!isNaN(val) && val >= 0) { userXp = val; checkRankUp(); updateAllDisplays(); saveUserData(); showAlert(`XP auf ${val} gesetzt.`); } }
        function handleSetRank() { userRank = document.getElementById("admin-rank-select").value; updateAllDisplays(); saveUserData(); showAlert(`Rang auf ${userRank} gesetzt.`); }
        function handleSetStreak() { const val = parseInt(document.getElementById("admin-streak-input").value, 10); if (!isNaN(val) && val >= 0) { userStreak = val; updateAllDisplays(); saveUserData(); showAlert(`Streak auf ${val} gesetzt.`); } }
        
        // === Lernmodule ===
        function startMathQuiz(op) {
            currentQuizType = 'math'; currentMathOperation = op; correctAnswersCount = 0; currentQuestionIndex = 0;
            quizQuestions = generateQuiz(10, op);
            quizStartTime = new Date();
            document.getElementById("math-home").classList.add("hidden");
            document.getElementById("math-quiz").classList.remove("hidden");
            displayCurrentQuestion();
        }

        function generateQuiz(numQuestions, op) {
            const questions = [];
            const maxNum = userRank === 'Bronze' ? 10 : userRank === 'Silber' ? 50 : 100;

            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const simplify = (n, d) => { const common = gcd(n, d); return { n: n / common, d: d / common }; };

            for (let i = 0; i < numQuestions; i++) {
                let question, answer;
                let num1 = Math.floor(Math.random() * maxNum) + 1;
                let num2 = Math.floor(Math.random() * maxNum) + 1;
                
                switch (op) {
                    case 'addition': question = `${num1} + ${num2}`; answer = num1 + num2; break;
                    case 'subtraction': if (num1 < num2) [num1, num2] = [num2, num1]; question = `${num1} - ${num2}`; answer = num1 - num2; break;
                    case 'multiplication': num1 = Math.floor(Math.random() * (maxNum / 5)) + 1; num2 = Math.floor(Math.random() * 10) + 1; question = `${num1} × ${num2}`; answer = num1 * num2; break;
                    case 'division': answer = Math.floor(Math.random() * (maxNum / 10)) + 2; num2 = Math.floor(Math.random() * 10) + 2; num1 = answer * num2; question = `${num1} ÷ ${num2}`; break;
                    case 'potenzen': num1 = Math.floor(Math.random() * 10) + 2; num2 = userRank === 'Bronze' ? 2 : (Math.random() > 0.5 ? 2:3); question = `${num1}²`; answer = Math.pow(num1, 2); if(num2 === 3) { question = `${num1}³`; answer = Math.pow(num1, 3); } break;
                    case 'fractions': {
                        const d1 = Math.floor(Math.random() * 8) + 2;
                        const n1 = Math.floor(Math.random() * d1) + 1;
                        const d2 = Math.floor(Math.random() * 8) + 2;
                        const n2 = Math.floor(Math.random() * d2) + 1;
                        const simp1 = simplify(n1,d1);
                        const simp2 = simplify(n2,d2);
                        
                        const commonD = simp1.d * simp2.d;
                        const resN = simp1.n * simp2.d + simp2.n * simp1.d;
                        const final = simplify(resN, commonD);
                        
                        question = `${simp1.n}/${simp1.d} + ${simp2.n}/${simp2.d}`;
                        answer = `${final.n}/${final.d}`;
                        break;
                    }
                }
                questions.push({ question, answer });
            }
            return questions;
        }

        function checkMathAnswer() {
            const answerInput = document.getElementById("math-answer");
            const userAnswerRaw = answerInput.value.trim();
            if (userAnswerRaw === "") return;
            
            const correctAnswer = quizQuestions[currentQuestionIndex].answer;
            const feedbackEl = document.getElementById('feedback-message');
            document.querySelector('[data-action="check-math-answer"]').disabled = true;

            let isCorrect = false;
            if (currentMathOperation === 'fractions') {
                isCorrect = userAnswerRaw === correctAnswer.toString();
            } else {
                const userAnswerNum = parseInt(userAnswerRaw, 10);
                isCorrect = userAnswerNum === correctAnswer;
            }

            if (isCorrect) {
                correctAnswersCount++;
                feedbackEl.textContent = 'Richtig! Drücke Enter zum Fortfahren.';
                feedbackEl.style.color = 'var(--success-color)';
                canSkipFeedback = true;
            } else {
                feedbackEl.textContent = `Falsch. Richtig wäre: ${correctAnswer}`;
                feedbackEl.style.color = 'var(--danger-color)';
            }
            feedbackTimeout = setTimeout(proceedToNextQuestion, 2000);
        }

        function displayCurrentQuestion() {
            if (currentQuestionIndex >= quizQuestions.length) {
                showQuizResults(); return;
            }
            document.getElementById('feedback-message').textContent = '';
            document.querySelector('[data-action="check-math-answer"]').disabled = false;
            const q = quizQuestions[currentQuestionIndex];
            document.getElementById("problem-display").textContent = q.question;
            document.getElementById("question-counter").textContent = `Frage ${currentQuestionIndex + 1} von ${quizQuestions.length}`;
            const answerInput = document.getElementById("math-answer");
            answerInput.type = (currentMathOperation === 'fractions') ? 'text' : 'number';
            answerInput.value = "";
            answerInput.focus();
            updateProgressBar();
        }

        function updateProgressBar() {
            const progress = (currentQuestionIndex / quizQuestions.length) * 100;
            document.getElementById("progress-bar").style.width = `${progress}%`;
        }

        function showQuizResults() {
            updateProgressBar(); // Auf 100% setzen
            const duration = Math.round((new Date() - quizStartTime) / 1000);
            const pointsEarned = correctAnswersCount * 2;
            const xpEarned = correctAnswersCount * 3;
            addPoints(pointsEarned);
            addXp(xpEarned);
            updateStreak();

            document.getElementById("math-quiz").classList.add("hidden");
            document.getElementById("math-results").classList.remove("hidden");
            document.getElementById("results-summary").textContent = `Du hast ${correctAnswersCount} von ${quizQuestions.length} Aufgaben richtig gelöst.`;
            document.getElementById("results-points").textContent = `+${pointsEarned} Punkte & +${xpEarned} XP`;
            document.getElementById("results-duration").textContent = `Zeit: ${duration} Sekunden`;
            if (correctAnswersCount === quizQuestions.length) jsConfetti.addConfetti();
        }

        function manageTimerButtons(state) {
            const controls = document.querySelector('.timer-controls');
            controls.querySelector('[data-action="reading-timer-start"]').classList.toggle('hidden', state !== 'stopped');
            controls.querySelector('[data-action="reading-timer-pause"]').classList.toggle('hidden', state !== 'running');
            controls.querySelector('[data-action="reading-timer-resume"]').classList.toggle('hidden', state !== 'paused');
            controls.querySelector('[data-action="reading-timer-stop"]').classList.toggle('hidden', state === 'stopped');
        }
        
        function startReadingTimer() {
            if (timerState === 'stopped') {
                secondsElapsed = 0;
                document.body.requestFullscreen().catch(err => {
                    console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            }
            timerState = 'running';
            manageTimerButtons(timerState);
            const startTime = Date.now() - (secondsElapsed * 1000);
            readingTimerInterval = setInterval(() => {
                secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
                updateTimerDisplay();
            }, 1000);
        }

        function pauseReadingTimer() {
            timerState = 'paused';
            clearInterval(readingTimerInterval);
            manageTimerButtons(timerState);
        }
        
        function stopReadingTimer(awardPoints = true) {
            clearInterval(readingTimerInterval);
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            if (awardPoints) {
                const minutesRead = Math.floor(secondsElapsed / 60);
                if (minutesRead > 0) {
                    const pointsEarned = minutesRead; // 1 Punkt pro Minute
                    const xpEarned = minutesRead * 2;
                    addPoints(pointsEarned);
                    addXp(xpEarned);
                    updateStreak();
                    showAlert(`Super! Du hast ${minutesRead} Minuten gelesen und ${pointsEarned} Punkte & ${xpEarned} XP verdient!`, 'Lesezeit beendet');
                } else {
                    showAlert('Du hast weniger als eine Minute gelesen. Beim nächsten Mal gibt es sicher Punkte!', 'Lesezeit beendet');
                }
            }
            secondsElapsed = 0;
            updateTimerDisplay();
            timerState = 'stopped';
            manageTimerButtons(timerState);
        }

        function updateTimerDisplay() {
            const h = Math.floor(secondsElapsed / 3600).toString().padStart(2, '0');
            const m = Math.floor((secondsElapsed % 3600) / 60).toString().padStart(2, '0');
            const s = (secondsElapsed % 60).toString().padStart(2, '0');
            document.getElementById('timer-display').textContent = `${h}:${m}:${s}`;
        }
        
        // --- Vokabel-Modul ---
        function speak(text) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'de-DE'; // Sprache einstellen
                window.speechSynthesis.speak(utterance);
            } else {
                showAlert("Dein Browser unterstützt keine Sprachausgabe.");
            }
        }
        function loadVocabLists() {
            let loadedLists = JSON.parse(localStorage.getItem('vocabLists') || '{}');
            let needsSave = false;
            // Migration logic for old data structure
            Object.keys(loadedLists).forEach(name => {
                const list = loadedLists[name];
                // Check if it's the old format (an array)
                if (Array.isArray(list)) {
                    loadedLists[name] = {
                        type: 'vocab', // Assume old lists are 'vocab' type
                        items: list
                    };
                    needsSave = true; // Mark that we need to save the migrated data
                }
            });
            vocabLists = loadedLists;
            // If we migrated any list, save the updated structure back to localStorage
            if (needsSave) {
                saveVocabLists();
            }
        }
        function saveVocabLists() { localStorage.setItem('vocabLists', JSON.stringify(vocabLists)); }
        function renderVocabListsView() { document.getElementById('vocab-lists-view').classList.remove('hidden'); document.getElementById('vocab-editor-view').classList.add('hidden'); document.getElementById('vocab-quiz-view').classList.add('hidden'); document.getElementById('vocab-results-view').classList.add('hidden'); const container = document.getElementById('vocab-lists-container'); container.innerHTML = '<h3>Deine Vokabellisten</h3>'; const listNames = Object.keys(vocabLists); if (listNames.length === 0) { container.innerHTML += '<p>Du hast noch keine Listen erstellt.</p>'; return; } const ul = document.createElement('ul'); listNames.forEach(name => { const list = vocabLists[name]; const li = document.createElement('li'); const listType = list.type === 'spelling' ? 'Rechtschreibung' : 'Vokabeln'; li.innerHTML = `<span><strong>${name}</strong> (${list.items.length} Einträge, ${listType})</span> <div class="button-group" style="margin-top:0;"> <button data-action="start-vocab-quiz" data-list-name="${name}">Start</button> <button data-action="edit-vocab-list" data-list-name="${name}">✏️</button> <button data-action="download-vocab-pdf" data-list-name="${name}" title="Lernstand als PDF laden">📄</button> <button data-action="delete-vocab-list" data-list-name="${name}" class="danger">🗑️</button> </div>`; ul.appendChild(li); }); container.appendChild(ul); }
        function showVocabEditor(listName = null) { document.getElementById('vocab-lists-view').classList.add('hidden'); document.getElementById('vocab-editor-view').classList.remove('hidden'); const nameInput = document.getElementById('vocab-list-name'); const fieldsContainer = document.getElementById('vocab-input-fields'); const title = document.getElementById('vocab-editor-title'); fieldsContainer.innerHTML = ''; if (listName && vocabLists[listName]) { const list = vocabLists[listName]; const listType = list.type || 'vocab'; document.querySelector(`input[name="vocab-list-type"][value="${listType}"]`).checked = true; title.textContent = "Liste bearbeiten"; nameInput.value = listName; nameInput.dataset.originalName = listName; list.items.forEach(pair => addVocabPairInput(pair.word, pair.translation)); toggleVocabEditorMode(listType); } else { title.textContent = "Neue Liste erstellen"; document.querySelector(`input[name="vocab-list-type"][value="vocab"]`).checked = true; nameInput.value = ''; nameInput.dataset.originalName = ''; addVocabPairInput(); addVocabPairInput(); addVocabPairInput(); toggleVocabEditorMode('vocab'); } }
        function toggleVocabEditorMode(mode) { document.querySelectorAll('.vocab-translation-input').forEach(input => input.classList.toggle('hidden', mode === 'spelling')); }
        function saveVocabList() { const name = document.getElementById('vocab-list-name').value.trim(); const originalName = document.getElementById('vocab-list-name').dataset.originalName; const listType = document.querySelector('input[name="vocab-list-type"]:checked').value; if (!name) { showAlert("Bitte gib einen Namen für die Liste ein."); return; } if (name !== originalName && vocabLists[name]) { showAlert("Eine Liste mit diesem Namen existiert bereits."); return; } const items = []; document.querySelectorAll('.vocab-pair').forEach(pairEl => { const word = pairEl.querySelector('.vocab-word-input').value.trim(); const translation = listType === 'vocab' ? pairEl.querySelector('.vocab-translation-input').value.trim() : undefined; if(word && (listType === 'spelling' || translation)) { const existingItem = (originalName && vocabLists[originalName]) ? vocabLists[originalName].items.find(p => p.word === word) : null; items.push(existingItem || { word, translation, level: 1, correctStreak: 0 }); } }); if (items.length === 0) { showAlert("Bitte fülle mindestens ein Feld aus."); return; } if (originalName && name !== originalName) delete vocabLists[originalName]; vocabLists[name] = { type: listType, items: items }; saveVocabLists(); renderVocabListsView(); }
        function openVocabStartModal(listName) { currentVocabList = listName; const list = vocabLists[listName]; if (list.type === 'spelling') { startVocabQuiz(listName, 'all'); return; } document.getElementById('modal-list-title').textContent = 'Wie möchtest du lernen?'; document.getElementById('modal-list-name').textContent = `Liste: "${listName}"`; const difficultVocab = list.items.filter(v => (v.level || 1) < 5); document.querySelector('[data-action="start-difficult-vocab"]').disabled = difficultVocab.length === 0; document.querySelector('[data-action="start-difficult-vocab"]').textContent = `Nur schwierige Vokabeln (${difficultVocab.length})`; document.getElementById('vocab-start-modal').classList.add('visible'); }
        function startVocabQuiz(listName, mode) { closeAllModals(); currentQuizType = 'vocab'; currentVocabList = listName; correctAnswersCount = 0; currentQuestionIndex = 0; const listData = vocabLists[listName]; let listToLearn = [...listData.items]; if (mode === 'difficult') { listToLearn = listToLearn.filter(v => (v.level || 1) < 5); } if (listToLearn.length === 0) { showAlert('Keine schwierigen Vokabeln zu lernen!'); return; } if (listData.type === 'spelling') { quizQuestions = listToLearn.map(v => ({ question: v.word, answer: v.word, type: 'spelling' })); } else { quizQuestions = listToLearn.map(v => ({ question: v.word, answer: v.translation, type: 'vocab' })); } quizQuestions.sort(() => Math.random() - 0.5); document.getElementById('vocab-lists-view').classList.add('hidden'); document.getElementById('vocab-quiz-view').classList.remove('hidden'); document.getElementById('vocab-results-view').classList.add('hidden'); displayVocabQuestion(); }
        function displayVocabQuestion() { if(currentQuestionIndex >= quizQuestions.length) { showVocabResults(); return; } const q = quizQuestions[currentQuestionIndex]; const promptEl = document.getElementById('vocab-question-prompt'); const wordEl = document.getElementById('vocab-word'); const playBtn = document.getElementById('play-word-btn'); if (q.type === 'spelling') { promptEl.textContent = 'Schreibe das Wort:'; wordEl.textContent = ''; playBtn.classList.remove('hidden'); playBtn.dataset.word = q.question; setTimeout(() => speak(q.question), 200); } else { promptEl.textContent = 'Was heißt'; wordEl.textContent = q.question; playBtn.classList.add('hidden'); } document.getElementById('vocab-question-counter').textContent = `Frage ${currentQuestionIndex + 1} von ${quizQuestions.length}`; document.getElementById('vocab-progress-bar').style.width = `${((currentQuestionIndex) / quizQuestions.length) * 100}%`; document.querySelector('[data-action="check-vocab-answer"]').disabled = false; document.getElementById('vocab-answer').value = ''; document.getElementById('vocab-answer').focus(); document.getElementById('vocab-feedback').textContent = ''; }
        function checkVocabAnswer() { const userAnswer = document.getElementById('vocab-answer').value.trim(); if (!userAnswer) return; document.querySelector('[data-action="check-vocab-answer"]').disabled = true; const q = quizQuestions[currentQuestionIndex]; const feedbackEl = document.getElementById('vocab-feedback'); const vocabItem = vocabLists[currentVocabList].items.find(v => v.word === q.question); if (userAnswer.toLowerCase() === q.answer.toLowerCase()) { correctAnswersCount++; feedbackEl.textContent = 'Richtig! Drücke Enter zum Fortfahren.'; feedbackEl.style.color = 'var(--success-color)'; canSkipFeedback = true; if (vocabItem) { vocabItem.level = Math.min(5, (vocabItem.level || 1) + 1); vocabItem.correctStreak = (vocabItem.correctStreak || 0) + 1; } } else { feedbackEl.textContent = `Falsch. Richtig wäre: ${q.answer}`; feedbackEl.style.color = 'var(--danger-color)'; if (vocabItem) { vocabItem.level = 1; vocabItem.correctStreak = 0; } } saveVocabLists(); feedbackTimeout = setTimeout(proceedToNextQuestion, 2500); }
        function showVocabResults() { document.getElementById('vocab-quiz-view').classList.add('hidden'); const resultsView = document.getElementById('vocab-results-view'); resultsView.classList.remove('hidden'); const pointsEarned = correctAnswersCount; const xpEarned = Math.round(correctAnswersCount * 1.5); addPoints(pointsEarned); addXp(xpEarned); updateStreak(); resultsView.innerHTML = `<h2 class="view-title">Ergebnis</h2> <p>Du hast ${correctAnswersCount} von ${quizQuestions.length} Vokabeln richtig gewusst.</p> <p id="results-points">+${pointsEarned} Punkte & +${xpEarned} XP</p> <div class="button-group"> <button data-action="start-vocab-quiz-from-result" data-list-name="${currentVocabList}">Nochmal</button> <button data-hash="#vocabulary">Zurück zu den Listen</button> </div>`; if (correctAnswersCount === quizQuestions.length) jsConfetti.addConfetti(); }
        function downloadVocabListAsPDF(listName) { const listData = vocabLists[listName]; if (!listData) return; const { jsPDF } = window.jspdf; const doc = new jsPDF(); doc.setFontSize(18); doc.text(`Lernstand für Liste: ${listName}`, 14, 22); doc.setFontSize(12); doc.text(`Stand: ${new Date().toLocaleDateString('de-DE')}`, 14, 30); let y = 45; listData.items.forEach(item => { if (y > 280) { doc.addPage(); y = 20; } const level = item.level || 1; const translationText = listData.type === 'vocab' ? `\nÜbersetzung: ${item.translation}` : ''; const statusText = `Wort: ${item.word}${translationText}\nLern-Level: ${level}/5`; doc.text(statusText, 14, y); y += 20; }); doc.save(`${listName}_Lernstand.pdf`); }
        function proceedToNextQuestion() { clearTimeout(feedbackTimeout); canSkipFeedback = false; document.getElementById('feedback-message').textContent = ''; document.getElementById('vocab-feedback').textContent = ''; currentQuestionIndex++; if (currentQuizType === 'math') { displayCurrentQuestion(); } else if (currentQuizType === 'vocab') { document.getElementById('vocab-progress-bar').style.width = `${((currentQuestionIndex) / quizQuestions.length) * 100}%`; displayVocabQuestion(); } }
        async function handleFileScan() {
            const fileInput = document.getElementById('vocab-scan-input');
            const file = fileInput.files[0];
            if (!file) {
                showAlert("Bitte wähle zuerst eine Bilddatei aus.");
                return;
            }
            const feedbackEl = document.getElementById('vocab-scan-feedback');
            feedbackEl.innerHTML = '<div class="loading-spinner"></div><p>Bild wird analysiert. Dies kann einen Moment dauern...</p>';

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Data = reader.result.split(',')[1];
                
                // WICHTIG: Der API-Aufruf erfolgt jetzt über einen "Proxy".
                // Du darfst den API-Schlüssel NIEMALS direkt hier im Code haben.
                // Dieser Endpunkt '/api/scan-vocab' muss auf eine Serverless Function verweisen.
                // Mehr dazu in der Erklärung unter dem Code.
                const proxyApiUrl = '/api/scan-vocab'; 

                const payload = {
                    mimeType: file.type,
                    data: base64Data
                };

                try {
                    const response = await fetch(proxyApiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                         const errorText = await response.text();
                         throw new Error(`Fehler vom Server: ${response.status} - ${errorText}`);
                    }
                    
                    const result = await response.json();
                    
                    // Die Serverless Function sollte das bereinigte JSON direkt zurückgeben.
                    const extractedVocabs = result.vocabs;

                    if (Array.isArray(extractedVocabs) && extractedVocabs.length > 0) {
                        showVocabEditor(); // Editor-Ansicht öffnen
                        document.getElementById('vocab-list-name').value = `Gescannte Liste - ${new Date().toLocaleDateString()}`;
                        const fieldsContainer = document.getElementById('vocab-input-fields');
                        fieldsContainer.innerHTML = ''; // Bestehende Felder leeren
                        extractedVocabs.forEach(pair => {
                            if(pair.word && pair.translation) addVocabPairInput(pair.word, pair.translation);
                        });
                          feedbackEl.innerHTML = `<p style="color:var(--success-color)">${extractedVocabs.length} Vokabeln gefunden und in den Editor geladen!</p>`;
                    } else {
                        throw new Error("Keine Vokabeln gefunden oder die Antwort war leer.");
                    }
                } catch (error) {
                    console.error("Fehler bei der Vokabel-Erkennung:", error);
                    feedbackEl.innerHTML = `<p style="color:var(--danger-color)">Fehler: ${error.message}. Bitte versuche es erneut oder gib die Vokabeln manuell ein.</p>`;
                }
            };
            reader.readAsDataURL(file);
        }
        function addVocabPairInput(word = '', translation = '') {
            const container = document.getElementById('vocab-input-fields');
            const pairDiv = document.createElement('div');
            pairDiv.className = 'vocab-pair';
            pairDiv.innerHTML = `
                <input type="text" class="vocab-word-input" placeholder="Wort / Satz" value="${word}">
                <input type="text" class="vocab-translation-input" placeholder="Übersetzung" value="${translation}">
                <button data-action="remove-vocab-pair" class="danger">X</button>
            `;
            container.appendChild(pairDiv);
            toggleVocabEditorMode(document.querySelector('input[name="vocab-list-type"]:checked').value);
        }

        // === Shop & Spiele ===
        function renderShop() { document.querySelectorAll("#shop-items .shop-item").forEach(item => { const rank = item.dataset.rank; item.querySelector("button").disabled = RANK_ORDER[userRank] < RANK_ORDER[rank]; item.classList.toggle('locked', RANK_ORDER[userRank] < RANK_ORDER[rank]); }); }
        function buyGame(game, cost) { if (spendPoints(cost)) { startGame(game); } else { showAlert("Nicht genügend Punkte!"); } }
        function startGame(game) { window.location.hash = '#game'; const initializers = { "guess-the-number": initGuessTheNumber, "hangman": initHangman, "tic-tac-toe": initTicTacToe, "dino-run": initDinoRun, "memory": initMemoryGame }; if (initializers[game]) { setTimeout(() => initializers[game](), 100); } }
        function stopAllActivities() { if (readingTimerInterval) stopReadingTimer(false); clearInterval(activeGameInterval); activeGameInterval = null; dinoGame.active = false; const gameContent = document.getElementById("game-content"); if (gameContent) { gameContent.innerHTML = ""; }}
        
        // === Spiel-Logik ===
        function initGuessTheNumber() {
            const gameContent = document.getElementById('game-content');
            const targetNumber = Math.floor(Math.random() * 100) + 1;
            gameContent.innerHTML = `
                <h3>Errate die Zahl!</h3>
                <p>Ich denke an eine Zahl zwischen 1 und 100.</p>
                <input type="number" id="guess-input" placeholder="Dein Tipp" data-game-target="${targetNumber}" data-attempts="0">
                <button data-action="check-guess">Raten</button>
                <p id="game-feedback"></p>
                <button class="game-restart-btn" data-action="buy-game" data-game="guess-the-number" data-cost="12">Neue Runde</button>
            `;
        }

        function initDinoRun() {
            const gameContent = document.getElementById('game-content');
            gameContent.innerHTML = `
                <h3>Dino Run</h3>
                <p>Drücke die Leertaste zum Springen!</p>
                <canvas id="dino-canvas" width="600" height="200"></canvas>
                 <button class="game-restart-btn" data-action="buy-game" data-game="dino-run" data-cost="15">Neustart</button>
            `;

            const canvas = document.getElementById('dino-canvas');
            const ctx = canvas.getContext('2d');
            dinoGame = {
                active: true,
                player: { x: 50, y: 150, width: 20, height: 50, dy: 0, gravity: 0.8, jumpPower: -15, onGround: true },
                obstacles: [],
                score: 0,
                frame: 0,
                jump() { if (this.player.onGround) { this.player.dy = this.player.jumpPower; this.player.onGround = false; } },
                update() {
                    // Player
                    this.player.dy += this.player.gravity;
                    this.player.y += this.player.dy;
                    if (this.player.y + this.player.height >= canvas.height - 10) {
                        this.player.y = canvas.height - 10 - this.player.height;
                        this.player.dy = 0;
                        this.player.onGround = true;
                    }
                    
                    // Obstacles
                    if (this.frame % 90 === 0) { this.obstacles.push({ x: canvas.width, width: 20, height: Math.random() * 30 + 20 }); }
                    this.obstacles.forEach(obs => { obs.x -= 4; });
                    this.obstacles = this.obstacles.filter(obs => obs.x + obs.width > 0);

                    // Collision
                    this.obstacles.forEach(obs => {
                        if (this.player.x < obs.x + obs.width && this.player.x + this.player.width > obs.x &&
                            this.player.y < canvas.height - 10 && this.player.y + this.player.height > canvas.height - 10 - obs.height) {
                            dinoGame.active = false;
                            showAlert(`Spiel vorbei! Score: ${dinoGame.score}`, 'Game Over');
                        }
                    });

                    this.score++; this.frame++;
                },
                draw() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // Ground
                    ctx.fillStyle = '#333';
                    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
                    // Player
                    ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
                    // Obstacles
                    ctx.fillStyle = 'red';
                    this.obstacles.forEach(obs => { ctx.fillRect(obs.x, canvas.height - 10 - obs.height, obs.width, obs.height); });
                    // Score
                    ctx.fillStyle = '#333'; ctx.font = '20px Arial'; ctx.fillText(`Score: ${this.score}`, 10, 30);
                }
            };
            
            function gameLoop() {
                if (!dinoGame.active) return;
                dinoGame.update();
                dinoGame.draw();
                requestAnimationFrame(gameLoop);
            }
            gameLoop();
        }

        function initMemoryGame() {
            const gameContent = document.getElementById('game-content');
            const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
            const cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
            let flippedCards = [], matchedPairs = 0, canFlip = true;

            gameContent.innerHTML = '<h3>Memory</h3><div class="memory-board"></div> <button class="game-restart-btn" data-action="buy-game" data-game="memory" data-cost="18">Neustart</button>';
            const board = gameContent.querySelector('.memory-board');
            
            cards.forEach((emoji, index) => {
                const card = document.createElement('div');
                card.classList.add('memory-card');
                card.dataset.index = index;
                card.innerHTML = `
                    <div class="card-face card-front"></div>
                    <div class="card-face card-back">${emoji}</div>
                `;
                card.addEventListener('click', () => {
                    if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) return;
                    card.classList.add('flipped');
                    flippedCards.push(card);
                    if (flippedCards.length === 2) {
                        canFlip = false;
                        const [card1, card2] = flippedCards;
                        if (card1.querySelector('.card-back').textContent === card2.querySelector('.card-back').textContent) {
                            card1.classList.add('matched'); card2.classList.add('matched');
                            matchedPairs++;
                            flippedCards = [];
                            canFlip = true;
                            if (matchedPairs === emojis.length) {
                                jsConfetti.addConfetti();
                                showAlert('Du hast gewonnen!', 'Glückwunsch!');
                            }
                        } else {
                            setTimeout(() => {
                                card1.classList.remove('flipped'); card2.classList.remove('flipped');
                                flippedCards = [];
                                canFlip = true;
                            }, 1000);
                        }
                    }
                });
                board.appendChild(card);
            });
        }
        
        function initHangman() {
            const words = ["HAUS", "AUTO", "SCHULE", "COMPUTER", "PROGRAMM", "LERNEN", "BELOHNUNG"];
            hg_secretWord = words[Math.floor(Math.random() * words.length)];
            hg_guessedLetters = new Set();
            hg_wrongGuesses = 0;
            hg_gameActive = true;
            
            const gameContent = document.getElementById('game-content');
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');
            gameContent.innerHTML = `
                <h3>Hangman</h3>
                <div id="hangman-drawing"></div>
                <div id="hangman-word"></div>
                <div id="hangman-letters">
                    ${alphabet.map(letter => `<button class="hangman-letter" data-action="hangman-letter">${letter}</button>`).join('')}
                </div>
                 <button class="game-restart-btn" data-action="buy-game" data-game="hangman" data-cost="40">Neustart</button>
            `;
            updateHangmanDisplay();
        }

        function updateHangmanDisplay() {
            if (!hg_gameActive) return;
            const wordDisplay = document.getElementById('hangman-word');
            wordDisplay.textContent = hg_secretWord.split('').map(letter => hg_guessedLetters.has(letter) ? letter : '_').join('');

            const drawingParts = [
                '  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========',
                '  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========',
                '  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========',
                '  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========',
                '  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========',
                '  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========',
                '  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========='
            ];
            document.getElementById('hangman-drawing').textContent = drawingParts[hg_wrongGuesses];
            if (!wordDisplay.textContent.includes('_')) endGameHangman(true);
        }
        
        function endGameHangman(won) {
            hg_gameActive = false;
            if (won) {
                showAlert('Du hast gewonnen!', 'Glückwunsch!');
                jsConfetti.addConfetti();
            } else {
                showAlert(`Verloren! Das Wort war: ${hg_secretWord}`, 'Schade!');
            }
            document.querySelectorAll('.hangman-letter').forEach(btn => btn.disabled = true);
        }

        function initTicTacToe() {
            ttt_boardState = Array(9).fill(null);
            ttt_gameActive = true;
            const gameContent = document.getElementById('game-content');
            gameContent.innerHTML = `
                <h3>Tic-Tac-Toe</h3>
                <p id="ttt-status">Du bist am Zug (X)</p>
                <div class="tic-tac-toe-board">
                    ${Array(9).fill(0).map((_, i) => `<div class="tic-tac-toe-cell" data-action="ttt-cell" data-index="${i}"></div>`).join('')}
                </div>
                <button class="game-restart-btn" data-action="buy-game" data-game="tic-tac-toe" data-cost="20">Neustart</button>
            `;
        }

        // --- ZENTRALE KLICK-STEUERUNG ---
        const handleGlobalClick = (e) => {
            const target = e.target.closest('[data-action], [data-hash]');
            if (!target) return;
            const { action, hash, op, game, cost, listName } = target.dataset;

            if (hash) { window.location.hash = hash; return; }
            
            switch(action) {
                case 'save-name': handleSaveName(); break;
                case 'admin-login': handleAdminLogin(); break;
                case 'admin-set-name': handleAdminSetName(); break;
                case 'admin-set-points': handleSetPoints(); break;
                case 'admin-set-xp': handleSetXp(); break;
                case 'admin-set-rank': handleSetRank(); break;
                case 'admin-set-streak': handleSetStreak(); break;
                case 'start-math': startMathQuiz(op); break;
                case 'check-math-answer': checkMathAnswer(); break;
                case 'back-to-math-menu': document.getElementById("math-results").classList.add("hidden"); document.getElementById("math-home").classList.remove("hidden"); break;
                case 'reading-timer-start': startReadingTimer(); break;
                case 'reading-timer-pause': pauseReadingTimer(); break;
                case 'reading-timer-resume': startReadingTimer(); break;
                case 'reading-timer-stop': stopReadingTimer(); break;
                case 'back-to-shop': window.location.hash = '#shop'; break;
                case 'show-vocab-editor': showVocabEditor(); break;
                case 'save-vocab-list': saveVocabList(); break;
                case 'cancel-vocab-edit': renderVocabListsView(); break;
                case 'start-vocab-quiz': openVocabStartModal(listName); break;
                case 'start-vocab-quiz-from-result': openVocabStartModal(listName); break;
                case 'start-all-vocab': startVocabQuiz(currentVocabList, 'all'); break;
                case 'start-difficult-vocab': startVocabQuiz(currentVocabList, 'difficult'); break;
                case 'close-modal': closeAllModals(); break;
                case 'edit-vocab-list': showVocabEditor(listName); break;
                case 'delete-vocab-list': showConfirm(`Liste "${listName}" wirklich löschen?`, () => { delete vocabLists[listName]; saveVocabLists(); renderVocabListsView(); }); break;
                case 'download-vocab-pdf': downloadVocabListAsPDF(listName); break;
                case 'check-vocab-answer': checkVocabAnswer(); break;
                case 'scan-vocab-list': handleFileScan(); break;
                case 'add-vocab-pair': addVocabPairInput(); break;
                case 'remove-vocab-pair': target.closest('.vocab-pair').remove(); break;
                case 'buy-game': buyGame(game, parseInt(cost, 10)); break;
                case 'play-word': if(target.dataset.word) speak(target.dataset.word); break;
                case 'check-guess': {
                    const input = document.getElementById('guess-input'); const feedback = document.getElementById('game-feedback'); const guess = parseInt(input.value, 10); const targetNumber = parseInt(input.dataset.gameTarget, 10); let attempts = parseInt(input.dataset.attempts, 10) + 1; input.dataset.attempts = attempts;
                    if (isNaN(guess)) { feedback.textContent = "Bitte gib eine Zahl ein."; return; }
                    if (guess === targetNumber) { feedback.innerHTML = `<strong>Richtig!</strong> Du hast die Zahl ${targetNumber} in ${attempts} Versuchen erraten.`; feedback.style.color = 'var(--success-color)'; target.disabled = true; jsConfetti.addConfetti(); }
                    else if (guess < targetNumber) { feedback.textContent = "Zu niedrig! Versuche es nochmal."; }
                    else { feedback.textContent = "Zu hoch! Versuche es nochmal."; }
                    input.value = ''; input.focus();
                    break;
                }
                case 'ttt-cell': {
                    const statusEl = document.getElementById('ttt-status'); const boardEl = document.querySelector('.tic-tac-toe-board'); const index = parseInt(target.dataset.index, 10);
                    if (!ttt_gameActive || ttt_boardState[index] !== null) { break; }
                    
                    ttt_boardState[index] = 'X'; target.textContent = 'X';

                    const checkResult = () => { const wc = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; for (const condition of wc) { const [a,b,c] = condition; if (ttt_boardState[a] && ttt_boardState[a] === ttt_boardState[b] && ttt_boardState[a] === ttt_boardState[c]) return ttt_boardState[a]; } return ttt_boardState.includes(null) ? null : 'draw'; };
                    
                    let result = checkResult();
                    if (result) {
                        ttt_gameActive = false; statusEl.textContent = result === 'draw' ? "Unentschieden!" : "Du hast gewonnen!";
                        if (result === 'X') jsConfetti.addConfetti();
                        break;
                    }

                    statusEl.textContent = 'Computer ist am Zug...'; boardEl.classList.add('disabled');
                    setTimeout(() => {
                        const availableCells = [];
                        ttt_boardState.forEach((val, idx) => { if (val === null) availableCells.push(idx); });
                        if (availableCells.length > 0) {
                            const computerMoveIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
                            ttt_boardState[computerMoveIndex] = 'O'; document.querySelector(`.tic-tac-toe-cell[data-index='${computerMoveIndex}']`).textContent = 'O';
                        }
                        result = checkResult();
                        if (result) {
                            ttt_gameActive = false; statusEl.textContent = result === 'draw' ? "Unentschieden!" : "Der Computer hat gewonnen!";
                        } else { statusEl.textContent = 'Du bist am Zug (X)'; }
                        boardEl.classList.remove('disabled');
                    }, 600);
                    break;
                }
                case 'hangman-letter': {
                    if (!hg_gameActive || target.disabled) break;
                    const letter = target.textContent;
                    target.disabled = true; hg_guessedLetters.add(letter);
                    if (!hg_secretWord.includes(letter)) { hg_wrongGuesses++; }
                    if (hg_wrongGuesses >= 6) { endGameHangman(false); }
                    updateHangmanDisplay();
                    break;
                }
            }
        };
        init();
    });
    </script>
</body>
</html>


