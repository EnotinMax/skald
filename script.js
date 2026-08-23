// КУЗНИЦА СКАЛЬДА / SKALD'S FORGE v2.4
class ItemSelector {
    constructor(container, initialValue = '') {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.items = [];
        this.selectedId = initialValue;
        this.baseIconUrl = 'https://raw.githubusercontent.com/EnotinMax/skald/main/icons/';
        this.unknownIcon = 'unknown.png';
        this.initDOM();
        this.loadData();
        this.bindEvents();
        if (this.selectedId) { this.input.value = this.selectedId; this.updateIcon(this.selectedId); }
    }
    initDOM() {
        this.container.innerHTML = `
            <div class="item-selector-input-wrapper">
                <img src="${this.baseIconUrl}${this.unknownIcon}" class="item-selector-icon" alt="icon">
                <input type="text" class="item-selector-input" placeholder="Поиск (ID или название)..." autocomplete="off">
            </div>
            <ul class="item-selector-dropdown"></ul>`;
        this.wrapper = this.container.querySelector('.item-selector-input-wrapper');
        this.iconImg = this.container.querySelector('.item-selector-icon');
        this.input = this.container.querySelector('.item-selector-input');
        this.dropdown = this.container.querySelector('.item-selector-dropdown');
    }
    async loadData() {
        try {
            const cacheBuster = `?v=${Date.now()}`;
            const response = await fetch(`${this.baseIconUrl}items.json${cacheBuster}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.items = await response.json();
        } catch (error) {
            console.warn('[ItemSelector] Ошибка загрузки items.json:', error);
        }
    }
    bindEvents() {
        this.input.addEventListener('input', () => this.filterAndRender(this.input.value));
        this.input.addEventListener('focus', () => { if (this.input.value.length > 0) this.filterAndRender(this.input.value); });
        this.input.addEventListener('blur', () => { setTimeout(() => { this.validateAndFinalize(this.input.value); this.dropdown.classList.remove('active'); }, 150); });
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const highlighted = this.dropdown.querySelector('.highlighted');
                if (highlighted) { highlighted.click(); } else { this.validateAndFinalize(this.input.value); this.dropdown.classList.remove('active'); this.input.blur(); }
            } else if (e.key === 'Escape') { this.dropdown.classList.remove('active'); this.input.blur(); }
        });
        this.dropdown.addEventListener('mousedown', (e) => {
            const option = e.target.closest('.item-option');
            if (option) { e.preventDefault(); this.selectItem(option.dataset.id); }
        });
    }
    filterAndRender(query) {
        if (!query) { this.dropdown.classList.remove('active'); return; }
        const lowerQuery = query.toLowerCase();
        const filtered = this.items.filter(item => {
            if (item.id.toLowerCase() === lowerQuery) return true;
            if (item.nameRu && item.nameRu.toLowerCase().includes(lowerQuery)) return true;
            if (item.name && item.name.toLowerCase().includes(lowerQuery)) return true;
            if (item.id.toLowerCase().includes(lowerQuery)) return true;
            return false;
        }).slice(0, 50);
        this.renderDropdown(filtered);
    }
    renderDropdown(items) {
        this.dropdown.innerHTML = '';
        if (items.length === 0) {
            const li = document.createElement('li');
            li.className = 'item-option'; li.style.color = 'var(--text-secondary)'; li.style.fontStyle = 'italic';
            li.textContent = 'Не найдено (сохранится как кастомный ID)';
            this.dropdown.appendChild(li); this.dropdown.classList.add('active'); return;
        }
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'item-option'; li.dataset.id = item.id;
            li.innerHTML = `<img src="${this.baseIconUrl}${item.icon}" alt="${item.id}" onerror="this.src='${this.baseIconUrl}${this.unknownIcon}'">
                <div class="item-option-text"><span class="item-option-name">${item.nameRu || item.name}</span><span class="item-option-id">${item.id}</span></div>`;
            this.dropdown.appendChild(li);
        });
        this.dropdown.classList.add('active');
    }
    selectItem(id) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            this.selectedId = item.id;
            this.input.value = item.id;
            this.iconImg.src = `${this.baseIconUrl}${item.icon}`;
            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        this.dropdown.classList.remove('active');
    }
    validateAndFinalize(inputValue) {
        const trimmedValue = inputValue.trim();
        const exactMatch = this.items.find(i => i.id === trimmedValue);
        if (exactMatch) {
            this.selectItem(exactMatch.id);
        } else if (trimmedValue !== '') {
            this.selectedId = trimmedValue;
            this.input.value = trimmedValue;
            this.iconImg.src = `${this.baseIconUrl}${this.unknownIcon}`;
            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            this.selectedId = '';
            this.iconImg.src = `${this.baseIconUrl}${this.unknownIcon}`;
            this.input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    updateIcon(id) {
        const item = this.items.find(i => i.id === id);
        this.iconImg.src = item ? `${this.baseIconUrl}${item.icon}` : `${this.baseIconUrl}${this.unknownIcon}`;
    }
}

const translations = {
    ru: {
        appTitle: "Кузница Скальда v2.4",
        appSubtitle: "Редактор диалогов и квестов · by OdinSons",
        searchPlaceholder: "Поиск...",
        importFile: "Импортировать",
        export: "Экспорт",
        validate: "Проверить",
        addNode: "+ Диалог",
        addQuest: "+ Квест",
        delete: "Удалить",
        fitToScreen: "По размеру",
        loadSample: "Пример",
        hintText: "Тяни кружок на опции → к узлу, квесту или в пустоту",
        legendTransition: "Переход",
        legendQuestLink: "Связь с квестом",
        legendOtherQuest: "Зависимость квеста",
        legendCondition: "Условие",
        legendCommand: "Команда",
        legendEnd: "Конец",
        paletteTitle: "Квесты",
        propNodeTitle: "Диалог NPC",
        labelNodeId: "ID профиля:",
        labelNodeText: "Текст NPC:",
        propOptionsTitle: "Опции диалога",
        addNodeOption: "+ Добавить опцию",
        propOptionTitle: "Опция игрока",
        labelOptionText: "Текст:",
        labelTransition: "Переход к (ID):",
        labelIcon: "Иконка:",
        propCondTitle: "Условия",
        addCondition: "+ Условие",
        propCmdTitle: "Команды",
        addCommand: "+ Команда",
        emptyStateText: "Выберите блок или создайте новый",
        tabField: "Поле",
        tabCode: "Код",
        applyCode: "Применить изменения",
        copyCode: "Копировать",
        downloadCode: "Скачать файл",
        codeHint: "Изменения применяются по кнопке 'Применить'",
        previewTitle: "Предпросмотр",
        questPreviewTitle: "Предпросмотр квеста",
        condModalTitle: "Добавить условие",
        cmdModalTitle: "Добавить команду",
        save: "Сохранить",
        importStatsTitle: "Результаты импорта",
        statDialoguesLabel: "Найдено диалогов:",
        statQuestsLabel: "Найдено квестов:",
        statUnknownLabel: "Не удалось распознать:",
        importStatsClose: "OK",
        back: "Назад",
        questTypeKill: "Убить",
        questTypeCollect: "Собрать",
        questTypeHarvest: "Собрать урожай",
        questTypeCraft: "Изготовить",
        questTypeTalk: "Разговор",
        questTypeBuild: "Построить",
        questTypeMove: "Переместить",
        targets: "Цели",
        rewards: "Награды",
        requirements: "Требования",
        noTargets: "Нет целей",
        noRewards: "Нет наград",
        noReqs: "Нет требований",
        noDesc: "Нет описания",
        takeQuest: "Взять квест",
        whatToDo: "Что нужно сделать:",
        reward: "Вознаграждение:",
        previewQuestBtn: "Предпросмотр квеста",
        questListTitle: "Квесты",
        newQuest: "+ Новый",
        basic: "Основное",
        time: "Время",
        amount: "Количество:",
        level: "Уровень:",
        targetPrefab: "Предмет/Существо:",
        rewardType: "Тип награды:",
        rewardPrefab: "Предмет:",
        requirementType: "Тип требования:",
        rewardTypeItem: "Предмет",
        rewardTypeCoins: "Монеты",
        rewardTypeExp: "EpicMMO Опыт",
        questPreviewSidebar: "Квесты",
        questPreviewTitle: "Предпросмотр квеста",
        requirementParams: "Параметры:",
        closeFile: "×",
        questDependencyTitle: "Тип зависимости квеста",
        questDependencyOtherQuest: "OtherQuest (квест должен быть выполнен ранее)",
        questDependencyNotFinished: "NotFinished (квест НЕ должен быть выполнен)",
        questDependencyCancel: "Отмена"
    },
    en: {
        appTitle: "Skald's Forge v2.4",
        appSubtitle: "Dialogue & Quest Editor · by OdinSons",
        searchPlaceholder: "Search...",
        importFile: "Import",
        export: "Export",
        validate: "Validate",
        addNode: "+ Dialogue",
        addQuest: "+ Quest",
        delete: "Delete",
        fitToScreen: "Fit Screen",
        loadSample: "Sample",
        hintText: "Drag handle on option → to node, quest or void",
        legendTransition: "Transition",
        legendQuestLink: "Quest Link",
        legendOtherQuest: "Quest Dependency",
        legendCondition: "Condition",
        legendCommand: "Command",
        legendEnd: "End",
        paletteTitle: "Quests",
        propNodeTitle: "NPC Dialogue",
        labelNodeId: "Profile ID:",
        labelNodeText: "NPC Text:",
        propOptionsTitle: "Dialogue Options",
        addNodeOption: "+ Add Option",
        propOptionTitle: "Player Option",
        labelOptionText: "Text:",
        labelTransition: "Transition to (ID):",
        labelIcon: "Icon:",
        propCondTitle: "Conditions",
        addCondition: "+ Condition",
        propCmdTitle: "Commands",
        addCommand: "+ Command",
        emptyStateText: "Select a block or create new",
        tabField: "Canvas",
        tabCode: "Code",
        applyCode: "Apply Changes",
        copyCode: "Copy",
        downloadCode: "Download File",
        codeHint: "Changes applied via 'Apply Changes' button",
        previewTitle: "Preview",
        questPreviewTitle: "Quest Preview",
        condModalTitle: "Add Condition",
        cmdModalTitle: "Add Command",
        save: "Save",
        importStatsTitle: "Import Results",
        statDialoguesLabel: "Dialogues found:",
        statQuestsLabel: "Quests found:",
        statUnknownLabel: "Unrecognized:",
        importStatsClose: "OK",
        back: "Back",
        questTypeKill: "Kill",
        questTypeCollect: "Collect",
        questTypeHarvest: "Harvest",
        questTypeCraft: "Craft",
        questTypeTalk: "Talk",
        questTypeBuild: "Build",
        questTypeMove: "Move",
        targets: "Targets",
        rewards: "Rewards",
        requirements: "Requirements",
        noTargets: "No targets",
        noRewards: "No rewards",
        noReqs: "No requirements",
        noDesc: "No description",
        takeQuest: "Take Quest",
        whatToDo: "What to do:",
        reward: "Reward:",
        previewQuestBtn: "Preview Quest",
        questListTitle: "Quests",
        newQuest: "+ New",
        basic: "Basic",
        time: "Time",
        amount: "Amount:",
        level: "Level:",
        targetPrefab: "Item/Creature:",
        rewardType: "Reward Type:",
        rewardPrefab: "Item:",
        requirementType: "Requirement Type:",
        rewardTypeItem: "Item",
        rewardTypeCoins: "Coins",
        rewardTypeExp: "EpicMMO Exp",
        questPreviewSidebar: "Quests",
        questPreviewTitle: "Quest Preview",
        requirementParams: "Parameters:",
        closeFile: "×",
        questDependencyTitle: "Quest Dependency Type",
        questDependencyOtherQuest: "OtherQuest (quest must be completed before)",
        questDependencyNotFinished: "NotFinished (quest must NOT be completed)",
        questDependencyCancel: "Cancel"
    },
    de: {
        appTitle: "Schmiede des Skalden v2.4",
        appSubtitle: "Dialog- & Quest-Editor · by OdinSons",
        searchPlaceholder: "Suche...",
        importFile: "Importieren",
        export: "Exportieren",
        validate: "Überprüfen",
        addNode: "+ Dialog",
        addQuest: "+ Quest",
        delete: "Löschen",
        fitToScreen: "Einpassen",
        loadSample: "Beispiel",
        hintText: "Ziehe den Griff an der Option → zu Knoten, Quest oder Leere",
        legendTransition: "Übergang",
        legendQuestLink: "Quest-Verknüpfung",
        legendOtherQuest: "Quest-Abhängigkeit",
        legendCondition: "Bedingung",
        legendCommand: "Befehl",
        legendEnd: "Ende",
        paletteTitle: "Quests",
        propNodeTitle: "NPC-Dialog",
        labelNodeId: "Profil-ID:",
        labelNodeText: "NPC-Text:",
        propOptionsTitle: "Dialogoptionen",
        addNodeOption: "+ Option hinzufügen",
        propOptionTitle: "Spieleroption",
        labelOptionText: "Text:",
        labelTransition: "Übergang zu (ID):",
        labelIcon: "Symbol:",
        propCondTitle: "Bedingungen",
        addCondition: "+ Bedingung",
        propCmdTitle: "Befehle",
        addCommand: "+ Befehl",
        emptyStateText: "Wähle einen Block oder erstelle einen neuen",
        tabField: "Feld",
        tabCode: "Code",
        applyCode: "Änderungen übernehmen",
        copyCode: "Kopieren",
        downloadCode: "Datei herunterladen",
        codeHint: "Änderungen werden per 'Übernehmen'-Button angewendet",
        previewTitle: "Vorschau",
        questPreviewTitle: "Quest-Vorschau",
        condModalTitle: "Bedingung hinzufügen",
        cmdModalTitle: "Befehl hinzufügen",
        save: "Speichern",
        importStatsTitle: "Importergebnisse",
        statDialoguesLabel: "Dialoge gefunden:",
        statQuestsLabel: "Quests gefunden:",
        statUnknownLabel: "Nicht erkannt:",
        importStatsClose: "OK",
        back: "Zurück",
        questTypeKill: "Töten",
        questTypeCollect: "Sammeln",
        questTypeHarvest: "Ernten",
        questTypeCraft: "Herstellen",
        questTypeTalk: "Sprechen",
        questTypeBuild: "Bauen",
        questTypeMove: "Bewegen",
        targets: "Ziele",
        rewards: "Belohnungen",
        requirements: "Anforderungen",
        noTargets: "Keine Ziele",
        noRewards: "Keine Belohnungen",
        noReqs: "Keine Anforderungen",
        noDesc: "Keine Beschreibung",
        takeQuest: "Quest annehmen",
        whatToDo: "Was zu tun ist:",
        reward: "Belohnung:",
        previewQuestBtn: "Quest-Vorschau",
        questListTitle: "Quests",
        newQuest: "+ Neu",
        basic: "Allgemein",
        time: "Zeit",
        amount: "Menge:",
        level: "Stufe:",
        targetPrefab: "Gegenstand/Kreatur:",
        rewardType: "Belohnungstyp:",
        rewardPrefab: "Gegenstand:",
        requirementType: "Anforderungstyp:",
        rewardTypeItem: "Gegenstand",
        rewardTypeCoins: "Münzen",
        rewardTypeExp: "EpicMMO Exp",
        questPreviewSidebar: "Quests",
        questPreviewTitle: "Quest-Vorschau",
        requirementParams: "Parameter:",
        closeFile: "×",
        questDependencyTitle: "Quest-Abhängigkeitstyp",
        questDependencyOtherQuest: "OtherQuest (Quest muss vorher abgeschlossen sein)",
        questDependencyNotFinished: "NotFinished (Quest darf NICHT abgeschlossen sein)",
        questDependencyCancel: "Abbrechen"
    },
    es: {
        appTitle: "Forja del Escaldo v2.4",
        appSubtitle: "Editor de diálogos y misiones · by OdinSons",
        searchPlaceholder: "Buscar...",
        importFile: "Importar",
        export: "Exportar",
        validate: "Validar",
        addNode: "+ Diálogo",
        addQuest: "+ Misión",
        delete: "Eliminar",
        fitToScreen: "Ajustar",
        loadSample: "Ejemplo",
        hintText: "Arrastra el círculo de la opción → al nodo, misión o vacío",
        legendTransition: "Transición",
        legendQuestLink: "Vínculo con misión",
        legendOtherQuest: "Dependencia de misión",
        legendCondition: "Condición",
        legendCommand: "Comando",
        legendEnd: "Fin",
        paletteTitle: "Misiones",
        propNodeTitle: "Diálogo del NPC",
        labelNodeId: "ID de perfil:",
        labelNodeText: "Texto del NPC:",
        propOptionsTitle: "Opciones del diálogo",
        addNodeOption: "+ Añadir opción",
        propOptionTitle: "Opción del jugador",
        labelOptionText: "Texto:",
        labelTransition: "Transición a (ID):",
        labelIcon: "Icono:",
        propCondTitle: "Condiciones",
        addCondition: "+ Condición",
        propCmdTitle: "Comandos",
        addCommand: "+ Comando",
        emptyStateText: "Selecciona un bloque o crea uno nuevo",
        tabField: "Campo",
        tabCode: "Código",
        applyCode: "Aplicar cambios",
        copyCode: "Copiar",
        downloadCode: "Descargar archivo",
        codeHint: "Los cambios se aplican con el botón 'Aplicar'",
        previewTitle: "Vista previa",
        questPreviewTitle: "Vista previa de misión",
        condModalTitle: "Añadir condición",
        cmdModalTitle: "Añadir comando",
        save: "Guardar",
        importStatsTitle: "Resultados de importación",
        statDialoguesLabel: "Diálogos encontrados:",
        statQuestsLabel: "Misiones encontradas:",
        statUnknownLabel: "No reconocidos:",
        importStatsClose: "OK",
        back: "Atrás",
        questTypeKill: "Matar",
        questTypeCollect: "Acumular",
        questTypeHarvest: "Recolectar",
        questTypeCraft: "Fabricar",
        questTypeTalk: "Hablar",
        questTypeBuild: "Construir",
        questTypeMove: "Mover",
        targets: "Objetivos",
        rewards: "Recompensas",
        requirements: "Requisitos",
        noTargets: "Sin objetivos",
        noRewards: "Sin recompensas",
        noReqs: "Sin requisitos",
        noDesc: "Sin descripción",
        takeQuest: "Aceptar misión",
        whatToDo: "Qué hay que hacer:",
        reward: "Recompensa:",
        previewQuestBtn: "Vista previa de misión",
        questListTitle: "Misiones",
        newQuest: "+ Nueva",
        basic: "General",
        time: "Tiempo",
        amount: "Cantidad:",
        level: "Nivel:",
        targetPrefab: "Objeto/Criatura:",
        rewardType: "Tipo de recompensa:",
        rewardPrefab: "Objeto:",
        requirementType: "Tipo de requisito:",
        rewardTypeItem: "Objeto",
        rewardTypeCoins: "Monedas",
        rewardTypeExp: "EpicMMO Exp",
        questPreviewSidebar: "Misiones",
        questPreviewTitle: "Vista previa de misión",
        requirementParams: "Parámetros:",
        closeFile: "×",
        questDependencyTitle: "Tipo de dependencia de misión",
        questDependencyOtherQuest: "OtherQuest (la misión debe completarse antes)",
        questDependencyNotFinished: "NotFinished (la misión NO debe completarse)",
        questDependencyCancel: "Cancelar"
    },
    fr: {
        appTitle: "Forge du Skalde v2.4",
        appSubtitle: "Éditeur de dialogues et quêtes · by OdinSons",
        searchPlaceholder: "Rechercher...",
        importFile: "Importer",
        export: "Exporter",
        validate: "Valider",
        addNode: "+ Dialogue",
        addQuest: "+ Quête",
        delete: "Supprimer",
        fitToScreen: "Ajuster",
        loadSample: "Exemple",
        hintText: "Fais glisser le cercle de l'option → vers le nœud, la quête ou le vide",
        legendTransition: "Transition",
        legendQuestLink: "Lien avec quête",
        legendOtherQuest: "Dépendance de quête",
        legendCondition: "Condition",
        legendCommand: "Commande",
        legendEnd: "Fin",
        paletteTitle: "Quêtes",
        propNodeTitle: "Dialogue PNJ",
        labelNodeId: "ID du profil :",
        labelNodeText: "Texte du PNJ :",
        propOptionsTitle: "Options du dialogue",
        addNodeOption: "+ Ajouter option",
        propOptionTitle: "Option du joueur",
        labelOptionText: "Texte :",
        labelTransition: "Transition vers (ID) :",
        labelIcon: "Icône :",
        propCondTitle: "Conditions",
        addCondition: "+ Condition",
        propCmdTitle: "Commandes",
        addCommand: "+ Commande",
        emptyStateText: "Sélectionnez un bloc ou créez-en un nouveau",
        tabField: "Champ",
        tabCode: "Code",
        applyCode: "Appliquer les modifications",
        copyCode: "Copier",
        downloadCode: "Télécharger le fichier",
        codeHint: "Les modifications sont appliquées via le bouton 'Appliquer'",
        previewTitle: "Aperçu",
        questPreviewTitle: "Aperçu de quête",
        condModalTitle: "Ajouter condition",
        cmdModalTitle: "Ajouter commande",
        save: "Enregistrer",
        importStatsTitle: "Résultats d'importation",
        statDialoguesLabel: "Dialogues trouvés :",
        statQuestsLabel: "Quêtes trouvées :",
        statUnknownLabel: "Non reconnus :",
        importStatsClose: "OK",
        back: "Retour",
        questTypeKill: "Tuer",
        questTypeCollect: "Accumuler",
        questTypeHarvest: "Récolter",
        questTypeCraft: "Fabriquer",
        questTypeTalk: "Parler",
        questTypeBuild: "Construire",
        questTypeMove: "Déplacer",
        targets: "Objectifs",
        rewards: "Récompenses",
        requirements: "Exigences",
        noTargets: "Pas d'objectifs",
        noRewards: "Pas de récompenses",
        noReqs: "Pas d'exigences",
        noDesc: "Pas de description",
        takeQuest: "Accepter quête",
        whatToDo: "Ce qu'il faut faire :",
        reward: "Récompense :",
        previewQuestBtn: "Aperçu de quête",
        questListTitle: "Quêtes",
        newQuest: "+ Nouveau",
        basic: "Général",
        time: "Temps",
        amount: "Quantité :",
        level: "Niveau :",
        targetPrefab: "Objet/Créature :",
        rewardType: "Type de récompense :",
        rewardPrefab: "Objet :",
        requirementType: "Type d'exigence :",
        rewardTypeItem: "Objet",
        rewardTypeCoins: "Pièces",
        rewardTypeExp: "EpicMMO Exp",
        questPreviewSidebar: "Quêtes",
        questPreviewTitle: "Aperçu de quête",
        requirementParams: "Paramètres :",
        closeFile: "×",
        questDependencyTitle: "Type de dépendance de quête",
        questDependencyOtherQuest: "OtherQuest (la quête doit être terminée avant)",
        questDependencyNotFinished: "NotFinished (la quête ne doit PAS être terminée)",
        questDependencyCancel: "Annuler"
    },
    pl: {
        appTitle: "Kuźnia Skalda v2.4",
        appSubtitle: "Edytor dialogów i zadań · by OdinSons",
        searchPlaceholder: "Szukaj...",
        importFile: "Importuj",
        export: "Eksportuj",
        validate: "Sprawdź",
        addNode: "+ Dialog",
        addQuest: "+ Zadanie",
        delete: "Usuń",
        fitToScreen: "Dopasuj",
        loadSample: "Przykład",
        hintText: "Przeciągnij kółko przy opcji → do węzła, zadania lub pustki",
        legendTransition: "Przejście",
        legendQuestLink: "Powiązanie z zadaniem",
        legendOtherQuest: "Zależność zadania",
        legendCondition: "Warunek",
        legendCommand: "Polecenie",
        legendEnd: "Koniec",
        paletteTitle: "Zadania",
        propNodeTitle: "Dialog NPC",
        labelNodeId: "ID profilu:",
        labelNodeText: "Tekst NPC:",
        propOptionsTitle: "Opcje dialogu",
        addNodeOption: "+ Dodaj opcję",
        propOptionTitle: "Opcja gracza",
        labelOptionText: "Tekst:",
        labelTransition: "Przejście do (ID):",
        labelIcon: "Ikona:",
        propCondTitle: "Warunki",
        addCondition: "+ Warunek",
        propCmdTitle: "Polecenia",
        addCommand: "+ Polecenie",
        emptyStateText: "Wybierz blok lub utwórz nowy",
        tabField: "Pole",
        tabCode: "Kod",
        applyCode: "Zastosuj zmiany",
        copyCode: "Kopiuj",
        downloadCode: "Pobierz plik",
        codeHint: "Zmiany są stosowane przyciskiem 'Zastosuj'",
        previewTitle: "Podgląd",
        questPreviewTitle: "Podgląd zadania",
        condModalTitle: "Dodaj warunek",
        cmdModalTitle: "Dodaj polecenie",
        save: "Zapisz",
        importStatsTitle: "Wyniki importu",
        statDialoguesLabel: "Znalezione dialogi:",
        statQuestsLabel: "Znalezione zadania:",
        statUnknownLabel: "Nierozpoznane:",
        importStatsClose: "OK",
        back: "Wstecz",
        questTypeKill: "Zabić",
        questTypeCollect: "Zgromadzić",
        questTypeHarvest: "Zebrać",
        questTypeCraft: "Wytworzyć",
        questTypeTalk: "Porozmawiać",
        questTypeBuild: "Zbudować",
        questTypeMove: "Przenieść",
        targets: "Cele",
        rewards: "Nagrody",
        requirements: "Wymagania",
        noTargets: "Brak celów",
        noRewards: "Brak nagród",
        noReqs: "Brak wymagań",
        noDesc: "Brak opisu",
        takeQuest: "Przyjmij zadanie",
        whatToDo: "Co trzeba zrobić:",
        reward: "Nagroda:",
        previewQuestBtn: "Podgląd zadania",
        questListTitle: "Zadania",
        newQuest: "+ Nowe",
        basic: "Ogólne",
        time: "Czas",
        amount: "Ilość:",
        level: "Poziom:",
        targetPrefab: "Przedmiot/Stworzenie:",
        rewardType: "Typ nagrody:",
        rewardPrefab: "Przedmiot:",
        requirementType: "Typ wymagania:",
        rewardTypeItem: "Przedmiot",
        rewardTypeCoins: "Monety",
        rewardTypeExp: "EpicMMO Exp",
        questPreviewSidebar: "Zadania",
        questPreviewTitle: "Podgląd zadania",
        requirementParams: "Parametry:",
        closeFile: "×",
        questDependencyTitle: "Typ zależności zadania",
        questDependencyOtherQuest: "OtherQuest (zadanie musi być wcześniej ukończone)",
        questDependencyNotFinished: "NotFinished (zadanie NIE może być ukończone)",
        questDependencyCancel: "Anuluj"
    },
    pt: {
        appTitle: "Forja do Escaldo v2.4",
        appSubtitle: "Editor de diálogos e missões · by OdinSons",
        searchPlaceholder: "Pesquisar...",
        importFile: "Importar",
        export: "Exportar",
        validate: "Validar",
        addNode: "+ Diálogo",
        addQuest: "+ Missão",
        delete: "Excluir",
        fitToScreen: "Ajustar",
        loadSample: "Exemplo",
        hintText: "Arraste o círculo da opção → para o nó, missão ou vazio",
        legendTransition: "Transição",
        legendQuestLink: "Vínculo com missão",
        legendOtherQuest: "Dependência de missão",
        legendCondition: "Condição",
        legendCommand: "Comando",
        legendEnd: "Fim",
        paletteTitle: "Missões",
        propNodeTitle: "Diálogo do NPC",
        labelNodeId: "ID do perfil:",
        labelNodeText: "Texto do NPC:",
        propOptionsTitle: "Opções do diálogo",
        addNodeOption: "+ Adicionar opção",
        propOptionTitle: "Opção do jogador",
        labelOptionText: "Texto:",
        labelTransition: "Transição para (ID):",
        labelIcon: "Ícone:",
        propCondTitle: "Condições",
        addCondition: "+ Condição",
        propCmdTitle: "Comandos",
        addCommand: "+ Comando",
        emptyStateText: "Selecione um bloco ou crie um novo",
        tabField: "Campo",
        tabCode: "Código",
        applyCode: "Aplicar alterações",
        copyCode: "Copiar",
        downloadCode: "Baixar arquivo",
        codeHint: "Alterações são aplicadas pelo botão 'Aplicar'",
        previewTitle: "Pré-visualização",
        questPreviewTitle: "Pré-visualização da missão",
        condModalTitle: "Adicionar condição",
        cmdModalTitle: "Adicionar comando",
        save: "Salvar",
        importStatsTitle: "Resultados da importação",
        statDialoguesLabel: "Diálogos encontrados:",
        statQuestsLabel: "Missões encontradas:",
        statUnknownLabel: "Não reconhecidos:",
        importStatsClose: "OK",
        back: "Voltar",
        questTypeKill: "Matar",
        questTypeCollect: "Acumular",
        questTypeHarvest: "Colher",
        questTypeCraft: "Fabricar",
        questTypeTalk: "Conversar",
        questTypeBuild: "Construir",
        questTypeMove: "Mover",
        targets: "Objetivos",
        rewards: "Recompensas",
        requirements: "Requisitos",
        noTargets: "Sem objetivos",
        noRewards: "Sem recompensas",
        noReqs: "Sem requisitos",
        noDesc: "Sem descrição",
        takeQuest: "Aceitar missão",
        whatToDo: "O que fazer:",
        reward: "Recompensa:",
        previewQuestBtn: "Pré-visualização da missão",
        questListTitle: "Missões",
        newQuest: "+ Nova",
        basic: "Geral",
        time: "Tempo",
        amount: "Quantidade:",
        level: "Nível:",
        targetPrefab: "Item/Criatura:",
        rewardType: "Tipo de recompensa:",
        rewardPrefab: "Item:",
        requirementType: "Tipo de requisito:",
        rewardTypeItem: "Item",
        rewardTypeCoins: "Moedas",
        rewardTypeExp: "EpicMMO Exp",
        questPreviewSidebar: "Missões",
        questPreviewTitle: "Pré-visualização da missão",
        requirementParams: "Parâmetros:",
        closeFile: "×",
        questDependencyTitle: "Tipo de dependência de missão",
        questDependencyOtherQuest: "OtherQuest (missão deve ser concluída antes)",
        questDependencyNotFinished: "NotFinished (missão NÃO deve ser concluída)",
        questDependencyCancel: "Cancelar"
    },
    sv: {
        appTitle: "Skaldens Smedja v2.4",
        appSubtitle: "Dialog- & uppdragredigerare · by OdinSons",
        searchPlaceholder: "Sök...",
        importFile: "Importera",
        export: "Exportera",
        validate: "Validera",
        addNode: "+ Dialog",
        addQuest: "+ Uppdrag",
        delete: "Ta bort",
        fitToScreen: "Anpassa",
        loadSample: "Exempel",
        hintText: "Dra handtaget på alternativet → till nod, uppdrag eller tomrum",
        legendTransition: "Övergång",
        legendQuestLink: "Uppdragslänk",
        legendOtherQuest: "Uppdragsberoende",
        legendCondition: "Villkor",
        legendCommand: "Kommando",
        legendEnd: "Slut",
        paletteTitle: "Uppdrag",
        propNodeTitle: "NPC-dialog",
        labelNodeId: "Profil-ID:",
        labelNodeText: "NPC-text:",
        propOptionsTitle: "Dialogalternativ",
        addNodeOption: "+ Lägg till alternativ",
        propOptionTitle: "Spelaralternativ",
        labelOptionText: "Text:",
        labelTransition: "Övergång till (ID):",
        labelIcon: "Ikon:",
        propCondTitle: "Villkor",
        addCondition: "+ Villkor",
        propCmdTitle: "Kommandon",
        addCommand: "+ Kommando",
        emptyStateText: "Välj en block eller skapa en ny",
        tabField: "Fält",
        tabCode: "Kod",
        applyCode: "Tillämpa ändringar",
        copyCode: "Kopiera",
        downloadCode: "Ladda ner fil",
        codeHint: "Ändringar tillämpas via 'Tillämpa'-knappen",
        previewTitle: "Förhandsgranskning",
        questPreviewTitle: "Uppdragsförhandsgranskning",
        condModalTitle: "Lägg till villkor",
        cmdModalTitle: "Lägg till kommando",
        save: "Spara",
        importStatsTitle: "Importresultat",
        statDialoguesLabel: "Dialoger hittade:",
        statQuestsLabel: "Uppdrag hittade:",
        statUnknownLabel: "Okända:",
        importStatsClose: "OK",
        back: "Tillbaka",
        questTypeKill: "Döda",
        questTypeCollect: "Ackumulera",
        questTypeHarvest: "Skörda",
        questTypeCraft: "Tillverka",
        questTypeTalk: "Prata",
        questTypeBuild: "Bygga",
        questTypeMove: "Flytta",
        targets: "Mål",
        rewards: "Belöningar",
        requirements: "Krav",
        noTargets: "Inga mål",
        noRewards: "Inga belöningar",
        noReqs: "Inga krav",
        noDesc: "Ingen beskrivning",
        takeQuest: "Acceptera uppdrag",
        whatToDo: "Vad som ska göras:",
        reward: "Belöning:",
        previewQuestBtn: "Uppdragsförhandsgranskning",
        questListTitle: "Uppdrag",
        newQuest: "+ Nytt",
        basic: "Allmänt",
        time: "Tid",
        amount: "Mängd:",
        level: "Nivå:",
        targetPrefab: "Föremål/Varelse:",
        rewardType: "Belöningstyp:",
        rewardPrefab: "Föremål:",
        requirementType: "Kravtyp:",
        rewardTypeItem: "Föremål",
        rewardTypeCoins: "Mynt",
        rewardTypeExp: "EpicMMO Exp",
        questPreviewSidebar: "Uppdrag",
        questPreviewTitle: "Uppdragsförhandsgranskning",
        requirementParams: "Parametrar:",
        closeFile: "×",
        questDependencyTitle: "Typ av uppdragsberoende",
        questDependencyOtherQuest: "OtherQuest (uppdrag måste vara slutfört tidigare)",
        questDependencyNotFinished: "NotFinished (uppdrag får INTE vara slutfört)",
        questDependencyCancel: "Avbryt"
    },
    ja: {
        appTitle: "スカルドの鍛冶屋 v2.4",
        appSubtitle: "ダイアログ＆クエストエディタ · by OdinSons",
        searchPlaceholder: "検索...",
        importFile: "インポート",
        export: "エクスポート",
        validate: "検証",
        addNode: "+ ダイアログ",
        addQuest: "+ クエスト",
        delete: "削除",
        fitToScreen: "画面に合わせる",
        loadSample: "サンプル",
        hintText: "オプションのハンドルをノード、クエスト、または空へドラッグ",
        legendTransition: "遷移",
        legendQuestLink: "クエストリンク",
        legendOtherQuest: "クエスト依存",
        legendCondition: "条件",
        legendCommand: "コマンド",
        legendEnd: "終了",
        paletteTitle: "クエスト",
        propNodeTitle: "NPCダイアログ",
        labelNodeId: "プロフィールID:",
        labelNodeText: "NPCテキスト:",
        propOptionsTitle: "ダイアログオプション",
        addNodeOption: "+ オプションを追加",
        propOptionTitle: "プレイヤーオプション",
        labelOptionText: "テキスト:",
        labelTransition: "遷移先 (ID):",
        labelIcon: "アイコン:",
        propCondTitle: "条件",
        addCondition: "+ 条件",
        propCmdTitle: "コマンド",
        addCommand: "+ コマンド",
        emptyStateText: "ブロックを選択するか新規作成",
        tabField: "フィールド",
        tabCode: "コード",
        applyCode: "変更を適用",
        copyCode: "コピー",
        downloadCode: "ファイルをダウンロード",
        codeHint: "変更は「適用」ボタンで適用されます",
        previewTitle: "プレビュー",
        questPreviewTitle: "クエストプレビュー",
        condModalTitle: "条件を追加",
        cmdModalTitle: "コマンドを追加",
        save: "保存",
        importStatsTitle: "インポート結果",
        statDialoguesLabel: "見つかったダイアログ:",
        statQuestsLabel: "見つかったクエスト:",
        statUnknownLabel: "認識されなかった:",
        importStatsClose: "OK",
        back: "戻る",
        questTypeKill: "倒す",
        questTypeCollect: "蓄積",
        questTypeHarvest: "収穫",
        questTypeCraft: "作成",
        questTypeTalk: "話す",
        questTypeBuild: "建てる",
        questTypeMove: "移動",
        targets: "目標",
        rewards: "報酬",
        requirements: "要件",
        noTargets: "目標なし",
        noRewards: "報酬なし",
        noReqs: "要件なし",
        noDesc: "説明なし",
        takeQuest: "クエストを受ける",
        whatToDo: "やること:",
        reward: "報酬:",
        previewQuestBtn: "クエストプレビュー",
        questListTitle: "クエスト",
        newQuest: "+ 新規",
        basic: "基本",
        time: "時間",
        amount: "数量:",
        level: "レベル:",
        targetPrefab: "アイテム/クリーチャー:",
        rewardType: "報酬タイプ:",
        rewardPrefab: "アイテム:",
        requirementType: "要件タイプ:",
        rewardTypeItem: "アイテム",
        rewardTypeCoins: "コイン",
        rewardTypeExp: "EpicMMO Exp",
        questPreviewSidebar: "クエスト",
        questPreviewTitle: "クエストプレビュー",
        requirementParams: "パラメータ:",
        closeFile: "×",
        questDependencyTitle: "クエスト依存タイプ",
        questDependencyOtherQuest: "OtherQuest (クエストは以前に完了している必要があります)",
        questDependencyNotFinished: "NotFinished (クエストは完了してはいけません)",
        questDependencyCancel: "キャンセル"
    }
};

class DialogueEditor {
    constructor() {
        this.blocks = [];
        this.nodes = new Map();
        this.quests = new Map();
        this.fileContents = {};
        
        this.selectedBlock = null;
        this.selectedNode = null;
        this.selectedOption = null;
        this.selectedQuest = null;
        
        this.currentZoom = 1;
        this.canvasOffset = { x: 0, y: 0 };
        this.isCanvasDragging = false;
        this.canvasStartPos = { x: 0, y: 0 };
        
        this.previewHistory = [];
        this.currentPreviewNode = null;
        
        this.isDrawingCurve = false;
        this.drawingFromOption = null;
        this.drawingFromQuest = null;
        this.pendingQuestDependency = null;
        this.drawingTempPath = null;
        
        this.cfgFiles = {};
        this.currentCfgFile = null;
        this.lang = localStorage.getItem('skald_lang') || 'ru';
        
        this.itemSelectorData = [];
        this.loadItemDataForPreview();
        
        this.optionIconSelector = null;
        this.questTargetSelectors = [];
        this.questRewardSelectors = [];
        this.els = {};
        
        this.cacheElements();
        this.initEventListeners();
        this.applyLanguage();
        this.render();
    }
    
    async loadItemDataForPreview() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/EnotinMax/skald/main/icons/items.json?v=${Date.now()}`);
            if (response.ok) this.itemSelectorData = await response.json();
        } catch (e) { console.warn('Не удалось загрузить данные предметов'); }
    }
    
