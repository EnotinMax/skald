// КУЗНИЦА СКАЛЬДА / SKALD'S FORGE v2.1
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
        appTitle: "Кузница Скальда v2.1",
        appSubtitle: "Редактор диалогов и квестов · Команда OdinSons и EnotinTech",
        searchPlaceholder: "Поиск...",
        importDialogue: "Импорт диалога",
        importQuest: "Импорт квеста",
        quests: "Квесты",
        export: "Экспорт",
        validate: "Проверить",
        addNode: "+ Диалог",
        addOption: "+ Опция",
        delete: "Удалить",
        fitToScreen: "По размеру",
        loadSample: "Пример",
        hintText: "Тяни кружок на опции -> к узлу, квесту или в пустоту",
        legendTransition: "Переход",
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
        labelQuestLink: "Связь с квестом (ID):",
        labelIcon: "Иконка:",
        labelColor: "Цвет:",
        propCondTitle: "Условия",
        addCondition: "+ Условие",
        propCmdTitle: "Команды",
        addCommand: "+ Команда",
        emptyStateText: "Выберите узел или создайте новый",
        tabField: "Поле",
        tabCode: "Код",
        applyCode: "Применить изменения",
        copyCode: "Копировать",
        downloadCode: "Скачать файл",
        renameFile: "Переименовать",
        newFile: "+ Новый файл",
        codeHint: "Изменения применяются по кнопке 'Применить'",
        previewTitle: "Предпросмотр",
        questEditorTitle: "Редактор квестов",
        questListTitle: "Квесты",
        newQuest: "+ Новый",
        condModalTitle: "Добавить условие",
        cmdModalTitle: "Добавить команду",
        targetModalTitle: "Добавить цель",
        rewardModalTitle: "Добавить награду",
        reqModalTitle: "Добавить требование",
        questPreviewTitle: "Предпросмотр квеста",
        save: "Сохранить",
        noQuestSelected: "Выберите квест для редактирования",
        basic: "Основное",
        targets: "Цели",
        rewards: "Награды",
        requirements: "Требования",
        time: "Время",
        cooldown: "Кулдаун (дни):",
        timeLimit: "Лимит (сек):",
        autocomplete: "Автозавершение",
        whatToDo: "Что нужно сделать:",
        reward: "Вознаграждение:",
        takeQuest: "Взять квест",
        noTargets: "Нет целей",
        noRewards: "Нет наград",
        noReqs: "Нет требований",
        noDesc: "Нет описания",
        back: "Назад",
        previewQuestBtn: "Предпросмотр квеста",
        rewardTypeItem: "Предмет",
        rewardTypeCoins: "Монеты",
        rewardTypeExp: "Опыт"
    },
    en: {
        appTitle: "Skald's Forge v2.1",
        appSubtitle: "Dialogue & Quest Editor · by OdinSons & Enotin",
        searchPlaceholder: "Search...",
        importDialogue: "Import Dialogue",
        importQuest: "Import Quest",
        quests: "Quests",
        export: "Export",
        validate: "Validate",
        addNode: "+ Dialogue",
        addOption: "+ Option",
        delete: "Delete",
        fitToScreen: "Fit Screen",
        loadSample: "Sample",
        hintText: "Drag handle on option -> to node, quest or void",
        legendTransition: "Transition",
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
        labelQuestLink: "Quest Link (ID):",
        labelIcon: "Icon:",
        labelColor: "Color:",
        propCondTitle: "Conditions",
        addCondition: "+ Condition",
        propCmdTitle: "Commands",
        addCommand: "+ Command",
        emptyStateText: "Select a node or create new",
        tabField: "Canvas",
        tabCode: "Code",
        applyCode: "Apply Changes",
        copyCode: "Copy",
        downloadCode: "Download File",
        renameFile: "Rename",
        newFile: "+ New File",
        codeHint: "Changes applied via 'Apply Changes' button",
        previewTitle: "Preview",
        questEditorTitle: "Quest Editor",
        questListTitle: "Quests",
        newQuest: "+ New",
        condModalTitle: "Add Condition",
        cmdModalTitle: "Add Command",
        targetModalTitle: "Add Target",
        rewardModalTitle: "Add Reward",
        reqModalTitle: "Add Requirement",
        questPreviewTitle: "Quest Preview",
        save: "Save",
        noQuestSelected: "Select a quest to edit",
        basic: "Basic",
        targets: "Targets",
        rewards: "Rewards",
        requirements: "Requirements",
        time: "Time",
        cooldown: "Cooldown (days):",
        timeLimit: "Time Limit (sec):",
        autocomplete: "Autocomplete",
        whatToDo: "What to do:",
        reward: "Reward:",
        takeQuest: "Take Quest",
        noTargets: "No targets",
        noRewards: "No rewards",
        noReqs: "No requirements",
        noDesc: "No description",
        back: "Back",
        previewQuestBtn: "Preview Quest",
        rewardTypeItem: "Item",
        rewardTypeCoins: "Coins",
        rewardTypeExp: "Experience"
    },
    de: {
        appTitle: "Schmiede des Skalden v2.1",
        appSubtitle: "Dialog- & Quest-Editor · by OdinSons & Enotin",
        searchPlaceholder: "Suche...",
        importDialogue: "Dialog importieren",
        importQuest: "Quest importieren",
        quests: "Quests",
        export: "Exportieren",
        validate: "Überprüfen",
        addNode: "+ Dialog",
        addOption: "+ Option",
        delete: "Löschen",
        fitToScreen: "Einpassen",
        loadSample: "Beispiel",
        hintText: "Ziehe den Griff an der Option -> zu Knoten, Quest oder Leere",
        legendTransition: "Übergang",
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
        labelQuestLink: "Questverknüpfung (ID):",
        labelIcon: "Symbol:",
        labelColor: "Farbe:",
        propCondTitle: "Bedingungen",
        addCondition: "+ Bedingung",
        propCmdTitle: "Befehle",
        addCommand: "+ Befehl",
        emptyStateText: "Wähle einen Knoten oder erstelle einen neuen",
        tabField: "Feld",
        tabCode: "Code",
        applyCode: "Änderungen übernehmen",
        copyCode: "Kopieren",
        downloadCode: "Datei herunterladen",
        renameFile: "Umbenennen",
        newFile: "+ Neue Datei",
        codeHint: "Änderungen werden per 'Übernehmen'-Button angewendet",
        previewTitle: "Vorschau",
        questEditorTitle: "Quest-Editor",
        questListTitle: "Quests",
        newQuest: "+ Neu",
        condModalTitle: "Bedingung hinzufügen",
        cmdModalTitle: "Befehl hinzufügen",
        targetModalTitle: "Ziel hinzufügen",
        rewardModalTitle: "Belohnung hinzufügen",
        reqModalTitle: "Anforderung hinzufügen",
        questPreviewTitle: "Quest-Vorschau",
        save: "Speichern",
        noQuestSelected: "Wähle eine Quest zum Bearbeiten",
        basic: "Allgemein",
        targets: "Ziele",
        rewards: "Belohnungen",
        requirements: "Anforderungen",
        time: "Zeit",
        cooldown: "Abklingzeit (Tage):",
        timeLimit: "Zeitlimit (Sek):",
        autocomplete: "Auto-Abschluss",
        whatToDo: "Was zu tun ist:",
        reward: "Belohnung:",
        takeQuest: "Quest annehmen",
        noTargets: "Keine Ziele",
        noRewards: "Keine Belohnungen",
        noReqs: "Keine Anforderungen",
        noDesc: "Keine Beschreibung",
        back: "Zurück",
        previewQuestBtn: "Quest-Vorschau",
        rewardTypeItem: "Gegenstand",
        rewardTypeCoins: "Münzen",
        rewardTypeExp: "Erfahrung"
    },
    es: {
        appTitle: "Forja del Escaldo v2.1",
        appSubtitle: "Editor de diálogos y misiones · by OdinSons & Enotin",
        searchPlaceholder: "Buscar...",
        importDialogue: "Importar diálogo",
        importQuest: "Importar misión",
        quests: "Misiones",
        export: "Exportar",
        validate: "Validar",
        addNode: "+ Diálogo",
        addOption: "+ Opción",
        delete: "Eliminar",
        fitToScreen: "Ajustar",
        loadSample: "Ejemplo",
        hintText: "Arrastra el círculo de la opción -> al nodo, misión o vacío",
        legendTransition: "Transición",
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
        labelQuestLink: "Vínculo con misión (ID):",
        labelIcon: "Icono:",
        labelColor: "Color:",
        propCondTitle: "Condiciones",
        addCondition: "+ Condición",
        propCmdTitle: "Comandos",
        addCommand: "+ Comando",
        emptyStateText: "Selecciona un nodo o crea uno nuevo",
        tabField: "Campo",
        tabCode: "Código",
        applyCode: "Aplicar cambios",
        copyCode: "Copiar",
        downloadCode: "Descargar archivo",
        renameFile: "Renombrar",
        newFile: "+ Nuevo archivo",
        codeHint: "Los cambios se aplican con el botón 'Aplicar'",
        previewTitle: "Vista previa",
        questEditorTitle: "Editor de misiones",
        questListTitle: "Misiones",
        newQuest: "+ Nueva",
        condModalTitle: "Añadir condición",
        cmdModalTitle: "Añadir comando",
        targetModalTitle: "Añadir objetivo",
        rewardModalTitle: "Añadir recompensa",
        reqModalTitle: "Añadir requisito",
        questPreviewTitle: "Vista previa de misión",
        save: "Guardar",
        noQuestSelected: "Selecciona una misión para editar",
        basic: "General",
        targets: "Objetivos",
        rewards: "Recompensas",
        requirements: "Requisitos",
        time: "Tiempo",
        cooldown: "Enfriamiento (días):",
        timeLimit: "Límite (seg):",
        autocomplete: "Autocompletar",
        whatToDo: "Qué hay que hacer:",
        reward: "Recompensa:",
        takeQuest: "Aceptar misión",
        noTargets: "Sin objetivos",
        noRewards: "Sin recompensas",
        noReqs: "Sin requisitos",
        noDesc: "Sin descripción",
        back: "Atrás",
        previewQuestBtn: "Vista previa de misión",
        rewardTypeItem: "Objeto",
        rewardTypeCoins: "Monedas",
        rewardTypeExp: "Experiencia"
    },
    fr: {
        appTitle: "Forge du Skalde v2.1",
        appSubtitle: "Éditeur de dialogues et quêtes · by OdinSons & Enotin",
        searchPlaceholder: "Rechercher...",
        importDialogue: "Importer dialogue",
        importQuest: "Importer quête",
        quests: "Quêtes",
        export: "Exporter",
        validate: "Valider",
        addNode: "+ Dialogue",
        addOption: "+ Option",
        delete: "Supprimer",
        fitToScreen: "Ajuster",
        loadSample: "Exemple",
        hintText: "Fais glisser le cercle de l'option -> vers le nœud, la quête ou le vide",
        legendTransition: "Transition",
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
        labelQuestLink: "Lien avec quête (ID) :",
        labelIcon: "Icône :",
        labelColor: "Couleur :",
        propCondTitle: "Conditions",
        addCondition: "+ Condition",
        propCmdTitle: "Commandes",
        addCommand: "+ Commande",
        emptyStateText: "Sélectionnez un nœud ou créez-en un nouveau",
        tabField: "Champ",
        tabCode: "Code",
        applyCode: "Appliquer les modifications",
        copyCode: "Copier",
        downloadCode: "Télécharger le fichier",
        renameFile: "Renommer",
        newFile: "+ Nouveau fichier",
        codeHint: "Les modifications sont appliquées via le bouton 'Appliquer'",
        previewTitle: "Aperçu",
        questEditorTitle: "Éditeur de quêtes",
        questListTitle: "Quêtes",
        newQuest: "+ Nouveau",
        condModalTitle: "Ajouter condition",
        cmdModalTitle: "Ajouter commande",
        targetModalTitle: "Ajouter objectif",
        rewardModalTitle: "Ajouter récompense",
        reqModalTitle: "Ajouter exigence",
        questPreviewTitle: "Aperçu de quête",
        save: "Enregistrer",
        noQuestSelected: "Sélectionnez une quête à modifier",
        basic: "Général",
        targets: "Objectifs",
        rewards: "Récompenses",
        requirements: "Exigences",
        time: "Temps",
        cooldown: "Recharge (jours) :",
        timeLimit: "Limite (sec) :",
        autocomplete: "Auto-complétion",
        whatToDo: "Ce qu'il faut faire :",
        reward: "Récompense :",
        takeQuest: "Accepter quête",
        noTargets: "Pas d'objectifs",
        noRewards: "Pas de récompenses",
        noReqs: "Pas d'exigences",
        noDesc: "Pas de description",
        back: "Retour",
        previewQuestBtn: "Aperçu de quête",
        rewardTypeItem: "Objet",
        rewardTypeCoins: "Pièces",
        rewardTypeExp: "Expérience"
    },
    pl: {
        appTitle: "Kuźnia Skalda v2.1",
        appSubtitle: "Edytor dialogów i zadań · by OdinSons & Enotin",
        searchPlaceholder: "Szukaj...",
        importDialogue: "Importuj dialog",
        importQuest: "Importuj zadanie",
        quests: "Zadania",
        export: "Eksportuj",
        validate: "Sprawdź",
        addNode: "+ Dialog",
        addOption: "+ Opcja",
        delete: "Usuń",
        fitToScreen: "Dopasuj",
        loadSample: "Przykład",
        hintText: "Przeciągnij kółko przy opcji -> do węzła, zadania lub pustki",
        legendTransition: "Przejście",
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
        labelQuestLink: "Powiązanie z zadaniem (ID):",
        labelIcon: "Ikona:",
        labelColor: "Kolor:",
        propCondTitle: "Warunki",
        addCondition: "+ Warunek",
        propCmdTitle: "Polecenia",
        addCommand: "+ Polecenie",
        emptyStateText: "Wybierz węzeł lub utwórz nowy",
        tabField: "Pole",
        tabCode: "Kod",
        applyCode: "Zastosuj zmiany",
        copyCode: "Kopiuj",
        downloadCode: "Pobierz plik",
        renameFile: "Zmień nazwę",
        newFile: "+ Nowy plik",
        codeHint: "Zmiany są stosowane przyciskiem 'Zastosuj'",
        previewTitle: "Podgląd",
        questEditorTitle: "Edytor zadań",
        questListTitle: "Zadania",
        newQuest: "+ Nowe",
        condModalTitle: "Dodaj warunek",
        cmdModalTitle: "Dodaj polecenie",
        targetModalTitle: "Dodaj cel",
        rewardModalTitle: "Dodaj nagrodę",
        reqModalTitle: "Dodaj wymóg",
        questPreviewTitle: "Podgląd zadania",
        save: "Zapisz",
        noQuestSelected: "Wybierz zadanie do edycji",
        basic: "Ogólne",
        targets: "Cele",
        rewards: "Nagrody",
        requirements: "Wymagania",
        time: "Czas",
        cooldown: "Odnowienie (dni):",
        timeLimit: "Limit (sek):",
        autocomplete: "Auto-ukończenie",
        whatToDo: "Co trzeba zrobić:",
        reward: "Nagroda:",
        takeQuest: "Przyjmij zadanie",
        noTargets: "Brak celów",
        noRewards: "Brak nagród",
        noReqs: "Brak wymagań",
        noDesc: "Brak opisu",
        back: "Wstecz",
        previewQuestBtn: "Podgląd zadania",
        rewardTypeItem: "Przedmiot",
        rewardTypeCoins: "Monety",
        rewardTypeExp: "Doświadczenie"
    },
    pt: {
        appTitle: "Forja do Escaldo v2.1",
        appSubtitle: "Editor de diálogos e missões · by OdinSons & Enotin",
        searchPlaceholder: "Pesquisar...",
        importDialogue: "Importar diálogo",
        importQuest: "Importar missão",
        quests: "Missões",
        export: "Exportar",
        validate: "Validar",
        addNode: "+ Diálogo",
        addOption: "+ Opção",
        delete: "Excluir",
        fitToScreen: "Ajustar",
        loadSample: "Exemplo",
        hintText: "Arraste o círculo da opção -> para o nó, missão ou vazio",
        legendTransition: "Transição",
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
        labelQuestLink: "Vínculo com missão (ID):",
        labelIcon: "Ícone:",
        labelColor: "Cor:",
        propCondTitle: "Condições",
        addCondition: "+ Condição",
        propCmdTitle: "Comandos",
        addCommand: "+ Comando",
        emptyStateText: "Selecione um nó ou crie um novo",
        tabField: "Campo",
        tabCode: "Código",
        applyCode: "Aplicar alterações",
        copyCode: "Copiar",
        downloadCode: "Baixar arquivo",
        renameFile: "Renomear",
        newFile: "+ Novo arquivo",
        codeHint: "Alterações são aplicadas pelo botão 'Aplicar'",
        previewTitle: "Pré-visualização",
        questEditorTitle: "Editor de missões",
        questListTitle: "Missões",
        newQuest: "+ Nova",
        condModalTitle: "Adicionar condição",
        cmdModalTitle: "Adicionar comando",
        targetModalTitle: "Adicionar objetivo",
        rewardModalTitle: "Adicionar recompensa",
        reqModalTitle: "Adicionar requisito",
        questPreviewTitle: "Pré-visualização da missão",
        save: "Salvar",
        noQuestSelected: "Selecione uma missão para editar",
        basic: "Geral",
        targets: "Objetivos",
        rewards: "Recompensas",
        requirements: "Requisitos",
        time: "Tempo",
        cooldown: "Recarga (dias):",
        timeLimit: "Limite (seg):",
        autocomplete: "Auto-conclusão",
        whatToDo: "O que fazer:",
        reward: "Recompensa:",
        takeQuest: "Aceitar missão",
        noTargets: "Sem objetivos",
        noRewards: "Sem recompensas",
        noReqs: "Sem requisitos",
        noDesc: "Sem descrição",
        back: "Voltar",
        previewQuestBtn: "Pré-visualização da missão",
        rewardTypeItem: "Item",
        rewardTypeCoins: "Moedas",
        rewardTypeExp: "Experiência"
    },
    sv: {
        appTitle: "Skaldens Smedja v2.1",
        appSubtitle: "Dialog- & uppdragredigerare · by OdinSons & Enotin",
        searchPlaceholder: "Sök...",
        importDialogue: "Importera dialog",
        importQuest: "Importera uppdrag",
        quests: "Uppdrag",
        export: "Exportera",
        validate: "Validera",
        addNode: "+ Dialog",
        addOption: "+ Alternativ",
        delete: "Ta bort",
        fitToScreen: "Anpassa",
        loadSample: "Exempel",
        hintText: "Dra handtaget på alternativet -> till nod, uppdrag eller tomrum",
        legendTransition: "Övergång",
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
        labelQuestLink: "Uppdragslänk (ID):",
        labelIcon: "Ikon:",
        labelColor: "Färg:",
        propCondTitle: "Villkor",
        addCondition: "+ Villkor",
        propCmdTitle: "Kommandon",
        addCommand: "+ Kommando",
        emptyStateText: "Välj en nod eller skapa en ny",
        tabField: "Fält",
        tabCode: "Kod",
        applyCode: "Tillämpa ändringar",
        copyCode: "Kopiera",
        downloadCode: "Ladda ner fil",
        renameFile: "Byt namn",
        newFile: "+ Ny fil",
        codeHint: "Ändringar tillämpas via 'Tillämpa'-knappen",
        previewTitle: "Förhandsgranskning",
        questEditorTitle: "Uppdragsredigerare",
        questListTitle: "Uppdrag",
        newQuest: "+ Nytt",
        condModalTitle: "Lägg till villkor",
        cmdModalTitle: "Lägg till kommando",
        targetModalTitle: "Lägg till mål",
        rewardModalTitle: "Lägg till belöning",
        reqModalTitle: "Lägg till krav",
        questPreviewTitle: "Uppdragsförhandsgranskning",
        save: "Spara",
        noQuestSelected: "Välj ett uppdrag att redigera",
        basic: "Allmänt",
        targets: "Mål",
        rewards: "Belöningar",
        requirements: "Krav",
        time: "Tid",
        cooldown: "Nedkyldning (dagar):",
        timeLimit: "Tidsgräns (sek):",
        autocomplete: "Autoslutförande",
        whatToDo: "Vad som ska göras:",
        reward: "Belöning:",
        takeQuest: "Acceptera uppdrag",
        noTargets: "Inga mål",
        noRewards: "Inga belöningar",
        noReqs: "Inga krav",
        noDesc: "Ingen beskrivning",
        back: "Tillbaka",
        previewQuestBtn: "Uppdragsförhandsgranskning",
        rewardTypeItem: "Föremål",
        rewardTypeCoins: "Mynt",
        rewardTypeExp: "Erfarenhet"
    },
    ja: {
        appTitle: "スカルドの鍛冶屋 2.1",
        appSubtitle: "ダイアログ＆クエストエディタ · by OdinSons & Enotin",
        searchPlaceholder: "検索...",
        importDialogue: "ダイアログをインポート",
        importQuest: "クエストをインポート",
        quests: "クエスト",
        export: "エクスポート",
        validate: "検証",
        addNode: "+ ダイアログ",
        addOption: "+ オプション",
        delete: "削除",
        fitToScreen: "画面に合わせる",
        loadSample: "サンプル",
        hintText: "オプションのハンドルをノード、クエスト、または空へドラッグ",
        legendTransition: "遷移",
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
        labelQuestLink: "クエストリンク (ID):",
        labelIcon: "アイコン:",
        labelColor: "色:",
        propCondTitle: "条件",
        addCondition: "+ 条件",
        propCmdTitle: "コマンド",
        addCommand: "+ コマンド",
        emptyStateText: "ノードを選択するか新規作成",
        tabField: "フィールド",
        tabCode: "コード",
        applyCode: "変更を適用",
        copyCode: "コピー",
        downloadCode: "ファイルをダウンロード",
        renameFile: "名前を変更",
        newFile: "+ 新しいファイル",
        codeHint: "変更は「適用」ボタンで適用されます",
        previewTitle: "プレビュー",
        questEditorTitle: "クエストエディタ",
        questListTitle: "クエスト",
        newQuest: "+ 新規",
        condModalTitle: "条件を追加",
        cmdModalTitle: "コマンドを追加",
        targetModalTitle: "目標を追加",
        rewardModalTitle: "報酬を追加",
        reqModalTitle: "要件を追加",
        questPreviewTitle: "クエストプレビュー",
        save: "保存",
        noQuestSelected: "編集するクエストを選択",
        basic: "基本",
        targets: "目標",
        rewards: "報酬",
        requirements: "要件",
        time: "時間",
        cooldown: "クールダウン (日):",
        timeLimit: "制限 (秒):",
        autocomplete: "自動完了",
        whatToDo: "やること:",
        reward: "報酬:",
        takeQuest: "クエストを受ける",
        noTargets: "目標なし",
        noRewards: "報酬なし",
        noReqs: "要件なし",
        noDesc: "説明なし",
        back: "戻る",
        previewQuestBtn: "クエストプレビュー",
        rewardTypeItem: "アイテム",
        rewardTypeCoins: "コイン",
        rewardTypeExp: "経験値"
    }
};

class DialogueEditor {
    constructor() {
        this.nodes = new Map();
        this.quests = new Map();
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
        this.drawingTempPath = null;
        this.cfgFiles = {};
        this.currentCfgFile = null;
        this.lang = localStorage.getItem('skald_lang') || 'ru';
        this.itemSelectorData = [];
        this.loadItemDataForPreview();
        this.optionIconSelector = null;
        this.targetSelector = null;
        this.rewardSelector = null;
        this.els = {};
        this.cacheElements();
        this.initEventListeners();
        
        // Автоматическое создание файла при пустом запуске
        if (Object.keys(this.cfgFiles).length === 0) {
            const newFileName = `skald_${Date.now()}.cfg`;
            this.cfgFiles[newFileName] = '';
            this.currentCfgFile = newFileName;
        }
        
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
            'appTitle', 'appSubtitle', 'searchInput', 'importDialogueBtn', 'importQuestBtn',
            'questsBtn', 'exportBtn', 'validateBtn', 'previewBtn', 'addNodeBtn', 'addOptionBtn',
            'deleteBtn', 'zoomInBtn', 'zoomOutBtn', 'fitToScreenBtn', 'loadSampleBtn',
            'hintText', 'paletteTitle', 'questPalette', 'questPaletteList', 'toggleQuestPalette',
            'connectionLayer', 'nodeContainer', 'canvasContainer',
            'nodeProperties', 'optionProperties', 'emptyState', 'emptyStateText',
            'propNodeTitle', 'labelNodeId', 'nodeId', 'labelNodeText', 'nodeText',
            'propOptionsTitle', 'nodeOptionsList', 'addNodeOptionBtn',
            'propOptionTitle', 'labelOptionText', 'optionText', 'labelTransition', 'optionTransition',
            'labelQuestLink', 'optionQuestLink', 'optionIconSelector', 'labelColor', 'optionColor',
            'propCondTitle', 'conditionsList', 'addConditionBtn', 'propCmdTitle', 'commandsList', 'addCommandBtn',
            'tabFieldBtn', 'tabCodeBtn', 'fileTabs', 'codeEditor', 'applyCodeBtn', 'copyCodeBtn', 'downloadCodeBtn', 'renameFileBtn', 'newFileBtn', 'codeHint',
            'previewModal', 'previewContent', 'previewTitle',
            'questsModal', 'addQuestBtn', 'questsList', 'questEditor', 'questEditorTitle', 'questListTitle',
            'conditionModal', 'conditionType', 'conditionParams', 'saveConditionBtn', 'condModalTitle',
            'commandModal', 'commandType', 'commandParams', 'saveCommandBtn', 'cmdModalTitle',
            'questTargetModal', 'targetPrefabSelector', 'targetAmount', 'targetLevel', 'saveQuestTargetBtn', 'targetModalTitle',
            'questRewardModal', 'rewardType', 'rewardPrefabSelector', 'rewardPrefabDisplay', 'rewardAmount', 'saveQuestRewardBtn', 'rewardModalTitle',
            'questRequirementModal', 'requirementType', 'requirementParams', 'saveQuestRequirementBtn', 'reqModalTitle',
            'questPreviewModal', 'questPreviewContent', 'questPreviewTitle',
            'dialogueFileInput', 'questFileInput',
            'legendTransition', 'legendCondition', 'legendCommand', 'legendEnd'
        ];
        ids.forEach(id => { this.els[id] = document.getElementById(id); });
    }
    initEventListeners() {
        this.els.addNodeBtn.addEventListener('click', () => this.addNode());
        this.els.addOptionBtn.addEventListener('click', () => this.addOptionToSelected());
        this.els.deleteBtn.addEventListener('click', () => this.deleteSelected());
        this.els.zoomInBtn.addEventListener('click', () => this.zoom(0.1));
        this.els.zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));
        this.els.fitToScreenBtn.addEventListener('click', () => this.fitToScreen());
        this.els.loadSampleBtn.addEventListener('click', () => this.loadSampleData());
        this.els.searchInput.addEventListener('input', (e) => this.searchDialogue(e.target.value));
        this.els.importDialogueBtn.addEventListener('click', () => this.els.dialogueFileInput.click());
        this.els.importQuestBtn.addEventListener('click', () => this.els.questFileInput.click());
        this.els.questsBtn.addEventListener('click', () => this.openModal('questsModal'));
        this.els.exportBtn.addEventListener('click', () => this.exportCurrentCfg());
        this.els.validateBtn.addEventListener('click', () => this.validateDialogue());
        this.els.previewBtn.addEventListener('click', () => this.showPreview());
        this.els.dialogueFileInput.addEventListener('change', (e) => this.handleDialogueFileImport(e));
        this.els.questFileInput.addEventListener('change', (e) => this.handleQuestFileImport(e));
        this.els.nodeId.addEventListener('change', (e) => this.updateNodeProperty('id', e.target.value));
        this.els.nodeText.addEventListener('input', (e) => this.updateNodeProperty('text', e.target.value));
        this.els.addNodeOptionBtn.addEventListener('click', () => this.addOptionToNode(this.selectedNode));
        this.els.optionText.addEventListener('input', (e) => this.updateOptionProperty('text', e.target.value));
        this.els.optionTransition.addEventListener('change', (e) => this.updateOptionProperty('transition', e.target.value));
        this.els.optionQuestLink.addEventListener('change', (e) => this.updateOptionProperty('questLink', e.target.value));
        this.els.optionColor.addEventListener('input', (e) => this.updateOptionProperty('color', e.target.value));
        this.els.addConditionBtn.addEventListener('click', () => this.openModal('conditionModal'));
        this.els.addCommandBtn.addEventListener('click', () => this.openModal('commandModal'));
        this.els.conditionType.addEventListener('change', () => this.updateConditionParams());
        this.els.saveConditionBtn.addEventListener('click', () => this.saveCondition());
        this.els.commandType.addEventListener('change', () => this.updateCommandParams());
        this.els.saveCommandBtn.addEventListener('click', () => this.saveCommand());
        this.els.addQuestBtn.addEventListener('click', () => this.addQuest());
        this.els.saveQuestTargetBtn.addEventListener('click', () => this.saveQuestTarget());
        this.els.saveQuestRewardBtn.addEventListener('click', () => this.saveQuestReward());
        this.els.requirementType.addEventListener('change', () => this.updateRequirementParams());
        this.els.saveQuestRequirementBtn.addEventListener('click', () => this.saveQuestRequirement());
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
        this.els.renameFileBtn.addEventListener('click', () => this.renameCurrentFile());
        this.els.newFileBtn.addEventListener('click', () => this.createNewFile());
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
            if (e.key === 'Delete' && this.selectedNode && !isTyping) {
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
        this.els.importDialogueBtn.textContent = t.importDialogue;
        this.els.importQuestBtn.textContent = t.importQuest;
        this.els.questsBtn.textContent = t.quests;
        this.els.exportBtn.textContent = t.export;
        this.els.validateBtn.textContent = t.validate;
        this.els.addNodeBtn.textContent = t.addNode;
        this.els.addOptionBtn.textContent = t.addOption;
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
        this.els.labelQuestLink.textContent = t.labelQuestLink;
        this.els.labelIcon.textContent = t.labelIcon;
        this.els.labelColor.textContent = t.labelColor;
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
        if (this.els.renameFileBtn) this.els.renameFileBtn.textContent = t.renameFile;
        if (this.els.newFileBtn) this.els.newFileBtn.textContent = t.newFile;
        this.els.codeHint.textContent = t.codeHint;
        this.els.previewTitle.textContent = t.previewTitle;
        this.els.questEditorTitle.textContent = t.questEditorTitle;
        this.els.questListTitle.textContent = t.questListTitle;
        this.els.addQuestBtn.textContent = t.newQuest;
        this.els.condModalTitle.textContent = t.condModalTitle;
        this.els.cmdModalTitle.textContent = t.cmdModalTitle;
        this.els.targetModalTitle.textContent = t.targetModalTitle;
        this.els.rewardModalTitle.textContent = t.rewardModalTitle;
        this.els.reqModalTitle.textContent = t.reqModalTitle;
        this.els.questPreviewTitle.textContent = t.questPreviewTitle;
        if (this.els.legendTransition) this.els.legendTransition.textContent = t.legendTransition;
        if (this.els.legendCondition) this.els.legendCondition.textContent = t.legendCondition;
        if (this.els.legendCommand) this.els.legendCommand.textContent = t.legendCommand;
        if (this.els.legendEnd) this.els.legendEnd.textContent = t.legendEnd;
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
            // При переходе на вкладку "Код" обновляем содержимое текущего файла
            this.syncCodeView();
            this.renderCodeTabs();
            if (this.currentCfgFile) this.showCodeFile(this.currentCfgFile);
        }
    }
    renderCodeTabs() {
        const container = this.els.fileTabs;
        container.innerHTML = '';
        Object.keys(this.cfgFiles).forEach(filename => {
            const btn = document.createElement('button');
            btn.className = `code-tab ${filename === this.currentCfgFile ? 'active' : ''}`;
            btn.textContent = filename;
            btn.dataset.file = filename;
            btn.addEventListener('click', () => {
                this.currentCfgFile = filename;
                this.renderCodeTabs();
                this.showCodeFile(filename);
            });
            container.appendChild(btn);
        });
    }
    showCodeFile(filename) {
        this.els.codeEditor.value = this.cfgFiles[filename] || '';
    }
    applyCodeFromEditor() {
        if (!this.currentCfgFile) return;
        const content = this.els.codeEditor.value;
        this.cfgFiles[this.currentCfgFile] = content;
        const isQuest = /Type:\s*(Kill|Collect|Harvest|Craft|Talk|Build|Move)/i.test(content);
        if (isQuest) {
            this.parseQuestCfg(content);
        } else {
            this.parseDialogueCfg(content, true);
        }
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
    renameCurrentFile() {
        if (!this.currentCfgFile) return;
        const newName = prompt('Введите новое имя файла (с расширением .cfg):', this.currentCfgFile);
        if (newName && newName !== this.currentCfgFile) {
            if (!newName.endsWith('.cfg')) {
                alert('Имя файла должно заканчиваться на .cfg');
                return;
            }
            this.cfgFiles[newName] = this.cfgFiles[this.currentCfgFile];
            delete this.cfgFiles[this.currentCfgFile];
            this.currentCfgFile = newName;
            this.renderCodeTabs();
            this.showCodeFile(this.currentCfgFile);
        }
    }
    createNewFile() {
        const fileName = prompt('Введите имя нового файла (с расширением .cfg):', `skald_${Date.now()}.cfg`);
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
            this.currentCfgFile = fileName;
            this.renderCodeTabs();
            this.showCodeFile(this.currentCfgFile);
        }
    }
    handleGlobalClick(e) {
        if (e.target.matches('.close') || e.target.closest('.close')) {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('open');
            return;
        }
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('open');
            return;
        }
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;
        const action = actionTarget.dataset.action;
        const data = actionTarget.dataset;
        switch (action) {
            case 'close-modal':
                const modal = actionTarget.closest('.modal');
                if (modal) modal.classList.remove('open');
                break;
            case 'select-node': this.selectNode(data.id); break;
            case 'select-option': this.selectOption(data.optionId); break;
            case 'navigate': this.previewNavigate(data.target); break;
            case 'preview-go-back': this.previewGoBack(); break;
            case 'toggle-collapse': this.toggleCollapse(data.id); break;
            case 'delete-option': this.deleteOptionFromNode(data.optionId); break;
            case 'delete-condition': this.removeCondition(parseInt(data.index)); break;
            case 'delete-command': this.removeCommand(parseInt(data.index)); break;
            case 'select-quest': this.selectQuest(data.id); break;
            case 'show-quest-target-modal': this.openModal('questTargetModal'); break;
            case 'show-quest-reward-modal': this.openModal('questRewardModal'); break;
            case 'show-quest-req-modal': this.openModal('questRequirementModal'); this.updateRequirementParams(); break;
            case 'delete-quest-target': this.deleteQuestTarget(parseInt(data.index)); break;
            case 'delete-quest-reward': this.deleteQuestReward(parseInt(data.index)); break;
            case 'delete-quest-req': this.deleteQuestRequirement(parseInt(data.index)); break;
            case 'show-quest-preview': this.showQuestPreview(); break;
            case 'preview-select-quest': this.previewSelectQuest(data.id); break;
            case 'open-quest-link': this.openQuestLink(data.questId); break;
            case 'add-quest-reward-inline':
                const q = this.quests.get(this.selectedQuest);
                if (q) {
                    q.rewards.push({ type: 'Item', prefab: '', amount: '1' });
                    this.renderQuestEditor();
                }
                break;
        }
    }
    openQuestLink(questId) {
        this.selectQuest(questId);
        this.openModal('questsModal');
    }
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('open');
            if (id === 'conditionModal') this.updateConditionParams();
            if (id === 'commandModal') this.updateCommandParams();
            if (id === 'questTargetModal') {
                if (this.targetSelector) this.targetSelector.container.innerHTML = '';
                this.targetSelector = new ItemSelector(this.els.targetPrefabSelector, '');
            }
            if (id === 'questRewardModal') {
                if (this.rewardSelector) this.rewardSelector.container.innerHTML = '';
                this.rewardSelector = new ItemSelector(this.els.rewardPrefabSelector, '');
                this.updateRewardModalUI();
            }
        }
    }
    updateRewardModalUI() {
        const rewardType = this.els.rewardType.value;
        const selectorContainer = this.els.rewardPrefabSelector;
        const displayContainer = this.els.rewardPrefabDisplay;
        if (rewardType === 'Item') {
            selectorContainer.style.display = 'block';
            displayContainer.style.display = 'none';
        } else if (rewardType === 'Coins') {
            selectorContainer.style.display = 'none';
            displayContainer.style.display = 'block';
            const coinsData = this.itemSelectorData.find(i => i.id === 'Coins');
            const iconUrl = coinsData ? `https://raw.githubusercontent.com/EnotinMax/skald/main/icons/${coinsData.icon}` : 'https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png';
            displayContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-primary); border-radius: 4px;">
                    <img src="${iconUrl}" style="width: 32px; height: 32px; object-fit: contain;" alt="Coins">
                    <div style="font-size: 13px; color: var(--text-primary); font-family: monospace;">Coins</div>
                </div>
            `;
        } else if (rewardType === 'Exp') {
            selectorContainer.style.display = 'none';
            displayContainer.style.display = 'block';
            displayContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-primary); border-radius: 4px;">
                    <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: 4px; font-size: 18px;">✨</div>
                    <div style="font-size: 13px; color: var(--text-primary); font-family: monospace;">Exp</div>
                </div>
            `;
        }
    }
    closeAllModals() {
        document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    }
    addNode(id = null, x = null, y = null) {
        const nodeId = id || `Node_${Date.now()}`;
        if (this.nodes.has(nodeId)) return null;
        const offset = this.nodes.size * 50;
        const node = {
            id: nodeId,
            text: 'New dialogue...',
            options: [],
            x: x !== null ? x : 100 + offset,
            y: y !== null ? y : 100 + offset,
            collapsed: false
        };
        this.nodes.set(nodeId, node);
        this.renderNodes();
        this.selectNode(nodeId);
        this.syncCodeView();
        return node;
    }
    selectNode(nodeId) {
        this.selectedNode = nodeId;
        this.selectedOption = null;
        document.querySelectorAll('.dialogue-node').forEach(el => {
            el.classList.toggle('selected', el.dataset.nodeId === nodeId);
        });
        if (nodeId) {
            this.els.nodeProperties.style.display = 'block';
            this.els.optionProperties.style.display = 'none';
            this.els.emptyState.style.display = 'none';
            const node = this.nodes.get(nodeId);
            if (node) {
                this.els.nodeId.value = node.id;
                this.els.nodeText.value = node.text;
                this.renderNodeOptionsList();
                this.updateTransitionsList();
                this.updateQuestLinksList();
            }
        }
    }
    selectOption(optionId) {
        this.selectedOption = optionId;
        const node = this.nodes.get(this.selectedNode);
        if (!node) return;
        const option = node.options.find(o => o.id === optionId);
        if (!option) return;
        this.els.nodeProperties.style.display = 'none';
        this.els.optionProperties.style.display = 'block';
        this.els.optionText.value = option.text || '';
        this.els.optionTransition.value = option.transition || '';
        this.els.optionQuestLink.value = option.questLink || '';
        this.els.optionColor.value = option.color || '#ffffff';
        this.renderConditionsList(option.conditions);
        this.renderCommandsList(option.commands);
        this.renderNodeOptionsList();
        this.updateQuestLinksList();
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
            questLink: '',
            icon: '',
            color: '#ffffff',
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
        const node = this.nodes.get(nodeId);
        if (node) { node.collapsed = !node.collapsed; this.renderNodes(); }
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
        if (property === 'transition' && value) {
            option.questLink = '';
            this.els.optionQuestLink.value = '';
        } else if (property === 'questLink' && value) {
            option.transition = '';
            this.els.optionTransition.value = '';
        }
        option[property] = value;
        this.renderNodes();
        this.renderNodeOptionsList();
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
            this.selectedNode = null;
            this.selectedOption = null;
            this.els.nodeProperties.style.display = 'none';
            this.els.optionProperties.style.display = 'none';
            this.els.emptyState.style.display = 'flex';
            this.renderNodes();
            this.syncCodeView();
        }
    }
    updateTransitionsList() {
        const select = this.els.optionTransition;
        select.innerHTML = '<option value="">— None —</option>';
        this.nodes.forEach((node, nodeId) => {
            if (nodeId !== this.selectedNode) {
                const opt = document.createElement('option');
                opt.value = nodeId;
                opt.textContent = nodeId;
                select.appendChild(opt);
            }
        });
    }
    updateQuestLinksList() {
        const select = this.els.optionQuestLink;
        select.innerHTML = '<option value="">— None —</option>';
        this.quests.forEach((quest, questId) => {
            const opt = document.createElement('option');
            opt.value = questId;
            opt.textContent = quest.name || questId;
            select.appendChild(opt);
        });
    }
    render() { this.renderNodes(); this.renderQuestPalette(); }
    renderNodes() {
        const container = this.els.nodeContainer;
        container.innerHTML = '';
        this.nodes.forEach((node, nodeId) => {
            const el = this.createNodeElement(node);
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
    getIconHtml(iconId, size = 16) {
        const itemData = this.itemSelectorData.find(i => i.id === iconId);
        const iconUrl = itemData ? `https://raw.githubusercontent.com/EnotinMax/skald/main/icons/${itemData.icon}` : 'https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png';
        return `<img src="${iconUrl}" class="option-icon" style="width: ${size}px; height: ${size}px;" alt="${iconId}" title="${iconId}" onerror="this.src='https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png'">`;
    }
    getOptionClass(opt) {
        if (opt.conditions.length > 0) return 'has-conditions';
        if (opt.commands.length > 0) return 'has-commands';
        if (opt.transition || opt.questLink) return 'has-transition';
        return 'is-end';
    }
    getOptionHandleClass(opt) {
        if (opt.conditions.length > 0) return 'has-conditions';
        if (opt.commands.length > 0) return 'has-commands';
        if (opt.transition || opt.questLink) return 'has-transition';
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
        this.drawingFromOption = { nodeId, optionId };
        this.els.canvasContainer.classList.add('drawing-mode');
        const svg = this.els.connectionLayer;
        this.drawingTempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.drawingTempPath.setAttribute('fill', 'none');
        this.drawingTempPath.setAttribute('stroke', '#fff');
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
        const optionEl = this.els.nodeContainer.querySelector(`[data-option-id="${this.drawingFromOption.optionId}"]`);
        if (!optionEl) return;
        const handle = optionEl.querySelector('[data-draw-handle]');
        if (!handle) return;
        const handleRect = handle.getBoundingClientRect();
        const sx = (handleRect.right - containerRect.left - this.canvasOffset.x) / this.currentZoom;
        const sy = (handleRect.top + handleRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
        const pathD = this.getCurvePath(sx, sy, mouseX, mouseY);
        this.drawingTempPath.setAttribute('d', pathD);
    }
    onDrawMouseUp(e) {
        if (!this.isDrawingCurve) return;
        const target = this.findDrawTarget(e);
        const node = this.nodes.get(this.drawingFromOption.nodeId);
        if (!node) { this.cancelDrawing(); return; }
        const option = node.options.find(o => o.id === this.drawingFromOption.optionId);
        if (!option) { this.cancelDrawing(); return; }
        if (target.type === 'node') {
            option.transition = target.id;
            option.questLink = '';
        } else if (target.type === 'quest') {
            option.questLink = target.id;
            option.transition = '';
        } else {
            option.transition = '';
            option.questLink = '';
        }
        this.cancelDrawing();
        this.renderNodes();
        this.renderNodeOptionsList();
        this.syncCodeView();
        if (this.selectedOption === option.id) {
            this.els.optionTransition.value = option.transition;
            this.els.optionQuestLink.value = option.questLink;
        }
    }
    findDrawTarget(e) {
        const nodeEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.dialogue-node');
        if (nodeEl && nodeEl.dataset.nodeId !== this.drawingFromOption.nodeId) {
            return { type: 'node', id: nodeEl.dataset.nodeId };
        }
        const questEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.quest-palette-item');
        if (questEl) {
            return { type: 'quest', id: questEl.dataset.questId };
        }
        return { type: 'end' };
    }
    cancelDrawing() {
        this.isDrawingCurve = false;
        this.drawingFromOption = null;
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
        svg.querySelectorAll('path:not([stroke-dasharray="8 4"]), .end-cloud-group, .quest-cloud-group, .connection-dot').forEach(el => el.remove());
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
                } else if (opt.questLink && this.quests.has(opt.questLink)) {
                    const endX = sx + 120;
                    const endY = sy;
                    const pathD = this.getCurvePath(sx, sy, endX, endY);
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
                    this.renderQuestCloud(endX, endY, opt.questLink, svg);
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
            });
        });
    }
    getOptionColorInfo(opt) {
        if (opt.conditions.length > 0) return { color: '#e74c3c', marker: 'red' };
        if (opt.commands.length > 0) return { color: '#27ae60', marker: 'green' };
        if (opt.transition || opt.questLink) return { color: '#f39c12', marker: 'orange' };
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
    renderQuestCloud(x, y, questId, svg) {
        const quest = this.quests.get(questId);
        if (!quest) return;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'quest-cloud-group');
        g.setAttribute('style', 'cursor: pointer;');
        g.dataset.action = 'open-quest-link';
        g.dataset.questId = questId;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y - 18);
        rect.setAttribute('width', 90);
        rect.setAttribute('height', 36);
        rect.setAttribute('rx', 8);
        rect.setAttribute('ry', 8);
        rect.setAttribute('fill', '#2d4a2d');
        rect.setAttribute('stroke', '#27ae60');
        rect.setAttribute('stroke-width', '1.5');
        g.appendChild(rect);
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('x', x + 14);
        icon.setAttribute('y', y + 5);
        icon.setAttribute('font-size', '14');
        icon.textContent = '📜';
        g.appendChild(icon);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 52);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#27ae60');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.textContent = translations[this.lang].paletteTitle;
        g.appendChild(text);
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${quest.name} (${questId})`;
        g.appendChild(title);
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
        if (e.target.closest('.dialogue-node') || e.target.closest('.quest-palette') || e.target.closest('[data-draw-handle]')) return;
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
            const colorStyle = option.color && option.color !== '#ffffff' ? `style="color: ${option.color}"` : '';
            let transitionText = '';
            let onClickAttr = '';
            if (option.transition) {
                transitionText = `→ ${this.escapeHtml(option.transition)}`;
                onClickAttr = `data-action="navigate" data-target="${this.escapeHtml(option.transition)}"`;
            } else if (option.questLink) {
                const quest = this.quests.get(option.questLink);
                transitionText = `📜 ${quest ? this.escapeHtml(quest.name) : option.questLink}`;
                onClickAttr = '';
            }
            const iconHtml = option.icon ? this.getIconHtml(option.icon, 18) : '';
            html += `
                <div class="preview-option" ${onClickAttr}>
                    ${iconHtml}
                    <span class="preview-option-number">${index + 1})</span>
                    <span class="preview-option-text" ${colorStyle}>${processedOptionText}</span>
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
    updateRequirementParams() {
        this.renderParamInputs(this.els.requirementParams, this.getConditionParams(this.els.requirementType.value));
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
            'HasItem': ['ItemPrefab', 'Amount', 'ItemLevel'], 'NotHasItem': ['ItemPrefab', 'Amount', 'ItemLevel'],
            'SkillMore': ['SkillName', 'MinLevel'], 'SkillLess': ['SkillName', 'MaxLevel'],
            'QuestFinished': ['QuestName'], 'NotFinished': ['QuestName'],
            'HasQuest': ['QuestName'], 'NotHasQuest': ['QuestName'],
            'GlobalKey': ['KeyName'], 'NotGlobalKey': ['KeyName']
        };
        return map[type] || [];
    }
    getCommandParams(type) {
        const map = {
            'GiveItem': ['ItemPrefab', 'Amount', 'Level'], 'RemoveItem': ['ItemPrefab', 'Amount'],
            'GiveQuest': ['QuestName'], 'FinishQuest': ['QuestID'],
            'RemoveQuest': ['QuestName', 'TriggerEvent'], 'OpenUI': ['UIType', 'Profile'],
            'PlaySound': ['SoundName'], 'Spawn': ['PrefabName', 'Amount', 'Level'],
            'Teleport': ['X', 'Y', 'Z', 'TeleportWithOre'], 'Damage': ['Amount'],
            'Heal': ['Amount'], 'GiveBuff': ['BuffName', 'Duration'], 'AddPin': ['PinName', 'X', 'Y', 'Z']
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
    addQuest() {
        const id = `Quest_${Date.now()}`;
        this.quests.set(id, {
            id, type: 'Kill', name: 'New Quest', description: 'Description...',
            targets: [], rewards: [], cooldown: '', timeLimit: '',
            requirements: [], autocomplete: false
        });
        this.renderQuestsList();
        this.renderQuestPalette();
        this.selectQuest(id);
        this.syncCodeView();
    }
    selectQuest(id) {
        this.selectedQuest = id;
        document.querySelectorAll('.quest-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.id === id);
        });
        this.renderQuestEditor();
    }
    renderQuestsList() {
        this.els.questsList.innerHTML = Array.from(this.quests.values()).map(q => `
            <div class="quest-item ${q.id === this.selectedQuest ? 'selected' : ''}"
                 data-action="select-quest"
                 data-id="${q.id}">
                <div class="quest-item-name">${this.escapeHtml(q.name)}</div>
                <div class="quest-item-id">${this.escapeHtml(q.id)}</div>
            </div>
        `).join('');
    }
    renderQuestEditor() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) {
            this.els.questEditor.innerHTML = `<div class="no-quest-selected"><p>${translations[this.lang].noQuestSelected}</p></div>`;
            return;
        }
        const t = translations[this.lang];
        const targetsHtml = quest.targets.map((t_item, i) => `
            <div class="quest-target-item" style="display: flex; gap: 8px; align-items: center; flex: 1;">
                <div class="item-selector" style="flex: 1;" data-index="${i}" data-value="${this.escapeHtml(t_item.prefab)}"></div>
                <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <input type="number" class="form-control" style="width: 60px;" value="${t_item.amount}" data-target-amount="${i}">
                </div>
                <button class="option-list-btn danger" data-action="delete-quest-target" data-index="${i}" style="flex-shrink: 0;">×</button>
            </div>
        `).join('') || `<p style="color: var(--text-secondary); font-style: italic;">${t.noTargets}</p>`;
        
        const rewardsHtml = quest.rewards.map((r, i) => {
            let prefabHtml = '';
            let displayName = r.prefab;
            let iconUrl = 'https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png';

            if (r.type === 'Coins' || r.prefab === 'Coins') {
                displayName = t.rewardTypeCoins || 'Coins';
                const coinsData = this.itemSelectorData.find(item => item.id === 'Coins');
                if (coinsData) iconUrl = `https://raw.githubusercontent.com/EnotinMax/skald/main/icons/${coinsData.icon}`;
                prefabHtml = `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-primary); border-radius: 4px; width: 100%;">
                        <img src="${iconUrl}" style="width: 32px; height: 32px; object-fit: contain;" alt="Coins">
                        <div style="font-size: 13px; color: var(--text-primary); font-family: monospace;">${displayName}</div>
                    </div>
                `;
            } else if (r.type === 'Exp' || r.prefab === 'Exp') {
                displayName = t.rewardTypeExp || 'Experience';
                prefabHtml = `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-primary); border-radius: 4px; width: 100%;">
                        <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: 4px; font-size: 18px;">✨</div>
                        <div style="font-size: 13px; color: var(--text-primary); font-family: monospace;">${displayName}</div>
                    </div>
                `;
            } else {
                prefabHtml = `<div class="item-selector" style="width: 100%;" data-reward-index="${i}" data-value="${this.escapeHtml(r.prefab || '')}"></div>`;
            }

            const isSelectedItem = r.type === 'Item' && r.prefab !== 'Coins' && r.prefab !== 'Exp';
            const isSelectedCoins = r.type === 'Coins' || r.prefab === 'Coins';
            const isSelectedExp = r.type === 'Exp' || r.prefab === 'Exp';

            return `
                <div class="quest-reward-item" style="display: flex; gap: 8px; align-items: center; flex: 1;">
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                        <select class="form-control" style="width: 100%;" data-reward-type="${i}">
                            <option value="Item" ${isSelectedItem ? 'selected' : ''}>Item</option>
                            <option value="Coins" ${isSelectedCoins ? 'selected' : ''}>Coins</option>
                            <option value="Exp" ${isSelectedExp ? 'selected' : ''}>Exp</option>
                        </select>
                        ${prefabHtml}
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                        <input type="number" class="form-control" style="width: 60px;" value="${r.amount}" data-reward-amount="${i}">
                    </div>
                    <button class="option-list-btn danger" data-action="delete-quest-reward" data-index="${i}" style="flex-shrink: 0;">×</button>
                </div>
            `;
        }).join('') || `<p style="color: var(--text-secondary); font-style: italic;">${t.noRewards}</p>`;
        
        const reqsHtml = quest.requirements.map((r, i) => `
            <div class="quest-requirement-item">
                <span>${r.type}(${r.params.join(', ')})</span>
                <button data-action="delete-quest-req" data-index="${i}">×</button>
            </div>
        `).join('') || `<p style="color: var(--text-secondary); font-style: italic;">${t.noReqs}</p>`;
        
        this.els.questEditor.innerHTML = `
            <div class="quest-form">
                <div class="quest-form-section">
                    <h4>${t.basic}</h4>
                    <div class="form-group"><label>ID:</label><input type="text" class="form-control quest-id-input" value="${this.escapeHtml(quest.id)}"></div>
                    <div class="form-group">
                        <label>Type:</label>
                        <select class="form-control quest-type-input">
                            ${['Kill', 'Collect', 'Harvest', 'Craft', 'Talk', 'Build', 'Move'].map(tp => `<option value="${tp}" ${quest.type === tp ? 'selected' : ''}>${tp}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>Name:</label><input type="text" class="form-control quest-name-input" value="${this.escapeHtml(quest.name)}"></div>
                    <div class="form-group"><label>Description:</label><textarea class="form-control quest-desc-input" rows="3">${this.escapeHtml(quest.description)}</textarea></div>
                    <div class="form-group"><label><input type="checkbox" class="quest-auto-input" ${quest.autocomplete ? 'checked' : ''}> ${t.autocomplete}</label></div>
                </div>
                <div class="quest-form-section">
                    <h4>${t.targets}</h4>
                    <div class="quest-targets">${targetsHtml}</div>
                    <button class="btn-small" data-action="show-quest-target-modal" style="margin-top: 8px;">+ ${t.targets}</button>
                </div>
                <div class="quest-form-section">
                    <h4>${t.rewards}</h4>
                    <div class="quest-rewards">${rewardsHtml}</div>
                    <button class="btn-small" data-action="add-quest-reward-inline" style="margin-top: 8px;">+ ${t.rewards}</button>
                </div>
                <div class="quest-form-section">
                    <h4>${t.requirements}</h4>
                    <div class="quest-requirements">${reqsHtml}</div>
                    <button class="btn-small" data-action="show-quest-req-modal" style="margin-top: 8px;">+ ${t.requirements}</button>
                </div>
                <div class="quest-form-section">
                    <h4>${t.time}</h4>
                    <div class="form-group"><label>${t.cooldown}</label><input type="number" class="form-control quest-cd-input" value="${quest.cooldown}"></div>
                    <div class="form-group"><label>${t.timeLimit}</label><input type="number" class="form-control quest-tl-input" value="${quest.timeLimit}"></div>
                </div>
                <button class="quest-preview-btn" data-action="show-quest-preview">${t.previewQuestBtn}</button>
            </div>
        `;
        this.bindQuestFormEvents(quest);
        setTimeout(() => {
            this.els.questEditor.querySelectorAll('.item-selector[data-index]').forEach(container => {
                const index = parseInt(container.dataset.index);
                const selector = new ItemSelector(container, container.dataset.value);
                selector.input.addEventListener('change', (e) => {
                    if (quest.targets[index]) {
                        quest.targets[index].prefab = e.target.value.trim();
                        this.syncCodeView();
                    }
                });
            });
            this.els.questEditor.querySelectorAll('.item-selector[data-reward-index]').forEach(container => {
                const index = parseInt(container.dataset.rewardIndex);
                const selector = new ItemSelector(container, container.dataset.value);
                selector.input.addEventListener('change', (e) => {
                    if (quest.rewards[index]) {
                        quest.rewards[index].prefab = e.target.value.trim();
                        this.syncCodeView();
                    }
                });
            });
        }, 0);
    }
    bindQuestFormEvents(quest) {
        const qe = this.els.questEditor;
        const bind = (selector, prop, parser = v => v) => {
            const el = qe.querySelector(selector);
            if (el) {
                const ev = el.type === 'checkbox' ? 'change' : 'input';
                el.addEventListener(ev, (e) => {
                    quest[prop] = parser(el.type === 'checkbox' ? e.target.checked : e.target.value);
                    if (prop === 'name' || prop === 'id') {
                        this.renderQuestsList();
                        this.renderQuestPalette();
                    }
                    this.syncCodeView();
                });
            }
        };
        bind('.quest-id-input', 'id');
        bind('.quest-type-input', 'type');
        bind('.quest-name-input', 'name');
        bind('.quest-desc-input', 'description');
        bind('.quest-auto-input', 'autocomplete');
        bind('.quest-cd-input', 'cooldown');
        bind('.quest-tl-input', 'timeLimit');
        
        qe.querySelectorAll('[data-target-amount]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.targetAmount);
                if (quest.targets[index]) {
                    quest.targets[index].amount = e.target.value;
                    this.syncCodeView();
                }
            });
        });
        qe.querySelectorAll('[data-reward-type]').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.rewardType);
                if (quest.rewards[index]) {
                    quest.rewards[index].type = e.target.value;
                    if (e.target.value === 'Coins') quest.rewards[index].prefab = 'Coins';
                    else if (e.target.value === 'Exp') quest.rewards[index].prefab = 'Exp';
                    else quest.rewards[index].prefab = '';
                    this.renderQuestEditor();
                    this.syncCodeView();
                }
            });
        });
        qe.querySelectorAll('[data-reward-amount]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.rewardAmount);
                if (quest.rewards[index]) {
                    quest.rewards[index].amount = e.target.value;
                    this.syncCodeView();
                }
            });
        });
    }
    saveQuestTarget() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        const prefab = this.targetSelector ? this.targetSelector.input.value.trim() : '';
        if (!prefab) { alert('Enter prefab'); return; }
        quest.targets.push({ prefab, amount: this.els.targetAmount.value || '1', level: this.els.targetLevel.value || '' });
        document.getElementById('questTargetModal').classList.remove('open');
        this.renderQuestEditor();
        this.syncCodeView();
    }
    saveQuestReward() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        const rewardType = this.els.rewardType.value;
        let prefab = '';
        if (rewardType === 'Item') {
            prefab = this.rewardSelector ? this.rewardSelector.input.value.trim() : '';
        } else if (rewardType === 'Coins') {
            prefab = 'Coins';
        } else if (rewardType === 'Exp') {
            prefab = 'Exp';
        }
        if (!prefab) { alert('Enter prefab'); return; }
        quest.rewards.push({ type: rewardType, prefab, amount: this.els.rewardAmount.value || '1' });
        document.getElementById('questRewardModal').classList.remove('open');
        this.renderQuestEditor();
        this.syncCodeView();
    }
    saveQuestRequirement() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        const type = this.els.requirementType.value;
        const params = Array.from(this.els.requirementParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v);
        if (params.length === 0) { alert('Fill parameters'); return; }
        quest.requirements.push({ type, params });
        this.closeAllModals();
        this.renderQuestEditor();
        this.syncCodeView();
    }
    deleteQuestTarget(index) {
        const quest = this.quests.get(this.selectedQuest);
        if (quest) {
            quest.targets.splice(index, 1);
            this.renderQuestEditor();
            this.syncCodeView();
        }
    }
    deleteQuestReward(index) {
        const quest = this.quests.get(this.selectedQuest);
        if (quest) {
            quest.rewards.splice(index, 1);
            this.renderQuestEditor();
            this.syncCodeView();
        }
    }
    deleteQuestRequirement(index) {
        const quest = this.quests.get(this.selectedQuest);
        if (quest) {
            quest.requirements.splice(index, 1);
            this.renderQuestEditor();
            this.syncCodeView();
        }
    }
    showQuestPreview() {
        if (!this.selectedQuest) { alert('Select a quest'); return; }
        this.els.questPreviewContent.innerHTML = this.generateQuestPreview();
        this.openModal('questPreviewModal');
    }
    generateQuestPreview() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return '';
        const t = translations[this.lang];
        const questsList = Array.from(this.quests.values()).map(q => `
            <div class="quest-preview-list-item ${q.id === quest.id ? 'selected' : ''}" data-action="preview-select-quest" data-id="${q.id}">
                ${this.escapeHtml(q.name)}
            </div>
        `).join('');
        const description = this.processQuestDescription(quest.description);
        const targetsHtml = quest.targets.map(ti => {
            const itemData = this.itemSelectorData.find(i => i.id === ti.prefab) || null;
            const displayName = itemData ? (itemData.nameRu || itemData.name) : ti.prefab;
            const iconUrl = itemData ? `https://raw.githubusercontent.com/EnotinMax/skald/main/icons/${itemData.icon}` : 'https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png';
            return `
            <div class="quest-preview-item-row">
                <img src="${iconUrl}" class="item-preview-icon" alt="${ti.prefab}" onerror="this.src='https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png'">
                <div class="quest-preview-item-info">
                    <span class="quest-preview-item-name">${this.escapeHtml(displayName)}</span>
                    <span class="quest-preview-item-id">${this.escapeHtml(ti.prefab)}</span>
                </div>
                <span style="font-weight: bold; color: #f1c40f; margin-left: 10px;">x${ti.amount}</span>
            </div>`;
        }).join('');
        
        const rewardsHtml = quest.rewards.map(r => {
            let iconUrl = 'https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png';
            let displayName = r.prefab;
            
            if (r.type === 'Coins' || r.prefab === 'Coins') {
                displayName = t.rewardTypeCoins || 'Coins';
                const coinsData = this.itemSelectorData.find(i => i.id === 'Coins');
                if (coinsData) iconUrl = `https://raw.githubusercontent.com/EnotinMax/skald/main/icons/${coinsData.icon}`;
            } else if (r.type === 'Exp' || r.prefab === 'Exp') {
                displayName = t.rewardTypeExp || 'Experience';
                iconUrl = '';
            } else {
                const itemData = this.itemSelectorData.find(i => i.id === r.prefab);
                if (itemData) {
                    iconUrl = `https://raw.githubusercontent.com/EnotinMax/skald/main/icons/${itemData.icon}`;
                    displayName = this.lang === 'ru' ? (itemData.nameRu || itemData.name) : itemData.name;
                }
            }
            
            const iconHtml = iconUrl ?
                `<img src="${iconUrl}" class="item-preview-icon" alt="${r.prefab}" onerror="this.src='https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png'">` :
                `<div class="item-preview-icon" style="display: flex; align-items: center; justify-content: center; font-size: 32px;">✨</div>`;
                
            return `
            <div class="quest-preview-item-row">
                ${iconHtml}
                <div class="quest-preview-item-info">
                    <span class="quest-preview-item-name">Item: ${this.escapeHtml(displayName)}</span>
                    <span class="quest-preview-item-id">Item: ${this.escapeHtml(r.prefab)}</span>
                </div>
                <span style="font-weight: bold; color: #f1c40f; margin-left: 10px;">x${r.amount}</span>
            </div>`;
        }).join('');
        
        return `
            <div class="quest-preview-content">
                <div class="quest-preview-sidebar">
                    <h3>${t.questListTitle}</h3>
                    <div class="quest-preview-list">${questsList}</div>
                </div>
                <div class="quest-preview-details">
                    <div class="quest-preview-title">${this.escapeHtml(quest.name)}</div>
                    ${description}
                    <div class="quest-preview-separator"></div>
                    <div class="quest-preview-section"><h4>${t.whatToDo}</h4><div class="quest-preview-objectives">${targetsHtml || `<p>${t.noTargets}</p>`}</div></div>
                    <div class="quest-preview-separator"></div>
                    <div class="quest-preview-section"><h4>${t.reward}</h4><div class="quest-preview-rewards">${rewardsHtml || `<p>${t.noRewards}</p>`}</div></div>
                    <button class="quest-preview-accept-btn">${t.takeQuest}</button>
                </div>
            </div>
        `;
    }
    processQuestDescription(desc) {
        if (!desc) return `<div class="quest-preview-description">${translations[this.lang].noDesc}</div>`;
        const imageMatches = [...desc.matchAll(/<image=([^>]+)>/g)];
        let imageHtml = '';
        if (imageMatches.length > 0) {
            imageHtml = imageMatches.map(match =>
                `<div class="quest-preview-image"><img src="${match[1]}" alt="Quest" onerror="this.style.display='none'"></div>`
            ).join('');
        }
        let cleanDesc = desc.replace(/<image=[^>]+>/g, '');
        cleanDesc = this.escapeHtml(cleanDesc);
        cleanDesc = cleanDesc.replace(/\\n/g, '<br>');
        cleanDesc = cleanDesc.replace(/&lt;color=([^&]+)&gt;([^&]*)&lt;\/color&gt;/g, '<span style="color: $1">$2</span>');
        cleanDesc = cleanDesc.replace(/&lt;size=(\d+)&gt;([^&]*)&lt;\/size&gt;/g, '<span style="font-size: $1px">$2</span>');
        return `<div class="quest-preview-description">${cleanDesc}</div>${imageHtml}`;
    }
    previewSelectQuest(id) {
        this.selectedQuest = id;
        this.renderQuestsList();
        this.els.questPreviewContent.innerHTML = this.generateQuestPreview();
    }
    generateCfgFromData() {
        let cfg = '';
        // Генерация диалогов
        this.nodes.forEach(node => {
            cfg += `[${node.id}]\n${node.text}\n`;
            node.options.forEach(opt => {
                let line = `Text: ${opt.text}`;
                if (opt.transition) line += ` | Transition: ${opt.transition}`;
                if (opt.questLink) line += ` | QuestLink: ${opt.questLink}`;
                opt.commands.forEach(cmd => { line += ` | Command: ${cmd.type}${cmd.params.length ? ', ' + cmd.params.join(', ') : ''}`; });
                opt.conditions.forEach(cond => { line += ` | Condition: ${cond.type}${cond.params.length ? ', ' + cond.params.join(', ') : ''}`; });
                if (opt.icon) line += ` | Icon: ${opt.icon}`;
                if (opt.color && opt.color !== '#ffffff') {
                    const rgb = this.hexToRgb(opt.color);
                    if (rgb) line += ` | Color: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
                }
                cfg += `${line}\n`;
            });
            cfg += '\n';
        });
        // Генерация квестов
        this.quests.forEach(quest => {
            const questId = quest.autocomplete ? `${quest.id}=autocomplete` : quest.id;
            cfg += `[${questId}]\n`;
            cfg += `${quest.type}\n`;
            cfg += `${quest.name}\n`;
            cfg += `${quest.description}\n`;
            cfg += quest.targets.length > 0 ? quest.targets.map(t => `${t.prefab},${t.amount},${t.level}`).join(' | ') : 'None';
            cfg += '\n';
            cfg += quest.rewards.length > 0 ? quest.rewards.map(r => `${r.type}:${r.prefab},${r.amount}`).join(' | ') : 'None';
            cfg += '\n';
            cfg += quest.cooldown || quest.timeLimit ? `${quest.cooldown},${quest.timeLimit}` : 'None';
            cfg += '\n';
            cfg += quest.requirements.length > 0 ? quest.requirements.map(r => `${r.type}:${r.params.join(',')}`).join(' | ') : 'None';
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
    handleDialogueFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            this.cfgFiles[file.name] = content;
            this.currentCfgFile = file.name;
            this.parseDialogueCfg(content, false);
            this.renderCodeTabs();
            this.showCodeFile(file.name);
            this.switchTab('tabField');
        };
        reader.readAsText(file);
        e.target.value = '';
    }
    handleQuestFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            this.cfgFiles[file.name] = content;
            this.currentCfgFile = file.name;
            this.renderCodeTabs();
            this.showCodeFile(file.name);
            this.parseQuestCfg(content);
            this.switchTab('tabField');
        };
        reader.readAsText(file);
        e.target.value = '';
    }
    parseDialogueCfg(content, keepExisting = false) {
        if (!keepExisting) this.nodes.clear();
        const blocks = content.split(/\n(?=\[)/);
        blocks.forEach(block => {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length === 0) return;
            const firstLine = lines[0];
            if (!firstLine.startsWith('[') || !firstLine.endsWith(']')) return;
            const nodeId = firstLine.slice(1, -1).trim();
            if (!nodeId) return;
            if (this.nodes.has(nodeId) && !keepExisting) return;
            const node = {
                id: nodeId,
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
            this.nodes.set(nodeId, node);
        });
        this.renderNodes();
        this.updateTransitionsList();
        this.renderQuestPalette();
        if (this.nodes.size > 0 && !this.selectedNode) {
            this.selectNode(this.nodes.keys().next().value);
        }
    }
    parseOptionLine(node, line) {
        const parts = line.split('|').map(p => p.trim());
        const textPart = parts.find(p => p.startsWith('Text:'));
        if (!textPart) return;
        const option = {
            id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            text: textPart.substring(5).trim(),
            transition: '',
            questLink: '',
            icon: '',
            color: '#ffffff',
            conditions: [],
            commands: []
        };
        parts.forEach(part => {
            if (part.startsWith('Transition:')) option.transition = part.substring(11).trim();
            else if (part.startsWith('QuestLink:')) option.questLink = part.substring(10).trim();
            else if (part.startsWith('Icon:')) option.icon = part.substring(5).trim();
            else if (part.startsWith('Color:')) {
                const rgb = part.substring(6).trim().split(',').map(c => parseInt(c.trim()));
                if (rgb.length === 3) option.color = '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
            }
            else if (part.startsWith('Condition:')) this.parseCondition(option, part.substring(10).trim());
            else if (part.startsWith('Command:')) this.parseCommand(option, part.substring(8).trim());
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
    parseQuestCfg(content) {
        const lines = content.split('\n');
        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line.startsWith('[') && line.endsWith(']')) {
                const questId = line.slice(1, -1);
                const autocomplete = questId.includes('=autocomplete');
                const cleanId = autocomplete ? questId.split('=')[0] : questId;
                const q = { id: cleanId, type: '', name: '', description: '', targets: [], rewards: [], cooldown: '', timeLimit: '', requirements: [], autocomplete };
                i++; if (i < lines.length) { q.type = lines[i].trim(); i++; }
                if (i < lines.length) { q.name = lines[i].trim(); i++; }
                if (i < lines.length) { q.description = lines[i]; i++; }
                if (i < lines.length) {
                    const tl = lines[i].trim();
                    if (tl && tl !== 'None') {
                        tl.split('|').map(p => p.trim()).forEach(p => {
                            const d = p.split(',');
                            q.targets.push({ prefab: d[0] || '', amount: d[1] || '1', level: d[2] || '' });
                        });
                    }
                    i++;
                }
                if (i < lines.length) {
                    const rl = lines[i].trim();
                    if (rl && rl !== 'None') {
                        rl.split('|').map(p => p.trim()).forEach(p => {
                            const d = p.split(':');
                            if (d.length >= 2) {
                                const ps = d[1].split(',');
                                q.rewards.push({ type: d[0], prefab: ps[0] || '', amount: ps[1] || '1' });
                            }
                        });
                    }
                    i++;
                }
                if (i < lines.length) {
                    const tl = lines[i].trim();
                    if (tl && tl !== 'None') {
                        const d = tl.split(',');
                        q.cooldown = d[0] || '';
                        q.timeLimit = d[1] || '';
                    }
                    i++;
                }
                if (i < lines.length) {
                    const rl = lines[i].trim();
                    if (rl && rl !== 'None') {
                        rl.split('|').map(p => p.trim()).forEach(p => {
                            const d = p.split(':');
                            q.requirements.push({ type: d[0], params: d.length > 1 ? d[1].split(',').map(x => x.trim()) : [] });
                        });
                    }
                    i++;
                }
                this.quests.set(q.id, q);
            } else {
                i++;
            }
        }
        this.renderQuestsList();
        this.renderQuestPalette();
        if (this.quests.size > 0 && !this.selectedQuest) {
            this.selectQuest(this.quests.keys().next().value);
        }
    }
    validateDialogue() {
        const errors = [];
        this.nodes.forEach((node, id) => {
            if (!node.text || !node.text.trim()) errors.push(`"${id}": no NPC text`);
            node.options.forEach((opt, i) => {
                if (!opt.text || !opt.text.trim()) errors.push(`"${id}" #${i + 1}: no option text`);
                if (opt.transition && !this.nodes.has(opt.transition)) errors.push(`"${id}" #${i + 1}: invalid transition "${opt.transition}"`);
                if (opt.questLink && !this.quests.has(opt.questLink)) errors.push(`"${id}" #${i + 1}: invalid quest link "${opt.questLink}"`);
            });
        });
        if (errors.length === 0) alert('No errors found!');
        else alert('Errors:\n\n' + errors.join('\n'));
    }
    searchDialogue(query) {
        if (!query.trim()) {
            document.querySelectorAll('.dialogue-node').forEach(el => el.style.opacity = '1');
            return;
        }
        const q = query.toLowerCase();
        this.nodes.forEach((node, id) => {
            const el = document.querySelector(`[data-node-id="${id}"]`);
            if (!el) return;
            const match = id.toLowerCase().includes(q) || node.text.toLowerCase().includes(q) || node.options.some(o => o.text.toLowerCase().includes(q));
            el.style.opacity = match ? '1' : '0.25';
        });
    }
    loadSampleData() {
        if (this.nodes.size > 0 && !confirm('Replace current data with sample?')) return;
        this.nodes.clear();
        this.quests.clear();
        this.cfgFiles = {};
        this.currentCfgFile = 'sample_dialogue.cfg';
        const n1 = this.addNode('лапшеслав', 100, 150);
        n1.text = 'Приветствую, путник!\nХочешь перекусить?';
        const o1 = this.addOptionToNode('лапшеслав', 'А ты кто вообще, воин?'); o1.transition = 'лапшеслав_о_себе';
        const o2 = this.addOptionToNode('лапшеслав', '<color=#f1c40f>Может помочь?</color>'); o2.transition = 'лапшеслав_просьба'; o2.color = '#f1c40f'; o2.icon = 'Hammer';
        const o3 = this.addOptionToNode('лапшеслав', '(уйти)');
        const n2 = this.addNode('лапшеслав_о_себе', 500, 100);
        n2.text = 'Я Лапшеслав, повар.\nГотовлю рамен. Вон меню.';
        const o4 = this.addOptionToNode('лапшеслав_о_себе', 'Сомнительно, я не буду.'); o4.transition = 'лапшеслав';
        const n3 = this.addNode('лапшеслав_просьба', 500, 300);
        n3.text = 'Да, помощь нужна.\nДля рамена со свининой не хватает одного ингредиента.\nПринеси, пожалуйста <color=#e74c3c>10 кусков свинины</color>.';
        const o5 = this.addOptionToNode('лапшеслав_просьба', 'Хорошо'); o5.questLink = 'лапшеслав_квест';
        const o6 = this.addOptionToNode('лапшеслав_просьба', 'В другой раз'); o6.transition = 'лапшеслав';
        const n4 = this.addNode('лапшеслав_квествзят', 900, 300);
        n4.text = 'Отлично! Я пока поставлю воду для бульона.';
        this.addOptionToNode('лапшеслав_квествзят', 'Вернусь через пару минут');
        this.quests.set('лапшеслав_квест', {
            id: 'лапшеслав_квест', type: 'Kill', name: 'Недостающий ингредиент',
            description: 'Принести для варева 10 кусков сырой кабанины.',
            targets: [{ prefab: 'RawMeat', amount: '10', level: '' }],
            rewards: [{ type: 'Item', prefab: 'Coins', amount: '100' }],
            cooldown: '1', timeLimit: '', requirements: [], autocomplete: false
        });
        this.cfgFiles['sample_dialogue.cfg'] = this.generateCfgFromData();
        this.renderNodes();
        this.renderQuestsList();
        this.renderQuestPalette();
        this.renderCodeTabs();
        this.showCodeFile('sample_dialogue.cfg');
    }
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    hexToRgb(hex) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
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
            this.cfgFiles[this.currentCfgFile] = this.generateCfgFromData();
            this.showCodeFile(this.currentCfgFile);
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new DialogueEditor();
});