    cacheElements() {
        const ids = [
            'appTitle', 'appSubtitle', 'searchInput', 'importBtn', 'exportBtn', 'validateBtn', 'previewBtn',
            'addNodeBtn', 'addQuestBtn', 'deleteBtn', 'zoomInBtn', 'zoomOutBtn', 'fitToScreenBtn', 'loadSampleBtn',
            'hintText', 'paletteTitle', 'questPalette', 'questPaletteList', 'toggleQuestPalette',
            'connectionLayer', 'nodeContainer', 'questContainer', 'canvasContainer',
            'nodeProperties', 'optionProperties', 'questProperties', 'emptyState', 'emptyStateText',
            'propNodeTitle', 'labelNodeId', 'nodeId', 'labelNodeText', 'nodeText',
            'propOptionsTitle', 'nodeOptionsList', 'addNodeOptionBtn',
            'propOptionTitle', 'labelOptionText', 'optionText', 'labelTransition', 'optionTransition',
            'labelIcon', 'optionIconSelector',
            'propCondTitle', 'conditionsList', 'addConditionBtn', 'propCmdTitle', 'commandsList', 'addCommandBtn',
            'propQuestTitle', 'labelQuestId', 'questId', 'labelQuestType', 'questType',
            'labelQuestName', 'questName', 'labelQuestDesc', 'questDescription', 'questAutocomplete',
            'labelAutocomplete', 'labelCooldown', 'questCooldown', 'labelTimeLimit', 'questTimeLimit',
            'labelQuestTargets', 'questTargetsList', 'addQuestTargetBtn',
            'labelQuestRewards', 'questRewardsList', 'addQuestRewardBtn',
            'labelQuestRequirements', 'questRequirementsList', 'addQuestRequirementBtn',
            'tabFieldBtn', 'tabCodeBtn', 'fileTabs', 'codeEditor', 'applyCodeBtn', 'copyCodeBtn', 'downloadCodeBtn', 'newFileBtn', 'codeHint',
            'previewModal', 'previewContent', 'previewTitle',
            'questPreviewModal', 'questPreviewContent', 'questPreviewTitle',
            'conditionModal', 'conditionType', 'conditionParams', 'saveConditionBtn', 'condModalTitle',
            'commandModal', 'commandType', 'commandParams', 'saveCommandBtn', 'cmdModalTitle',
            'questDependencyModal', 'questDependencyTitle', 'questDependencyOtherQuestBtn', 'questDependencyNotFinishedBtn', 'questDependencyCancelBtn',
            'fileInput',
            'importStatsModal', 'importStatsTitle', 'statDialoguesLabel', 'statQuestsLabel', 'statUnknownLabel',
            'statDialogues', 'statQuests', 'statUnknown', 'unknownBlocksList', 'importStatsCloseBtn',
            'legendTransition', 'legendQuestLink', 'legendOtherQuest', 'legendCondition', 'legendCommand', 'legendEnd'
        ];
        ids.forEach(id => { this.els[id] = document.getElementById(id); });
    }
    
    initEventListeners() {
        this.els.addNodeBtn.addEventListener('click', () => this.addNode());
        this.els.addQuestBtn.addEventListener('click', () => this.addQuest());
        this.els.deleteBtn.addEventListener('click', () => this.deleteSelected());
        this.els.zoomInBtn.addEventListener('click', () => this.zoom(0.1));
        this.els.zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));
        this.els.fitToScreenBtn.addEventListener('click', () => this.fitToScreen());
        this.els.loadSampleBtn.addEventListener('click', () => this.loadSampleData());
        
        this.els.searchInput.addEventListener('input', (e) => this.searchDialogue(e.target.value));
        this.els.importBtn.addEventListener('click', () => this.els.fileInput.click());
        this.els.exportBtn.addEventListener('click', () => this.exportCurrentCfg());
        this.els.validateBtn.addEventListener('click', () => this.validateDialogue());
        this.els.previewBtn.addEventListener('click', () => this.showPreview());
        
        this.els.fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        
        this.els.nodeId.addEventListener('change', (e) => this.updateNodeProperty('id', e.target.value));
        this.els.nodeText.addEventListener('input', (e) => this.updateNodeProperty('text', e.target.value));
        this.els.addNodeOptionBtn.addEventListener('click', () => this.addOptionToNode(this.selectedNode));
        
        this.els.optionText.addEventListener('input', (e) => this.updateOptionProperty('text', e.target.value));
        this.els.optionTransition.addEventListener('change', (e) => this.updateOptionProperty('transition', e.target.value));
        
        this.els.addConditionBtn.addEventListener('click', () => this.openModal('conditionModal'));
        this.els.addCommandBtn.addEventListener('click', () => this.openModal('commandModal'));
        
        this.els.conditionType.addEventListener('change', () => this.updateConditionParams());
        this.els.saveConditionBtn.addEventListener('click', () => this.saveCondition());
        this.els.commandType.addEventListener('change', () => this.updateCommandParams());
        this.els.saveCommandBtn.addEventListener('click', () => this.saveCommand());
        
        this.els.questId.addEventListener('change', (e) => this.updateQuestProperty('id', e.target.value));
        this.els.questType.addEventListener('change', (e) => this.updateQuestProperty('questType', e.target.value));
        this.els.questName.addEventListener('input', (e) => this.updateQuestProperty('name', e.target.value));
        this.els.questDescription.addEventListener('input', (e) => this.updateQuestProperty('description', e.target.value));
        this.els.questAutocomplete.addEventListener('change', (e) => this.updateQuestProperty('autocomplete', e.target.checked));
        this.els.questCooldown.addEventListener('input', (e) => this.updateQuestProperty('cooldown', e.target.value));
        this.els.questTimeLimit.addEventListener('input', (e) => this.updateQuestProperty('timeLimit', e.target.value));
        
        this.els.addQuestTargetBtn.addEventListener('click', () => this.addQuestTarget());
        this.els.addQuestRewardBtn.addEventListener('click', () => this.addQuestReward());
        this.els.addQuestRequirementBtn.addEventListener('click', () => this.addQuestRequirement());
        
        this.els.questDependencyOtherQuestBtn.addEventListener('click', () => this.applyQuestDependency('OtherQuest'));
        this.els.questDependencyNotFinishedBtn.addEventListener('click', () => this.applyQuestDependency('NotFinished'));
        this.els.questDependencyCancelBtn.addEventListener('click', () => this.cancelQuestDependency());
        
        this.els.toggleQuestPalette.addEventListener('click', () => {
            this.els.questPalette.classList.toggle('collapsed');
            this.els.toggleQuestPalette.textContent = this.els.questPalette.classList.contains('collapsed') ? '+' : '−';
        });
        
        this.els.canvasContainer.addEventListener('mousedown', (e) => this.startCanvasDrag(e));
        window.addEventListener('mousemove', (e) => this.canvasDrag(e));
        window.addEventListener('mouseup', (e) => this.stopCanvasDrag(e));
        this.els.canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom(e.deltaY < 0 ? 0.1 : -0.1);
        }, { passive: false });
        
        window.addEventListener('mousemove', (e) => this.onDrawMouseMove(e));
        window.addEventListener('mouseup', (e) => this.onDrawMouseUp(e));
        
        document.addEventListener('click', (e) => this.handleGlobalClick(e));
        
        this.els.tabFieldBtn.addEventListener('click', () => this.switchTab('tabField'));
        this.els.tabCodeBtn.addEventListener('click', () => this.switchTab('tabCode'));
        this.els.applyCodeBtn.addEventListener('click', () => this.applyCodeFromEditor());
        this.els.copyCodeBtn.addEventListener('click', () => this.copyCurrentCode());
        this.els.downloadCodeBtn.addEventListener('click', () => this.downloadCurrentCode());
        this.els.newFileBtn.addEventListener('click', () => this.createNewFile());
        
        this.els.importStatsCloseBtn.addEventListener('click', () => {
            this.els.importStatsModal.classList.remove('open');
        });
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.lang = btn.dataset.lang;
                localStorage.setItem('skald_lang', this.lang);
                this.applyLanguage();
                this.render();
            });
        });
        
        document.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.isContentEditable ||
                activeEl.classList.contains('item-selector-input')
            );
            if (e.key === 'Escape') {
                if (this.isDrawingCurve) this.cancelDrawing();
                else this.closeAllModals();
            }
            if (e.key === 'Delete' && this.selectedBlock && !isTyping) {
                this.deleteSelected();
            }
        });
    }
    
    applyLanguage() {
        const t = translations[this.lang];
        if (!t) return;
        
        this.els.appTitle.textContent = t.appTitle;
        this.els.appSubtitle.textContent = t.appSubtitle;
        this.els.searchInput.placeholder = t.searchPlaceholder;
        this.els.importBtn.textContent = t.importFile;
        this.els.exportBtn.textContent = t.export;
        this.els.validateBtn.textContent = t.validate;
        this.els.addNodeBtn.textContent = t.addNode;
        this.els.addQuestBtn.textContent = t.addQuest;
        this.els.deleteBtn.textContent = t.delete;
        this.els.fitToScreenBtn.textContent = t.fitToScreen;
        this.els.loadSampleBtn.textContent = t.loadSample;
        this.els.hintText.textContent = t.hintText;
        this.els.paletteTitle.textContent = t.paletteTitle;
        this.els.propNodeTitle.textContent = t.propNodeTitle;
        this.els.labelNodeId.textContent = t.labelNodeId;
        this.els.labelNodeText.textContent = t.labelNodeText;
        this.els.propOptionsTitle.textContent = t.propOptionsTitle;
        this.els.addNodeOptionBtn.textContent = t.addNodeOption;
        this.els.propOptionTitle.textContent = t.propOptionTitle;
        this.els.labelOptionText.textContent = t.labelOptionText;
        this.els.labelTransition.textContent = t.labelTransition;
        this.els.labelIcon.textContent = t.labelIcon;
        this.els.propCondTitle.textContent = t.propCondTitle;
        this.els.addConditionBtn.textContent = t.addCondition;
        this.els.propCmdTitle.textContent = t.propCmdTitle;
        this.els.addCommandBtn.textContent = t.addCommand;
        this.els.emptyStateText.textContent = t.emptyStateText;
        this.els.tabFieldBtn.textContent = t.tabField;
        this.els.tabCodeBtn.textContent = t.tabCode;
        this.els.applyCodeBtn.textContent = t.applyCode;
        this.els.copyCodeBtn.textContent = t.copyCode;
        this.els.downloadCodeBtn.textContent = t.downloadCode;
        this.els.newFileBtn.textContent = t.newFile;
        this.els.codeHint.textContent = t.codeHint;
        this.els.previewTitle.textContent = t.previewTitle;
        this.els.questPreviewTitle.textContent = t.questPreviewTitle;
        this.els.condModalTitle.textContent = t.condModalTitle;
        this.els.cmdModalTitle.textContent = t.cmdModalTitle;
        this.els.importStatsTitle.textContent = t.importStatsTitle;
        this.els.statDialoguesLabel.textContent = t.statDialoguesLabel;
        this.els.statQuestsLabel.textContent = t.statQuestsLabel;
        this.els.statUnknownLabel.textContent = t.statUnknownLabel;
        this.els.importStatsCloseBtn.textContent = t.importStatsClose;
        
        if (this.els.legendTransition) this.els.legendTransition.textContent = t.legendTransition;
        if (this.els.legendQuestLink) this.els.legendQuestLink.textContent = t.legendQuestLink;
        if (this.els.legendOtherQuest) this.els.legendOtherQuest.textContent = t.legendOtherQuest;
        if (this.els.legendCondition) this.els.legendCondition.textContent = t.legendCondition;
        if (this.els.legendCommand) this.els.legendCommand.textContent = t.legendCommand;
        if (this.els.legendEnd) this.els.legendEnd.textContent = t.legendEnd;
        
        if (this.els.questDependencyTitle) this.els.questDependencyTitle.textContent = t.questDependencyTitle;
        if (this.els.questDependencyOtherQuestBtn) this.els.questDependencyOtherQuestBtn.textContent = t.questDependencyOtherQuest;
        if (this.els.questDependencyNotFinishedBtn) this.els.questDependencyNotFinishedBtn.textContent = t.questDependencyNotFinished;
        if (this.els.questDependencyCancelBtn) this.els.questDependencyCancelBtn.textContent = t.questDependencyCancel;
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.lang);
        });
        document.documentElement.lang = this.lang;
    }
    
    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.bottom-tab[data-tab="${tabId}"]`).classList.add('active');
        
        if (tabId === 'tabCode') {
            this.renderCodeTabs();
            if (this.currentCfgFile) this.showCodeFile(this.currentCfgFile);
        }
    }
    
    renderCodeTabs() {
        const container = this.els.fileTabs;
        const newFileBtn = this.els.newFileBtn;
        container.innerHTML = '';
        
        Object.keys(this.cfgFiles).forEach(filename => {
            const tabWrapper = document.createElement('div');
            tabWrapper.className = 'code-tab-wrapper';
            
            const btn = document.createElement('button');
            btn.className = `code-tab ${filename === this.currentCfgFile ? 'active' : ''}`;
            btn.textContent = filename;
            btn.dataset.file = filename;
            btn.addEventListener('click', () => {
                this.currentCfgFile = filename;
                this.renderCodeTabs();
                this.showCodeFile(filename);
            });
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'code-tab-close';
            closeBtn.textContent = '×';
            closeBtn.title = translations[this.lang].closeFile;
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeFileTab(filename);
            });
            
            tabWrapper.appendChild(btn);
            tabWrapper.appendChild(closeBtn);
            container.appendChild(tabWrapper);
        });
        
        container.appendChild(newFileBtn);
    }
    
    closeFileTab(filename) {
        delete this.cfgFiles[filename];
        delete this.fileContents[filename];
        
        if (this.currentCfgFile === filename) {
            const remainingFiles = Object.keys(this.cfgFiles);
            this.currentCfgFile = remainingFiles.length > 0 ? remainingFiles[0] : null;
        }
        
        this.renderCodeTabs();
        if (this.currentCfgFile) {
            this.showCodeFile(this.currentCfgFile);
        } else {
            this.els.codeEditor.value = '';
        }
    }
    
    showCodeFile(filename) {
        if (this.fileContents[filename]) {
            this.els.codeEditor.value = this.fileContents[filename];
        } else if (this.currentCfgFile) {
            this.els.codeEditor.value = this.generateCfgFromData();
        } else {
            this.els.codeEditor.value = '';
        }
    }
    
    applyCodeFromEditor() {
        if (!this.currentCfgFile) return;
        const content = this.els.codeEditor.value;
        this.fileContents[this.currentCfgFile] = content;
        this.cfgFiles[this.currentCfgFile] = content;
        
        const result = this.smartParse(content);
        this.showImportStats(result);
        this.render();
    }
    
    copyCurrentCode() {
        this.els.codeEditor.select();
        document.execCommand('copy');
        const originalText = this.els.copyCodeBtn.textContent;
        this.els.copyCodeBtn.textContent = 'OK';
        setTimeout(() => { this.els.copyCodeBtn.textContent = originalText; }, 1500);
    }
    
    downloadCurrentCode() {
        if (this.currentCfgFile) {
            this.downloadFile(this.currentCfgFile, this.els.codeEditor.value);
        }
    }
    
    createNewFile() {
        const fileName = prompt('Введите имя файла (.cfg):', `skald_${Date.now()}.cfg`);
        if (fileName) {
            if (!fileName.endsWith('.cfg')) {
                alert('Имя файла должно заканчиваться на .cfg');
                return;
            }
            if (this.cfgFiles[fileName]) {
                alert('Файл с таким именем уже существует');
                return;
            }
            this.cfgFiles[fileName] = '';
            this.fileContents[fileName] = '';
            this.currentCfgFile = fileName;
            this.renderCodeTabs();
            this.showCodeFile(this.currentCfgFile);
        }
    }
    
    handleGlobalClick(e) {
        if (e.target.matches('.close') || e.target.closest('.close')) {
            this.closeAllModals();
            return;
        }
        if (e.target.classList.contains('modal')) {
            this.closeAllModals();
            return;
        }
        
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;
        
        const action = actionTarget.dataset.action;
        const data = actionTarget.dataset;
        
        switch (action) {
            case 'close-modal': this.closeAllModals(); break;
            case 'select-node': this.selectNode(data.id); break;
            case 'select-option': this.selectOption(data.optionId); break;
            case 'select-quest-block': this.selectQuest(data.id); break;
            case 'navigate': this.previewNavigate(data.target); break;
            case 'preview-go-back': this.previewGoBack(); break;
            case 'toggle-collapse': this.toggleCollapse(data.id); break;
            case 'delete-option': this.deleteOptionFromNode(data.optionId); break;
            case 'delete-condition': this.removeCondition(parseInt(data.index)); break;
            case 'delete-command': this.removeCommand(parseInt(data.index)); break;
            case 'delete-quest-target': this.removeQuestTarget(parseInt(data.index)); break;
            case 'delete-quest-reward': this.removeQuestReward(parseInt(data.index)); break;
            case 'delete-quest-requirement': this.removeQuestRequirement(parseInt(data.index)); break;
            case 'show-quest-preview': this.showQuestPreview(); break;
            case 'preview-select-quest': this.previewSelectQuest(data.id); break;
            case 'open-quest-link': this.openQuestLink(data.questId); break;
        }
    }
    
    openQuestLink(questId) {
        this.selectQuest(questId);
    }
    
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('open');
            if (id === 'conditionModal') this.updateConditionParams();
            if (id === 'commandModal') this.updateCommandParams();
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    }
    
    addNode(id = null, x = null, y = null) {
        const nodeId = id || `Node_${Date.now()}`;
        if (this.nodes.has(nodeId)) return null;
        
        const offset = this.nodes.size * 50;
        const block = {
            type: 'dialogue',
            id: nodeId,
            text: 'New dialogue...',
            options: [],
            x: x !== null ? x : 100 + offset,
            y: y !== null ? y : 100 + offset,
            collapsed: false
        };
        
        this.blocks.push(block);
        this.nodes.set(nodeId, block);
        this.renderNodes();
        this.selectNode(nodeId);
        this.syncCodeView();
        return block;
    }
    
    addQuest(id = null, x = null, y = null) {
        const questId = id || `Quest_${Date.now()}`;
        if (this.quests.has(questId)) return null;
        
        const offset = this.quests.size * 50;
        const block = {
            type: 'quest',
            id: questId,
            questType: 'Kill',
            name: 'New Quest',
            description: 'Description...',
            targets: [],
            rewards: [],
            cooldown: '',
            timeLimit: '',
            requirements: [],
            autocomplete: false,
            x: x !== null ? x : 400 + offset,
            y: y !== null ? y : 100 + offset,
            collapsed: false
        };
        
        this.blocks.push(block);
        this.quests.set(questId, block);
        this.renderQuestBlocks();
        this.selectQuest(questId);
        this.syncCodeView();
        return block;
    }
    
    selectNode(nodeId) {
        this.selectedBlock = this.nodes.get(nodeId);
        this.selectedNode = nodeId;
        this.selectedOption = null;
        this.selectedQuest = null;
        
        document.querySelectorAll('.dialogue-node').forEach(el => {
            el.classList.toggle('selected', el.dataset.nodeId === nodeId);
        });
        document.querySelectorAll('.quest-block').forEach(el => {
            el.classList.remove('selected');
        });
        
        if (nodeId) {
            this.els.nodeProperties.style.display = 'block';
            this.els.optionProperties.style.display = 'none';
            this.els.questProperties.style.display = 'none';
            this.els.emptyState.style.display = 'none';
            
            const node = this.nodes.get(nodeId);
            if (node) {
                this.els.nodeId.value = node.id;
                this.els.nodeText.value = node.text;
                this.renderNodeOptionsList();
                this.updateTransitionsList();
            }
        }
    }
    
    selectQuest(questId) {
        this.selectedBlock = this.quests.get(questId);
        this.selectedQuest = questId;
        this.selectedNode = null;
        this.selectedOption = null;
        
        document.querySelectorAll('.dialogue-node').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelectorAll('.quest-block').forEach(el => {
            el.classList.toggle('selected', el.dataset.questId === questId);
        });
        
        if (questId) {
            this.els.nodeProperties.style.display = 'none';
            this.els.optionProperties.style.display = 'none';
            this.els.questProperties.style.display = 'block';
            this.els.emptyState.style.display = 'none';
            
            const quest = this.quests.get(questId);
            if (quest) {
                this.els.questId.value = quest.id;
                this.els.questType.value = quest.questType || 'Kill';
                this.els.questName.value = quest.name || '';
                this.els.questDescription.value = quest.description || '';
                this.els.questAutocomplete.checked = quest.autocomplete || false;
                this.els.questCooldown.value = quest.cooldown || '';
                this.els.questTimeLimit.value = quest.timeLimit || '';
                
                this.renderQuestPropertiesPanel(quest);
            }
        }
    }
    
    renderQuestPropertiesPanel(quest) {
        const t = translations[this.lang];
        
        this.questTargetSelectors.forEach(s => { if (s.container) s.container.innerHTML = ''; });
        this.questRewardSelectors.forEach(s => { if (s.container) s.container.innerHTML = ''; });
        this.questTargetSelectors = [];
        this.questRewardSelectors = [];
        
        const targetsContainer = this.els.questTargetsList;
        targetsContainer.innerHTML = '';
        
        quest.targets.forEach((target, i) => {
            const row = document.createElement('div');
            row.className = 'quest-property-row';
            row.innerHTML = `
                <div class="item-selector" style="flex: 1;"></div>
                <input type="number" class="form-control quest-target-amount" value="${target.amount || '1'}" style="width: 70px;" data-index="${i}">
                <button class="btn-small danger" data-action="delete-quest-target" data-index="${i}">×</button>
            `;
            targetsContainer.appendChild(row);
            
            const selectorContainer = row.querySelector('.item-selector');
            const selector = new ItemSelector(selectorContainer, target.prefab || '');
            selector.setOnChange((newId) => {
                quest.targets[i].prefab = newId;
                this.renderQuestBlocks();
                this.syncCodeView();
            });
            this.questTargetSelectors.push(selector);
            
            row.querySelector('.quest-target-amount').addEventListener('input', (e) => {
                quest.targets[i].amount = e.target.value;
                this.renderQuestBlocks();
                this.syncCodeView();
            });
        });
        
        const rewardsContainer = this.els.questRewardsList;
        rewardsContainer.innerHTML = '';
        
        quest.rewards.forEach((reward, i) => {
            const row = document.createElement('div');
            row.className = 'quest-property-row';
            
            const isItemReward = reward.type === 'Item';
            
            row.innerHTML = `
                <select class="form-control quest-reward-type" style="width: 100%;" data-index="${i}">
                    <option value="Item" ${reward.type === 'Item' ? 'selected' : ''}>${t.rewardTypeItem}</option>
                    <option value="Coins" ${reward.type === 'Coins' ? 'selected' : ''}>${t.rewardTypeCoins}</option>
                    <option value="EpicMMO_EXP" ${reward.type === 'EpicMMO_EXP' ? 'selected' : ''}>${t.rewardTypeExp}</option>
                </select>
                <div class="item-selector" style="width: 100%; ${!isItemReward ? 'display: none;' : ''}"></div>
                <input type="number" class="form-control quest-reward-amount" value="${reward.amount || '1'}" style="width: 70px;" data-index="${i}">
                <button class="btn-small danger" data-action="delete-quest-reward" data-index="${i}">×</button>
            `;
            rewardsContainer.appendChild(row);
            
            const typeSelect = row.querySelector('.quest-reward-type');
            const selectorContainer = row.querySelector('.item-selector');
            const amountInput = row.querySelector('.quest-reward-amount');
            
            typeSelect.addEventListener('change', (e) => {
                quest.rewards[i].type = e.target.value;
                if (e.target.value === 'Item') {
                    selectorContainer.style.display = 'block';
                } else {
                    selectorContainer.style.display = 'none';
                    if (e.target.value === 'Coins') quest.rewards[i].prefab = 'Coins';
                    else if (e.target.value === 'EpicMMO_EXP') quest.rewards[i].prefab = 'EpicMMO_EXP';
                }
                this.renderQuestBlocks();
                this.syncCodeView();
            });
            
            if (isItemReward) {
                const selector = new ItemSelector(selectorContainer, reward.prefab || '');
                selector.setOnChange((newId) => {
                    quest.rewards[i].prefab = newId;
                    this.renderQuestBlocks();
                    this.syncCodeView();
                });
                this.questRewardSelectors.push(selector);
            }
            
            amountInput.addEventListener('input', (e) => {
                quest.rewards[i].amount = e.target.value;
                this.renderQuestBlocks();
                this.syncCodeView();
            });
        });
        
        const reqsContainer = this.els.questRequirementsList;
        reqsContainer.innerHTML = '';
        
        quest.requirements.forEach((req, i) => {
            const row = document.createElement('div');
            row.className = 'quest-property-row';
            
            const reqTypeSelect = document.createElement('select');
            reqTypeSelect.className = 'form-control quest-req-type';
            reqTypeSelect.style.width = '150px';
            reqTypeSelect.dataset.index = i;
            
            const reqTypes = ['Skill', 'OtherQuest', 'GlobalKey', 'EpicMMO_Level', 'HasItem', 'NotFinished', 'IsVIP', 'MH_Level', 'Time', 'HasAchievement', 'CustomValueMore', 'CustomValueLess'];
            reqTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                if (req.type === type) option.selected = true;
                reqTypeSelect.appendChild(option);
            });
            
            row.appendChild(reqTypeSelect);
            
            const paramsContainer = document.createElement('div');
            paramsContainer.style.flex = '1';
            row.appendChild(paramsContainer);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-small danger';
            deleteBtn.textContent = '×';
            deleteBtn.dataset.action = 'delete-quest-requirement';
            deleteBtn.dataset.index = i;
            row.appendChild(deleteBtn);
            
            reqsContainer.appendChild(row);
            
            this.renderRequirementParams(paramsContainer, req, i, quest);
            
            reqTypeSelect.addEventListener('change', (e) => {
                quest.requirements[i].type = e.target.value;
                quest.requirements[i].params = [];
                this.renderRequirementParams(paramsContainer, quest.requirements[i], i, quest);
                this.syncCodeView();
            });
        });
    }
    
    renderRequirementParams(container, req, index, quest) {
        container.innerHTML = '';
        
        if (req.type === 'HasItem') {
            const selectorDiv = document.createElement('div');
            selectorDiv.className = 'item-selector';
            selectorDiv.style.flex = '1';
            container.appendChild(selectorDiv);
            
            const selector = new ItemSelector(selectorDiv, req.params[0] || '');
            selector.setOnChange((newId) => {
                quest.requirements[index].params = [newId];
                this.syncCodeView();
            });
        } else if (req.type === 'OtherQuest' || req.type === 'NotFinished') {
            const questSelect = document.createElement('select');
            questSelect.className = 'form-control';
            questSelect.style.flex = '1';
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '— Выберите квест —';
            questSelect.appendChild(defaultOption);
            
            this.quests.forEach((q, qId) => {
                const option = document.createElement('option');
                option.value = qId;
                option.textContent = q.name || qId;
                if (req.params[0] === qId) option.selected = true;
                questSelect.appendChild(option);
            });
            
            container.appendChild(questSelect);
            
            questSelect.addEventListener('change', (e) => {
                quest.requirements[index].params = [e.target.value];
                this.syncCodeView();
            });
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.style.flex = '1';
            input.value = req.params ? req.params.join(', ') : '';
            input.placeholder = translations[this.lang].requirementParams;
            container.appendChild(input);
            
            input.addEventListener('input', (e) => {
                quest.requirements[index].params = e.target.value.split(',').map(p => p.trim());
                this.syncCodeView();
            });
        }
    }
    
    addQuestTarget() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        quest.targets.push({ prefab: '', amount: '1', level: '' });
        this.renderQuestPropertiesPanel(quest);
        this.renderQuestBlocks();
        this.syncCodeView();
    }
    
    addQuestReward() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        quest.rewards.push({ type: 'Item', prefab: '', amount: '1' });
        this.renderQuestPropertiesPanel(quest);
        this.renderQuestBlocks();
        this.syncCodeView();
    }
    
    addQuestRequirement() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        quest.requirements.push({ type: 'OtherQuest', params: [''] });
        this.renderQuestPropertiesPanel(quest);
        this.syncCodeView();
    }
    
    removeQuestTarget(index) {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        quest.targets.splice(index, 1);
        this.renderQuestPropertiesPanel(quest);
        this.renderQuestBlocks();
        this.syncCodeView();
    }
    
    removeQuestReward(index) {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        quest.rewards.splice(index, 1);
        this.renderQuestPropertiesPanel(quest);
        this.renderQuestBlocks();
        this.syncCodeView();
    }
    
    removeQuestRequirement(index) {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        quest.requirements.splice(index, 1);
        this.renderQuestPropertiesPanel(quest);
        this.syncCodeView();
    }
    
    selectOption(optionId) {
        this.selectedOption = optionId;
        const node = this.nodes.get(this.selectedNode);
        if (!node) return;
        
        const option = node.options.find(o => o.id === optionId);
        if (!option) return;
        
        this.els.nodeProperties.style.display = 'none';
        this.els.optionProperties.style.display = 'block';
        this.els.questProperties.style.display = 'none';
        
        this.els.optionText.value = option.text || '';
        this.els.optionTransition.value = option.transition || '';
        
        this.renderConditionsList(option.conditions);
        this.renderCommandsList(option.commands);
        this.renderNodeOptionsList();
        this.updateTransitionsList();
        
        if (this.optionIconSelector) {
            this.optionIconSelector.container.innerHTML = '';
        }
        this.optionIconSelector = new ItemSelector(this.els.optionIconSelector, option.icon || '');
        this.optionIconSelector.input.addEventListener('change', (e) => {
            option.icon = e.target.value.trim();
            this.renderNodes();
            this.renderNodeOptionsList();
            this.syncCodeView();
        });
    }
    
    addOptionToSelected() {
        if (!this.selectedNode) { alert('Select a node first!'); return; }
        this.addOptionToNode(this.selectedNode);
    }
    
    addOptionToNode(nodeId, text = 'New option') {
        const node = this.nodes.get(nodeId);
        if (!node) return null;
        
        const option = {
            id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            text: text,
            transition: '',
            icon: '',
            conditions: [],
            commands: []
        };
        
        node.options.push(option);
        this.renderNodes();
        this.renderNodeOptionsList();
        this.selectOption(option.id);
        this.syncCodeView();
        return option;
    }
    
    deleteOptionFromNode(optionId) {
        const node = this.nodes.get(this.selectedNode);
        if (!node) return;
        node.options = node.options.filter(o => o.id !== optionId);
        if (this.selectedOption === optionId) {
            this.selectedOption = null;
            this.els.optionProperties.style.display = 'none';
            this.els.nodeProperties.style.display = 'block';
        }
        this.renderNodes();
        this.renderNodeOptionsList();
        this.syncCodeView();
    }
    
    toggleCollapse(nodeId) {
        const block = this.nodes.get(nodeId) || this.quests.get(nodeId);
        if (block) {
            block.collapsed = !block.collapsed;
            this.renderNodes();
            this.renderQuestBlocks();
        }
    }
    
    updateNodeProperty(property, value) {
        const node = this.nodes.get(this.selectedNode);
        if (!node) return;
        
        if (property === 'id') {
            if (value && value !== node.id && !this.nodes.has(value)) {
                this.nodes.delete(node.id);
                node.id = value;
                this.nodes.set(value, node);
                this.selectedNode = value;
                this.renderNodes();
                this.updateTransitionsList();
            }
        } else {
            node[property] = value;
            this.renderNodes();
        }
        this.syncCodeView();
    }
    
    updateOptionProperty(property, value) {
        const node = this.nodes.get(this.selectedNode);
        if (!node || !this.selectedOption) return;
        const option = node.options.find(o => o.id === this.selectedOption);
        if (!option) return;
        
        option[property] = value;
        this.renderNodes();
        this.renderNodeOptionsList();
        this.syncCodeView();
    }
    
    updateQuestProperty(property, value) {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        
        quest[property] = value;
        
        if (property === 'questType') {
            this.renderQuestPropertiesPanel(quest);
        }
        
        this.renderQuestBlocks();
        this.syncCodeView();
    }
    
    deleteSelected() {
        if (this.selectedOption) {
            this.deleteOptionFromNode(this.selectedOption);
        } else if (this.selectedNode) {
            this.nodes.forEach(otherNode => {
                otherNode.options.forEach(opt => {
                    if (opt.transition === this.selectedNode) opt.transition = '';
                });
            });
            this.nodes.delete(this.selectedNode);
            this.blocks = this.blocks.filter(b => b.id !== this.selectedNode);
            this.selectedNode = null;
            this.selectedOption = null;
            this.selectedBlock = null;
            this.els.nodeProperties.style.display = 'none';
            this.els.optionProperties.style.display = 'none';
            this.els.questProperties.style.display = 'none';
            this.els.emptyState.style.display = 'flex';
            this.renderNodes();
            this.syncCodeView();
        } else if (this.selectedQuest) {
            this.quests.delete(this.selectedQuest);
            this.blocks = this.blocks.filter(b => b.id !== this.selectedQuest);
            this.selectedQuest = null;
            this.selectedBlock = null;
            this.els.nodeProperties.style.display = 'none';
            this.els.optionProperties.style.display = 'none';
            this.els.questProperties.style.display = 'none';
            this.els.emptyState.style.display = 'flex';
            this.renderQuestBlocks();
            this.syncCodeView();
        }
    }
    
    updateTransitionsList() {
        const select = this.els.optionTransition;
        select.innerHTML = '<option value="">— Нет —</option>';
        this.nodes.forEach((node, nodeId) => {
            if (nodeId !== this.selectedNode) {
                const opt = document.createElement('option');
                opt.value = nodeId;
                opt.textContent = nodeId;
                select.appendChild(opt);
            }
        });
    }
    
    render() { 
        this.renderNodes(); 
        this.renderQuestBlocks(); 
        this.renderQuestPalette(); 
    }
    
    renderNodes() {
        const container = this.els.nodeContainer;
        container.innerHTML = '';
        
        this.blocks.filter(b => b.type === 'dialogue').forEach(node => {
            const el = this.createNodeElement(node);
            container.appendChild(el);
        });
        
        requestAnimationFrame(() => this.renderConnections());
    }
    
    renderQuestBlocks() {
        const container = this.els.questContainer;
        container.innerHTML = '';
        
        this.blocks.filter(b => b.type === 'quest').forEach(quest => {
            const el = this.createQuestBlockElement(quest);
            container.appendChild(el);
        });
        
        requestAnimationFrame(() => this.renderConnections());
    }
    
    createNodeElement(node) {
        const div = document.createElement('div');
        div.className = `dialogue-node ${node.id === this.selectedNode ? 'selected' : ''} ${node.collapsed ? 'collapsed' : ''}`;
        div.dataset.nodeId = node.id;
        div.dataset.action = 'select-node';
        div.dataset.id = node.id;
        div.style.left = `${node.x}px`;
        div.style.top = `${node.y}px`;
        
        const previewText = this.escapeHtml(node.text.length > 80 ? node.text.substring(0, 80) + '...' : node.text);
        
        div.innerHTML = `
            <div class="node-header">
                <button class="collapse-btn" data-action="toggle-collapse" data-id="${node.id}">
                    ${node.collapsed ? '▶' : '▼'}
                </button>
                <span class="node-header-text">${this.escapeHtml(node.id)}</span>
            </div>
            <div class="node-content">
                <div class="node-text">${previewText}</div>
                ${node.options.map((opt) => {
                    const handleClass = this.getOptionHandleClass(opt);
                    const iconHtml = opt.icon ? this.getIconHtml(opt.icon, 16) : '';
                    return `
                    <div class="option ${opt.id === this.selectedOption ? 'selected' : ''} ${this.getOptionClass(opt)}" 
                         data-action="select-option" 
                         data-option-id="${opt.id}">
                        ${iconHtml}
                        <span class="option-text">${this.escapeHtml(opt.text.length > 25 ? opt.text.substring(0, 25) + '...' : opt.text)}</span>
                        <div class="option-draw-handle ${handleClass}" 
                             data-draw-handle 
                             data-node-id="${node.id}" 
                             data-option-id="${opt.id}"></div>
                    </div>
                `;
                }).join('')}
            </div>
        `;
        
        this.setupNodeDrag(div, node);
        this.setupDrawHandles(div, node);
        return div;
    }
    
    createQuestBlockElement(quest) {
        const div = document.createElement('div');
        div.className = `quest-block ${quest.id === this.selectedQuest ? 'selected' : ''} ${quest.collapsed ? 'collapsed' : ''}`;
        div.dataset.questId = quest.id;
        div.dataset.action = 'select-quest-block';
        div.dataset.id = quest.id;
        div.style.left = `${quest.x}px`;
        div.style.top = `${quest.y}px`;
        
        const t = translations[this.lang];
        const typeTranslation = t[`questType${quest.questType}`] || quest.questType;
        
        const targetsText = quest.targets.map(ti => {
            const name = this.getItemName(ti.prefab);
            return `${name} х${ti.amount}`;
        }).join(', ');
        
        const rewardsText = quest.rewards.map(r => {
            if (r.type === 'Item') {
                const name = this.getItemName(r.prefab);
                return `${name} х${r.amount}`;
            } else if (r.type === 'Coins') {
                return `${t.rewardTypeCoins} х${r.amount}`;
            } else if (r.type === 'EpicMMO_EXP') {
                return `${t.rewardTypeExp} х${r.amount}`;
            }
            return `${r.type}: ${r.prefab} х${r.amount}`;
        }).join(', ');
        
        div.innerHTML = `
            <div class="node-header">
                <button class="collapse-btn" data-action="toggle-collapse" data-id="${quest.id}">
                    ${quest.collapsed ? '▶' : '▼'}
                </button>
                <span class="node-header-text">${this.escapeHtml(quest.id)}</span>
                <span class="quest-type-badge">${typeTranslation}</span>
            </div>
            <div class="node-content">
                <div class="quest-summary">
                    <div class="quest-summary-item"><strong>${this.escapeHtml(quest.name || '')}</strong></div>
                    ${targetsText ? `<div class="quest-summary-item">${t.targets}: ${this.escapeHtml(targetsText)}</div>` : ''}
                    ${rewardsText ? `<div class="quest-summary-item">${t.rewards}: ${this.escapeHtml(rewardsText)}</div>` : ''}
                </div>
                <div class="quest-draw-handle" data-draw-handle-quest data-quest-id="${quest.id}"></div>
            </div>
        `;
        
        this.setupQuestBlockDrag(div, quest);
        this.setupQuestDrawHandles(div, quest);
        return div;
    }
    
    setupQuestDrawHandles(element, quest) {
        const handle = element.querySelector('[data-draw-handle-quest]');
        if (handle) {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.startDrawingFromQuest(e, quest.id);
            });
        }
    }
    
    startDrawingFromQuest(e, questId) {
        this.isDrawingCurve = true;
        this.drawingFromQuest = { questId };
        this.els.canvasContainer.classList.add('drawing-mode');
        
        const svg = this.els.connectionLayer;
        this.drawingTempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.drawingTempPath.setAttribute('fill', 'none');
        this.drawingTempPath.setAttribute('stroke', '#95a5a6');
        this.drawingTempPath.setAttribute('stroke-width', '2.5');
        this.drawingTempPath.setAttribute('stroke-dasharray', '8 4');
        this.drawingTempPath.setAttribute('marker-end', 'url(#arrowhead-drawing)');
        this.drawingTempPath.setAttribute('opacity', '0.8');
        svg.appendChild(this.drawingTempPath);
    }
    
    getItemName(prefab) {
        const item = this.itemSelectorData.find(i => i.id === prefab);
        if (item) return item.nameRu || item.name;
        return prefab;
    }
    
    getIconHtml(iconId, size = 16) {
        const itemData = this.itemSelectorData.find(i => i.id === iconId);
        const iconUrl = itemData ? `https://raw.githubusercontent.com/EnotinMax/skald/main/icons/${itemData.icon}` : 'https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png';
        return `<img src="${iconUrl}" class="option-icon" style="width: ${size}px; height: ${size}px;" alt="${iconId}" title="${iconId}" onerror="this.src='https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png'">`;
    }
    
    getOptionClass(opt) {
        if (opt.conditions.length > 0) return 'has-conditions';
        if (opt.commands.length > 0) return 'has-commands';
        if (opt.transition) return 'has-transition';
        return 'is-end';
    }
    
    getOptionHandleClass(opt) {
        if (opt.conditions.length > 0) return 'has-conditions';
        if (opt.commands.length > 0) return 'has-commands';
        if (opt.transition) return 'has-transition';
        return 'is-end';
    }
    
    setupNodeDrag(element, node) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let startNodeX = 0, startNodeY = 0;
        
        const onMouseDown = (e) => {
            if (e.target.closest('[data-draw-handle]') || e.target.closest('button') || e.target.closest('.option') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            this.selectNode(node.id);
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startNodeX = node.x;
            startNodeY = node.y;
            e.stopPropagation();
            e.preventDefault();
        };
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = (e.clientX - startX) / this.currentZoom;
            const dy = (e.clientY - startY) / this.currentZoom;
            node.x = startNodeX + dx;
            node.y = startNodeY + dy;
            element.style.left = `${node.x}px`;
            element.style.top = `${node.y}px`;
            this.renderConnections();
        };
        
        const onMouseUp = () => { isDragging = false; };
        
        element.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
    
    setupQuestBlockDrag(element, quest) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let startNodeX = 0, startNodeY = 0;
        
        const onMouseDown = (e) => {
            if (e.target.closest('[data-draw-handle-quest]')) return;
            
            this.selectQuest(quest.id);
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startNodeX = quest.x;
            startNodeY = quest.y;
            e.stopPropagation();
            e.preventDefault();
        };
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = (e.clientX - startX) / this.currentZoom;
            const dy = (e.clientY - startY) / this.currentZoom;
            quest.x = startNodeX + dx;
            quest.y = startNodeY + dy;
            element.style.left = `${quest.x}px`;
            element.style.top = `${quest.y}px`;
            this.renderConnections();
        };
        
        const onMouseUp = () => { isDragging = false; };
        
        element.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
    
    setupDrawHandles(element, node) {
        const handles = element.querySelectorAll('[data-draw-handle]');
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.startDrawing(e, node.id, handle.dataset.optionId);
            });
        });
    }
    
    startDrawing(e, nodeId, optionId) {
        this.isDrawingCurve = true;
        this.drawingFromOption = { nodeId, optionId, type: 'dialogue' };
        this.els.canvasContainer.classList.add('drawing-mode');
        
        const svg = this.els.connectionLayer;
        this.drawingTempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.drawingTempPath.setAttribute('fill', 'none');
        this.drawingTempPath.setAttribute('stroke', '#95a5a6');
        this.drawingTempPath.setAttribute('stroke-width', '2.5');
        this.drawingTempPath.setAttribute('stroke-dasharray', '8 4');
        this.drawingTempPath.setAttribute('marker-end', 'url(#arrowhead-drawing)');
        this.drawingTempPath.setAttribute('opacity', '0.8');
        svg.appendChild(this.drawingTempPath);
    }
    
    onDrawMouseMove(e) {
        if (!this.isDrawingCurve || !this.drawingTempPath) return;
        
        const containerRect = this.els.canvasContainer.getBoundingClientRect();
        const mouseX = (e.clientX - containerRect.left - this.canvasOffset.x) / this.currentZoom;
        const mouseY = (e.clientY - containerRect.top - this.canvasOffset.y) / this.currentZoom;
        
        let sx, sy;
        if (this.drawingFromOption && this.drawingFromOption.type === 'dialogue') {
            const optionEl = this.els.nodeContainer.querySelector(`[data-option-id="${this.drawingFromOption.optionId}"]`);
            if (!optionEl) return;
            const handle = optionEl.querySelector('[data-draw-handle]');
            if (!handle) return;
            const handleRect = handle.getBoundingClientRect();
            sx = (handleRect.right - containerRect.left - this.canvasOffset.x) / this.currentZoom;
            sy = (handleRect.top + handleRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
        } else if (this.drawingFromQuest) {
            const questEl = this.els.questContainer.querySelector(`[data-quest-id="${this.drawingFromQuest.questId}"]`);
            if (!questEl) return;
            const rect = questEl.getBoundingClientRect();
            sx = (rect.right - containerRect.left - this.canvasOffset.x) / this.currentZoom;
            sy = (rect.top + rect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
        }
        
        const pathD = this.getCurvePath(sx, sy, mouseX, mouseY);
        this.drawingTempPath.setAttribute('d', pathD);
    }
    
    onDrawMouseUp(e) {
        if (!this.isDrawingCurve) return;
        
        const target = this.findDrawTarget(e);
        
        if (this.drawingFromOption && this.drawingFromOption.type === 'dialogue') {
            const node = this.nodes.get(this.drawingFromOption.nodeId);
            if (!node) { this.cancelDrawing(); return; }
            const option = node.options.find(o => o.id === this.drawingFromOption.optionId);
            if (!option) { this.cancelDrawing(); return; }
            
            if (target.type === 'node') {
                option.transition = target.id;
            } else if (target.type === 'quest') {
                const openUiCommand = { type: 'OpenUI', params: ['Quests', target.id] };
                option.commands = option.commands.filter(c => !(c.type === 'OpenUI' && c.params[1] === target.id));
                option.commands.push(openUiCommand);
                option.transition = '';
            } else {
                option.transition = '';
                option.commands = option.commands.filter(c => c.type !== 'OpenUI');
            }
        } else if (this.drawingFromQuest) {
            if (target.type === 'quest' && target.id !== this.drawingFromQuest.questId) {
                this.pendingQuestDependency = {
                    sourceId: this.drawingFromQuest.questId,
                    targetId: target.id
                };
                this.cancelDrawing();
                this.showQuestDependencyModal();
                return;
            }
        }
        
        this.cancelDrawing();
        this.render();
        this.syncCodeView();
    }
    
    showQuestDependencyModal() {
        if (this.pendingQuestDependency) {
            this.els.questDependencyModal.classList.add('open');
        }
    }
    
    applyQuestDependency(type) {
        if (!this.pendingQuestDependency) return;
        
        const { sourceId, targetId } = this.pendingQuestDependency;
        const targetQuest = this.quests.get(targetId);
        
        if (targetQuest) {
            targetQuest.requirements = targetQuest.requirements.filter(r => r.type !== 'OtherQuest' && r.type !== 'NotFinished');
            targetQuest.requirements.push({ type, params: [sourceId] });
            this.renderQuestBlocks();
            this.syncCodeView();
        }
        
        this.pendingQuestDependency = null;
        this.els.questDependencyModal.classList.remove('open');
        this.render();
    }
    
    cancelQuestDependency() {
        this.pendingQuestDependency = null;
        this.els.questDependencyModal.classList.remove('open');
    }
    
    findDrawTarget(e) {
        const nodeEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.dialogue-node');
        if (nodeEl) {
            return { type: 'node', id: nodeEl.dataset.nodeId };
        }
        
        const questEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.quest-block');
        if (questEl) {
            return { type: 'quest', id: questEl.dataset.questId };
        }
        
        return { type: 'end' };
    }
    
    cancelDrawing() {
        this.isDrawingCurve = false;
        this.drawingFromOption = null;
        this.drawingFromQuest = null;
        this.els.canvasContainer.classList.remove('drawing-mode');
        if (this.drawingTempPath) {
            this.drawingTempPath.remove();
            this.drawingTempPath = null;
        }
    }
    
    renderNodeOptionsList() {
        const node = this.nodes.get(this.selectedNode);
        if (!node) return;
        
        this.els.nodeOptionsList.innerHTML = node.options.map((opt, i) => `
            <div class="option-list-item ${opt.id === this.selectedOption ? 'selected' : ''}" 
                 data-action="select-option" 
                 data-option-id="${opt.id}">
                <span class="option-list-text">${i + 1}. ${this.escapeHtml(opt.text)}</span>
                <div class="option-list-buttons">
                    <button class="option-list-btn danger" data-action="delete-option" data-option-id="${opt.id}">×</button>
                </div>
            </div>
        `).join('');
    }
    
    renderConnections() {
        const svg = this.els.connectionLayer;
        svg.querySelectorAll('path, .end-cloud-group, .quest-cloud-group, .connection-dot').forEach(el => el.remove());
        
        this.nodes.forEach(node => {
            const nodeEl = this.els.nodeContainer.querySelector(`[data-node-id="${node.id}"]`);
            if (!nodeEl) return;
            
            node.options.forEach((opt) => {
                const optionEl = nodeEl.querySelector(`[data-option-id="${opt.id}"]`);
                if (!optionEl) return;
                
                const handle = optionEl.querySelector('[data-draw-handle]');
                if (!handle) return;
                
                const handleRect = handle.getBoundingClientRect();
                const containerRect = this.els.canvasContainer.getBoundingClientRect();
                
                const sx = (handleRect.right - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                const sy = (handleRect.top + handleRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                
                const colorInfo = this.getOptionColorInfo(opt);
                
                if (opt.transition && this.nodes.has(opt.transition)) {
                    const targetEl = this.els.nodeContainer.querySelector(`[data-node-id="${opt.transition}"]`);
                    if (!targetEl) return;
                    
                    const tRect = targetEl.getBoundingClientRect();
                    const tx = (tRect.left - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                    const ty = (tRect.top + tRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                    
                    const pathD = this.getCurvePath(sx, sy, tx, ty);
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', pathD);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', colorInfo.color);
                    path.setAttribute('stroke-width', '2.5');
                    path.setAttribute('marker-end', `url(#arrowhead-${colorInfo.marker})`);
                    path.setAttribute('opacity', '0.85');
                    path.setAttribute('stroke-linecap', 'round');
                    svg.appendChild(path);
                    
                    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    dot.setAttribute('class', 'connection-dot');
                    dot.setAttribute('cx', sx);
                    dot.setAttribute('cy', sy);
                    dot.setAttribute('r', '4');
                    dot.setAttribute('fill', colorInfo.color);
                    dot.setAttribute('stroke', '#fff');
                    dot.setAttribute('stroke-width', '1');
                    svg.appendChild(dot);
                    
                } else {
                    const openUiCommand = opt.commands.find(c => c.type === 'OpenUI' && c.params[0] === 'Quests');
                    if (openUiCommand && this.quests.has(openUiCommand.params[1])) {
                        const questId = openUiCommand.params[1];
                        const questEl = this.els.questContainer.querySelector(`[data-quest-id="${questId}"]`);
                        if (!questEl) return;
                        
                        const tRect = questEl.getBoundingClientRect();
                        const tx = (tRect.left - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                        const ty = (tRect.top + tRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                        
                        const pathD = this.getCurvePath(sx, sy, tx, ty);
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', pathD);
                        path.setAttribute('fill', 'none');
                        path.setAttribute('stroke', '#f39c12');
                        path.setAttribute('stroke-width', '2.5');
                        path.setAttribute('marker-end', 'url(#arrowhead-orange)');
                        path.setAttribute('opacity', '0.85');
                        path.setAttribute('stroke-linecap', 'round');
                        svg.appendChild(path);
                        
                        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        dot.setAttribute('class', 'connection-dot');
                        dot.setAttribute('cx', sx);
                        dot.setAttribute('cy', sy);
                        dot.setAttribute('r', '4');
                        dot.setAttribute('fill', '#f39c12');
                        dot.setAttribute('stroke', '#fff');
                        dot.setAttribute('stroke-width', '1');
                        svg.appendChild(dot);
                    } else {
                        const endX = sx + 120;
                        const endY = sy;
                        const pathD = this.getCurvePath(sx, sy, endX, endY);
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', pathD);
                        path.setAttribute('fill', 'none');
                        path.setAttribute('stroke', '#95a5a6');
                        path.setAttribute('stroke-width', '2');
                        path.setAttribute('stroke-dasharray', '6 4');
                        path.setAttribute('marker-end', 'url(#arrowhead-gray)');
                        path.setAttribute('opacity', '0.7');
                        path.setAttribute('stroke-linecap', 'round');
                        svg.appendChild(path);
                        
                        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                        dot.setAttribute('class', 'connection-dot');
                        dot.setAttribute('cx', sx);
                        dot.setAttribute('cy', sy);
                        dot.setAttribute('r', '4');
                        dot.setAttribute('fill', '#95a5a6');
                        dot.setAttribute('stroke', '#fff');
                        dot.setAttribute('stroke-width', '1');
                        svg.appendChild(dot);
                        
                        this.renderEndCloud(endX, endY, svg);
                    }
                }
            });
        });
        
        this.quests.forEach(quest => {
            const otherQuestReq = quest.requirements.find(r => r.type === 'OtherQuest');
            if (otherQuestReq && this.quests.has(otherQuestReq.params[0])) {
                const sourceQuestId = otherQuestReq.params[0];
                const sourceQuestEl = this.els.questContainer.querySelector(`[data-quest-id="${sourceQuestId}"]`);
                const targetQuestEl = this.els.questContainer.querySelector(`[data-quest-id="${quest.id}"]`);
                
                if (sourceQuestEl && targetQuestEl) {
                    const sRect = sourceQuestEl.getBoundingClientRect();
                    const tRect = targetQuestEl.getBoundingClientRect();
                    const containerRect = this.els.canvasContainer.getBoundingClientRect();
                    
                    const sx = (sRect.right - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                    const sy = (sRect.top + sRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                    const tx = (tRect.left - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                    const ty = (tRect.top + tRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                    
                    const pathD = this.getCurvePath(sx, sy, tx, ty);
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', pathD);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', '#27ae60');
                    path.setAttribute('stroke-width', '2.5');
                    path.setAttribute('stroke-dasharray', '8 4');
                    path.setAttribute('marker-end', 'url(#arrowhead-green)');
                    path.setAttribute('opacity', '0.85');
                    path.setAttribute('stroke-linecap', 'round');
                    svg.appendChild(path);
                }
            }
            
            const notFinishedReq = quest.requirements.find(r => r.type === 'NotFinished');
            if (notFinishedReq && this.quests.has(notFinishedReq.params[0])) {
                const sourceQuestId = notFinishedReq.params[0];
                const sourceQuestEl = this.els.questContainer.querySelector(`[data-quest-id="${sourceQuestId}"]`);
                const targetQuestEl = this.els.questContainer.querySelector(`[data-quest-id="${quest.id}"]`);
                
                if (sourceQuestEl && targetQuestEl) {
                    const sRect = sourceQuestEl.getBoundingClientRect();
                    const tRect = targetQuestEl.getBoundingClientRect();
                    const containerRect = this.els.canvasContainer.getBoundingClientRect();
                    
                    const sx = (sRect.right - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                    const sy = (sRect.top + sRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                    const tx = (tRect.left - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                    const ty = (tRect.top + tRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                    
                    const pathD = this.getCurvePath(sx, sy, tx, ty);
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', pathD);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', '#e74c3c');
                    path.setAttribute('stroke-width', '2.5');
                    path.setAttribute('stroke-dasharray', '8 4');
                    path.setAttribute('marker-end', 'url(#arrowhead-red)');
                    path.setAttribute('opacity', '0.85');
                    path.setAttribute('stroke-linecap', 'round');
                    svg.appendChild(path);
                }
            }
        });
    }
    
    getOptionColorInfo(opt) {
        if (opt.conditions.length > 0) return { color: '#e74c3c', marker: 'red' };
        if (opt.commands.length > 0) return { color: '#27ae60', marker: 'green' };
        if (opt.transition) return { color: '#3498db', marker: 'blue' };
        return { color: '#95a5a6', marker: 'gray' };
    }
    
    getCurvePath(sx, sy, tx, ty) {
        const dx = tx - sx;
        const dy = ty - sy;
        
        if (dx > 30) {
            const cpOffset = Math.max(50, dx * 0.4);
            return `M ${sx} ${sy} C ${sx + cpOffset} ${sy}, ${tx - cpOffset} ${ty}, ${tx} ${ty}`;
        } else {
            const loopOffset = 80 + Math.abs(dy) * 0.3;
            const goUp = sy > 200;
            const vertDir = goUp ? -1 : 1;
            const midY = sy + vertDir * loopOffset;
            
            return `M ${sx} ${sy} ` +
                `C ${sx + loopOffset} ${sy}, ${sx + loopOffset} ${midY}, ${(sx + tx) / 2} ${midY} ` +
                `S ${tx - loopOffset} ${ty}, ${tx} ${ty}`;
        }
    }
    
    renderEndCloud(x, y, svg) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'end-cloud-group');
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y - 16);
        rect.setAttribute('width', 80);
        rect.setAttribute('height', 32);
        rect.setAttribute('rx', 8);
        rect.setAttribute('ry', 8);
        rect.setAttribute('fill', '#3d4450');
        rect.setAttribute('stroke', '#95a5a6');
        rect.setAttribute('stroke-width', '1.5');
        g.appendChild(rect);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 40);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#bdc3c7');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-style', 'italic');
        text.textContent = translations[this.lang].legendEnd;
        g.appendChild(text);
        
        svg.appendChild(g);
    }
    
    renderQuestPalette() {
        this.els.questPaletteList.innerHTML = Array.from(this.quests.values()).map(q => `
            <div class="quest-palette-item" data-quest-id="${q.id}">
                <div class="quest-palette-item-name">${this.escapeHtml(q.name)}</div>
                <div class="quest-palette-item-id">${this.escapeHtml(q.id)}</div>
            </div>
        `).join('');
    }
    
    startCanvasDrag(e) {
        if (e.target.closest('.dialogue-node') || e.target.closest('.quest-block') || e.target.closest('.quest-palette') || e.target.closest('[data-draw-handle]') || e.target.closest('[data-draw-handle-quest]')) return;
        this.isCanvasDragging = true;
        this.canvasStartPos = { x: e.clientX - this.canvasOffset.x, y: e.clientY - this.canvasOffset.y };
    }
    
    canvasDrag(e) {
        if (!this.isCanvasDragging) return;
        this.canvasOffset.x = e.clientX - this.canvasStartPos.x;
        this.canvasOffset.y = e.clientY - this.canvasStartPos.y;
        this.applyCanvasTransform();
    }
    
    stopCanvasDrag() { this.isCanvasDragging = false; }
    
    applyCanvasTransform() {
        const transform = `translate(${this.canvasOffset.x}px, ${this.canvasOffset.y}px) scale(${this.currentZoom})`;
        const origin = '0 0';
        this.els.connectionLayer.style.transform = transform;
        this.els.connectionLayer.style.transformOrigin = origin;
        this.els.nodeContainer.style.transform = transform;
        this.els.nodeContainer.style.transformOrigin = origin;
        this.els.questContainer.style.transform = transform;
        this.els.questContainer.style.transformOrigin = origin;
    }
    
    zoom(delta) {
        this.currentZoom = Math.max(0.2, Math.min(3, this.currentZoom + delta));
        this.applyCanvasTransform();
    }
    
    fitToScreen() {
        this.currentZoom = 1;
        this.canvasOffset = { x: 0, y: 0 };
        this.applyCanvasTransform();
    }
    
    showPreview() {
        if (!this.selectedNode) { alert('Select a dialogue first'); return; }
        this.previewHistory = [];
        this.currentPreviewNode = this.nodes.get(this.selectedNode);
        this.els.previewContent.innerHTML = this.generatePreview(this.currentPreviewNode, true);
        this.openModal('previewModal');
    }
    
    generatePreview(node, isRoot = false) {
        const processedText = this.processTextForPreview(node.text);
        let html = '';
        
        if (!isRoot) {
            html += `<div class="preview-back"><button data-action="preview-go-back">← ${translations[this.lang].back}</button></div>`;
        }
        
        html += `
            <div class="preview-profile">[ ${this.escapeHtml(node.id)} ]</div>
            <div class="preview-npc-text">${processedText}</div>
            <div class="preview-options">
        `;
        
        node.options.forEach((option, index) => {
            const processedOptionText = this.processTextForPreview(option.text);
            let transitionText = '';
            let onClickAttr = '';
            
            if (option.transition) {
                transitionText = `→ ${this.escapeHtml(option.transition)}`;
                onClickAttr = `data-action="navigate" data-target="${this.escapeHtml(option.transition)}"`;
            } else {
                const openUiCommand = option.commands.find(c => c.type === 'OpenUI' && c.params[0] === 'Quests');
                if (openUiCommand) {
                    const quest = this.quests.get(openUiCommand.params[1]);
                    transitionText = `📜 ${quest ? this.escapeHtml(quest.name) : openUiCommand.params[1]}`;
                }
            }
            
            const iconHtml = option.icon ? this.getIconHtml(option.icon, 18) : '';
            
            html += `
                <div class="preview-option" ${onClickAttr}>
                    ${iconHtml}
                    <span class="preview-option-number">${index + 1})</span>
                    <span class="preview-option-text">${processedOptionText}</span>
                    ${transitionText ? `<span class="preview-option-transition">${transitionText}</span>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    previewNavigate(nodeId) {
        const targetNode = this.nodes.get(nodeId);
        if (!targetNode) return;
        this.previewHistory.push(this.currentPreviewNode);
        this.currentPreviewNode = targetNode;
        this.els.previewContent.innerHTML = this.generatePreview(targetNode, false);
    }
    
    previewGoBack() {
        if (this.previewHistory.length > 0) {
            this.currentPreviewNode = this.previewHistory.pop();
            const isRoot = this.previewHistory.length === 0;
            this.els.previewContent.innerHTML = this.generatePreview(this.currentPreviewNode, isRoot);
        }
    }
    
    processTextForPreview(text) {
        if (!text) return '';
        let processed = text.replace(/\\n/g, '<br>');
        processed = processed.replace(/<color=([^>]+)>([^<]*)<\/color>/g, '<span style="color: $1">$2</span>');
        processed = processed.replace(/<size=(\d+)>([^<]*)<\/size>/g, '<span style="font-size: $1px">$2</span>');
        processed = processed.replace(/<image=([^>]+)>/g, '<br><img src="$1" style="max-width: 100%; border-radius: 4px; margin: 5px 0;"><br>');
        return processed;
    }
    
    updateConditionParams() {
        this.renderParamInputs(this.els.conditionParams, this.getConditionParams(this.els.conditionType.value));
    }
    
    updateCommandParams() {
        this.renderParamInputs(this.els.commandParams, this.getCommandParams(this.els.commandType.value));
    }
    
    renderParamInputs(container, params) {
        container.innerHTML = params.map(name => `
            <div class="form-group">
                <label>${name}:</label>
                <input type="text" class="form-control param-input" data-param="${name}" placeholder="${name}">
            </div>
        `).join('');
    }
    
    getConditionParams(type) {
        const map = {
            'HasItem': ['ItemPrefab', 'Amount', 'ItemLevel'],
            'NotHasItem': ['ItemPrefab', 'Amount', 'ItemLevel'],
            'SkillMore': ['SkillName', 'MinLevel'],
            'SkillLess': ['SkillName', 'MaxLevel'],
            'QuestFinished': ['QuestName'],
            'NotFinished': ['QuestName'],
            'HasQuest': ['QuestName'],
            'NotHasQuest': ['QuestName'],
            'GlobalKey': ['KeyName'],
            'NotGlobalKey': ['KeyName'],
            'OtherQuest': ['QuestID'],
            'IsVIP': [],
            'Time': ['Seconds']
        };
        return map[type] || [];
    }
    
    getCommandParams(type) {
        const map = {
            'GiveItem': ['ItemPrefab', 'Amount', 'Level'],
            'RemoveItem': ['ItemPrefab', 'Amount'],
            'GiveQuest': ['QuestName'],
            'FinishQuest': ['QuestID'],
            'RemoveQuest': ['QuestName', 'TriggerEvent'],
            'OpenUI': ['UIType', 'Profile'],
            'PlaySound': ['SoundName'],
            'Spawn': ['PrefabName', 'Amount', 'Level'],
            'Teleport': ['X', 'Y', 'Z', 'TeleportWithOre'],
            'Damage': ['Amount'],
            'Heal': ['Amount'],
            'GiveBuff': ['BuffName', 'Duration'],
            'AddPin': ['PinName', 'X', 'Y', 'Z']
        };
        return map[type] || [];
    }
    
    saveCondition() {
        const node = this.nodes.get(this.selectedNode);
        if (!node || !this.selectedOption) return;
        const option = node.options.find(o => o.id === this.selectedOption);
        if (!option) return;
        
        const type = this.els.conditionType.value;
        const params = Array.from(this.els.conditionParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v);
        
        option.conditions.push({ type, params });
        this.renderConditionsList(option.conditions);
        this.closeAllModals();
        this.renderNodes();
        this.syncCodeView();
    }
    
    saveCommand() {
        const node = this.nodes.get(this.selectedNode);
        if (!node || !this.selectedOption) return;
        const option = node.options.find(o => o.id === this.selectedOption);
        if (!option) return;
        
        const type = this.els.commandType.value;
        const params = Array.from(this.els.commandParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v);
        
        option.commands.push({ type, params });
        this.renderCommandsList(option.commands);
        this.closeAllModals();
        this.renderNodes();
        this.syncCodeView();
    }
    
    renderConditionsList(conditions) {
        this.els.conditionsList.innerHTML = conditions.map((c, i) => `
            <div class="condition-item">
                <span>${c.type}(${c.params.join(', ')})</span>
                <button data-action="delete-condition" data-index="${i}">×</button>
            </div>
        `).join('');
    }
    
    renderCommandsList(commands) {
        this.els.commandsList.innerHTML = commands.map((c, i) => `
            <div class="command-item">
                <span>${c.type}(${c.params.join(', ')})</span>
                <button data-action="delete-command" data-index="${i}">×</button>
            </div>
        `).join('');
    }
    
    removeCondition(index) {
        const node = this.nodes.get(this.selectedNode);
        if (!node || !this.selectedOption) return;
        const option = node.options.find(o => o.id === this.selectedOption);
        if (option) { option.conditions.splice(index, 1); this.renderConditionsList(option.conditions); this.renderNodes(); this.syncCodeView(); }
    }
    
    removeCommand(index) {
        const node = this.nodes.get(this.selectedNode);
        if (!node || !this.selectedOption) return;
        const option = node.options.find(o => o.id === this.selectedOption);
        if (option) { option.commands.splice(index, 1); this.renderCommandsList(option.commands); this.renderNodes(); this.syncCodeView(); }
    }
    
    showQuestPreview() {
        if (!this.selectedQuest) { alert('Select a quest'); return; }
    }
    
    previewSelectQuest(id) {
        this.selectedQuest = id;
        this.renderQuestPalette();
    }
    
    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            this.cfgFiles[file.name] = content;
            this.fileContents[file.name] = content;
            this.currentCfgFile = file.name;
            
            const result = this.smartParse(content);
            this.showImportStats(result);
            this.render();
            
            this.renderCodeTabs();
            this.showCodeFile(file.name);
            this.switchTab('tabField');
        };
        reader.readAsText(file);
        e.target.value = '';
    }
    
    smartParse(content) {
        const stats = { dialogues: 0, quests: 0, unknown: 0, unknownBlocks: [] };
        
        const blocks = content.split(/\n(?=\[)/);
        
        blocks.forEach(block => {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length === 0) return;
            
            const firstLine = lines[0];
            if (!firstLine.startsWith('[') || !firstLine.endsWith(']')) return;
            
            const blockId = firstLine.slice(1, -1).trim();
            const autocomplete = blockId.includes('=autocomplete');
            const cleanId = autocomplete ? blockId.split('=')[0] : blockId;
            
            if (!cleanId) return;
            
            const secondLine = lines.length > 1 ? lines[1] : '';
            const questTypes = ['Kill', 'Collect', 'Harvest', 'Craft', 'Talk', 'Build', 'Move'];
            
            if (questTypes.includes(secondLine)) {
                stats.quests++;
                this.parseQuestBlock(cleanId, lines, autocomplete);
            } else if (secondLine && !secondLine.startsWith('Text:')) {
                stats.dialogues++;
                this.parseDialogueBlock(cleanId, lines);
            } else {
                stats.unknown++;
                stats.unknownBlocks.push(cleanId);
            }
        });
        
        return stats;
    }
    
    parseDialogueBlock(id, lines) {
        if (this.nodes.has(id)) return;
        
        const node = {
            type: 'dialogue',
            id: id,
            text: '',
            options: [],
            x: 100 + (this.nodes.size % 5) * 300,
            y: 100 + Math.floor(this.nodes.size / 5) * 300,
            collapsed: false
        };
        
        if (lines.length > 1 && !lines[1].startsWith('Text:')) {
            node.text = lines[1];
        }
        
        for (let i = 2; i < lines.length; i++) {
            if (lines[i].startsWith('Text:')) {
                this.parseOptionLine(node, lines[i]);
            }
        }
        
        this.blocks.push(node);
        this.nodes.set(id, node);
    }
    
    parseQuestBlock(id, lines, autocomplete) {
        if (this.quests.has(id)) return;
        
        const quest = {
            type: 'quest',
            id: id,
            questType: lines.length > 1 ? lines[1] : 'Kill',
            name: lines.length > 2 ? lines[2] : '',
            description: '',
            targets: [],
            rewards: [],
            cooldown: '',
            timeLimit: '',
            requirements: [],
            autocomplete: autocomplete,
            x: 400 + (this.quests.size % 5) * 300,
            y: 100 + Math.floor(this.quests.size / 5) * 300,
            collapsed: false
        };
        
        let descStart = 3;
        let descEnd = descStart;
        while (descEnd < lines.length && !this.isQuestDataLine(lines[descEnd])) {
            descEnd++;
        }
        quest.description = lines.slice(descStart, descEnd).join('\n');
        
        let i = descEnd;
        while (i < lines.length) {
            const line = lines[i];
            
            if (this.isQuestTargetLine(line)) {
                line.split('|').map(p => p.trim()).forEach(p => {
                    const d = p.split(',');
                    quest.targets.push({ prefab: d[0] || '', amount: d[1] || '1', level: d[2] || '' });
                });
            } else if (this.isQuestRewardLine(line)) {
                line.split('|').map(p => p.trim()).forEach(p => {
                    const d = p.split(':');
                    if (d.length >= 2) {
                        const ps = d[1].split(',');
                        quest.rewards.push({ type: d[0], prefab: ps[0] || '', amount: ps[1] || '1' });
                    }
                });
            } else if (/^\d+$/.test(line)) {
                quest.cooldown = line;
            } else if (line.startsWith('OtherQuest:')) {
                quest.requirements.push({ type: 'OtherQuest', params: [line.substring(11).trim()] });
            } else if (line.startsWith('NotFinished:')) {
                quest.requirements.push({ type: 'NotFinished', params: [line.substring(12).trim()] });
            } else if (line !== 'None' && line.includes(':')) {
                const d = line.split(':');
                quest.requirements.push({ type: d[0], params: d[1] ? d[1].split(',').map(x => x.trim()) : [] });
            }
            
            i++;
        }
        
        this.blocks.push(quest);
        this.quests.set(id, quest);
    }
    
    isQuestDataLine(line) {
        return this.isQuestTargetLine(line) || this.isQuestRewardLine(line) || /^\d+$/.test(line) || line === 'None' || line.startsWith('OtherQuest:') || line.startsWith('NotFinished:') || (line.includes(':') && !line.startsWith('Text:'));
    }
    
    isQuestTargetLine(line) {
        return /[^,]+,\s*\d+/.test(line) && !line.includes(':');
    }
    
    isQuestRewardLine(line) {
        return /^(Item|Skill|Pet|Skill_EXP|EpicMMO_EXP|Battlepass_EXP|MH_EXP|Cozyheim_EXP|SetCustomValue|AddCustomValue):/.test(line);
    }
    
    parseOptionLine(node, line) {
        const parts = line.split('|').map(p => p.trim());
        const textPart = parts.find(p => p.startsWith('Text:'));
        if (!textPart) return;
        
        const option = {
            id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            text: textPart.substring(5).trim(),
            transition: '',
            icon: '',
            conditions: [],
            commands: []
        };
        
        parts.forEach(part => {
            if (part.startsWith('Transition:')) {
                option.transition = part.substring(11).trim();
            } else if (part.startsWith('Icon:')) {
                option.icon = part.substring(5).trim();
            } else if (part.startsWith('Condition:')) {
                this.parseCondition(option, part.substring(10).trim());
            } else if (part.startsWith('Command:')) {
                this.parseCommand(option, part.substring(8).trim());
            }
        });
        
        node.options.push(option);
    }
    
    parseCondition(option, str) {
        const parts = str.split(',').map(p => p.trim());
        option.conditions.push({ type: parts[0], params: parts.slice(1) });
    }
    
    parseCommand(option, str) {
        const parts = str.split(',').map(p => p.trim());
        option.commands.push({ type: parts[0], params: parts.slice(1) });
    }
    
    showImportStats(stats) {
        this.els.statDialogues.textContent = stats.dialogues;
        this.els.statQuests.textContent = stats.quests;
        this.els.statUnknown.textContent = stats.unknown;
        
        this.els.unknownBlocksList.innerHTML = stats.unknownBlocks.map(id => 
            `<div class="unknown-block-item">${this.escapeHtml(id)}</div>`
        ).join('');
        
        this.els.importStatsModal.classList.add('open');
    }
    
    generateCfgFromData() {
        let cfg = '';
        
        this.blocks.filter(b => b.type === 'dialogue').forEach(node => {
            cfg += `[${node.id}]\n${node.text}\n`;
            node.options.forEach(opt => {
                let line = `Text: ${opt.text}`;
                if (opt.transition) line += ` | Transition: ${opt.transition}`;
                opt.commands.forEach(cmd => { line += ` | Command: ${cmd.type}${cmd.params.length ? ', ' + cmd.params.join(', ') : ''}`; });
                opt.conditions.forEach(cond => { line += ` | Condition: ${cond.type}${cond.params.length ? ', ' + cond.params.join(', ') : ''}`; });
                if (opt.icon) line += ` | Icon: ${opt.icon}`;
                cfg += `${line}\n`;
            });
            cfg += '\n';
        });
        
        this.blocks.filter(b => b.type === 'quest').forEach(quest => {
            const questId = quest.autocomplete ? `${quest.id}=autocomplete` : quest.id;
            cfg += `[${questId}]\n`;
            cfg += `${quest.questType}\n`;
            cfg += `${quest.name}\n`;
            cfg += `${quest.description}\n`;
            cfg += quest.targets.length > 0 ? quest.targets.map(t => `${t.prefab},${t.amount},${t.level}`).join(' | ') : 'None';
            cfg += '\n';
            cfg += quest.rewards.length > 0 ? quest.rewards.map(r => `${r.type}:${r.prefab},${r.amount}`).join(' | ') : 'None';
            cfg += '\n';
            cfg += quest.cooldown || 'None';
            cfg += '\n';
            if (quest.requirements.length > 0) {
                cfg += quest.requirements.map(r => `${r.type}:${r.params.join(',')}`).join(' | ');
            } else {
                cfg += 'None';
            }
            cfg += '\n\n';
        });
        
        return cfg;
    }
    
    exportCurrentCfg() {
        if (!this.currentCfgFile) {
            alert('No file selected');
            return;
        }
        const content = this.generateCfgFromData();
        this.downloadFile(this.currentCfgFile, content);
    }
    
    validateDialogue() {
        const errors = [];
        this.nodes.forEach((node, id) => {
            if (!node.text || !node.text.trim()) errors.push(`"${id}": no NPC text`);
            node.options.forEach((opt, i) => {
                if (!opt.text || !opt.text.trim()) errors.push(`"${id}" #${i + 1}: no option text`);
                if (opt.transition && !this.nodes.has(opt.transition)) errors.push(`"${id}" #${i + 1}: invalid transition "${opt.transition}"`);
            });
        });
        if (errors.length === 0) alert('No errors found!');
        else alert('Errors:\n\n' + errors.join('\n'));
    }
    
    searchDialogue(query) {
        if (!query.trim()) {
            document.querySelectorAll('.dialogue-node, .quest-block').forEach(el => el.style.opacity = '1');
            return;
        }
        const q = query.toLowerCase();
        this.blocks.forEach(block => {
            const el = document.querySelector(`[data-node-id="${block.id}"], [data-quest-id="${block.id}"]`);
            if (!el) return;
            const match = block.id.toLowerCase().includes(q) || 
                (block.text && block.text.toLowerCase().includes(q)) ||
                (block.name && block.name.toLowerCase().includes(q));
            el.style.opacity = match ? '1' : '0.25';
        });
    }
    
    loadSampleData() {
        if (this.blocks.length > 0 && !confirm('Replace current data with sample?')) return;
        
        this.blocks = [];
        this.nodes.clear();
        this.quests.clear();
        this.cfgFiles = {};
        this.fileContents = {};
        this.currentCfgFile = 'sample.cfg';
        
        const n1 = this.addNode('лапшеслав', 100, 150);
        n1.text = 'Приветствую, путник!\nХочешь перекусить?';
        const o1 = this.addOptionToNode('лапшеслав', 'А ты кто вообще, воин?'); o1.transition = 'лапшеслав_о_себе';
        const o2 = this.addOptionToNode('лапшеслав', '<color=#f1c40f>Может помочь?</color>'); o2.transition = 'лапшеслав_просьба'; o2.icon = 'Hammer';
        const o3 = this.addOptionToNode('лапшеслав', '(уйти)');
        
        const n2 = this.addNode('лапшеслав_о_себе', 500, 100);
        n2.text = 'Я Лапшеслав, повар.\nГотовлю рамен. Вон меню.';
        const o4 = this.addOptionToNode('лапшеслав_о_себе', 'Сомнительно, я не буду.'); o4.transition = 'лапшеслав';
        
        const n3 = this.addNode('лапшеслав_просьба', 500, 300);
        n3.text = 'Да, помощь нужна.\nДля рамена со свининой не хватает одного ингредиента.\nПринеси, пожалуйста <color=#e74c3c>10 кусков свинины</color>.';
        const o5 = this.addOptionToNode('лапшеслав_просьба', 'Хорошо'); 
        o5.commands.push({ type: 'OpenUI', params: ['Quests', 'лапшеслав_квест'] });
        const o6 = this.addOptionToNode('лапшеслав_просьба', 'В другой раз'); o6.transition = 'лапшеслав';
        
        const n4 = this.addNode('лапшеслав_квествзят', 900, 300);
        n4.text = 'Отлично! Я пока поставлю воду для бульона.';
        this.addOptionToNode('лапшеслав_квествзят', 'Вернусь через пару минут');
        
        const q1 = this.addQuest('лапшеслав_квест', 900, 100);
        q1.questType = 'Collect';
        q1.name = 'Недостающий ингредиент';
        q1.description = 'Принести для варева 10 кусков сырой кабанины.';
        q1.targets = [{ prefab: 'RawMeat', amount: '10', level: '' }];
        q1.rewards = [{ type: 'Item', prefab: 'Coins', amount: '100' }];
        q1.cooldown = '1';
        
        this.cfgFiles['sample.cfg'] = this.generateCfgFromData();
        this.fileContents['sample.cfg'] = this.generateCfgFromData();
        this.render();
        this.renderCodeTabs();
        this.showCodeFile('sample.cfg');
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    syncCodeView() {
        if (this.currentCfgFile) {
            const generated = this.generateCfgFromData();
            this.cfgFiles[this.currentCfgFile] = generated;
            if (document.getElementById('tabCode').classList.contains('active')) {
                this.els.codeEditor.value = generated;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.editor = new DialogueEditor();
});
