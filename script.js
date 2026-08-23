// КУЗНИЦА СКАЛЬДА / SKALD'S FORGE v2.2

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
        appTitle: "Кузница Скальда v2.2",
        appSubtitle: "Редактор диалогов и квестов · Команда OdinSons и EnotinTech",
        searchPlaceholder: "Поиск...",
        importBtn: "Импортировать",
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
        legendEnd: "Конец",
        paletteTitle: "Квесты",
        propNodeTitle: "Диалог NPC",
        labelNodeId: "ID профиля:",
        labelNodeText: "Текст NPC:",
        propOptionsTitle: "Опции диалога",
        addNodeOption: "+ Добавить опцию",
        propOptionTitle: "Опция игрока",
        labelOptionText: "Текст:",
        labelIcon: "Иконка:",
        propCondTitle: "Условия",
        addCondition: "+ Условие",
        propCmdTitle: "Команды",
        addCommand: "+ Команда",
        propQuestTitle: "Квест",
        labelAutocomplete: "Автозавершение",
        labelQuestType: "Тип:",
        labelQuestName: "Название:",
        labelQuestDesc: "Описание:",
        labelTargets: "Цели",
        labelRewards: "Награды",
        labelRequirements: "Требования",
        labelCooldown: "Кулдаун (дни):",
        emptyStateText: "Выберите узел или создайте новый",
        tabField: "Поле",
        tabCode: "Код",
        applyCode: "Применить изменения",
        copyCode: "Копировать",
        downloadCode: "Скачать файл",
        codeHint: "Изменения применяются по кнопке 'Применить'",
        previewTitle: "Предпросмотр",
        condModalTitle: "Добавить условие",
        cmdModalTitle: "Добавить команду",
        targetModalTitle: "Добавить цель",
        rewardModalTitle: "Добавить награду",
        reqModalTitle: "Добавить требование",
        save: "Сохранить",
        noQuestSelected: "Выберите квест для редактирования",
        importStatsTitle: "Результат импорта",
        statDialoguesLabel: "Найдено диалогов:",
        statQuestsLabel: "Найдено квестов:",
        statUnknownLabel: "Не удалось распознать:",
        importOk: "OK",
        back: "Назад"
    },
    en: {
        appTitle: "Skald's Forge v2.2",
        appSubtitle: "Dialogue & Quest Editor · by OdinSons & Enotin",
        searchPlaceholder: "Search...",
        importBtn: "Import",
        export: "Export",
        validate: "Validate",
        addNode: "+ Dialogue",
        addQuest: "+ Quest",
        delete: "Delete",
        fitToScreen: "Fit Screen",
        loadSample: "Sample",
        hintText: "Drag handle on option → to node, quest or void",
        legendTransition: "Transition",
        legendQuestLink: "Quest link",
        legendOtherQuest: "Quest dependency",
        legendEnd: "End",
        paletteTitle: "Quests",
        propNodeTitle: "NPC Dialogue",
        labelNodeId: "Profile ID:",
        labelNodeText: "NPC Text:",
        propOptionsTitle: "Dialogue Options",
        addNodeOption: "+ Add Option",
        propOptionTitle: "Player Option",
        labelOptionText: "Text:",
        labelIcon: "Icon:",
        propCondTitle: "Conditions",
        addCondition: "+ Condition",
        propCmdTitle: "Commands",
        addCommand: "+ Command",
        propQuestTitle: "Quest",
        labelAutocomplete: "Autocomplete",
        labelQuestType: "Type:",
        labelQuestName: "Name:",
        labelQuestDesc: "Description:",
        labelTargets: "Targets",
        labelRewards: "Rewards",
        labelRequirements: "Requirements",
        labelCooldown: "Cooldown (days):",
        emptyStateText: "Select a node or create new",
        tabField: "Canvas",
        tabCode: "Code",
        applyCode: "Apply Changes",
        copyCode: "Copy",
        downloadCode: "Download File",
        codeHint: "Changes applied via 'Apply Changes' button",
        previewTitle: "Preview",
        condModalTitle: "Add Condition",
        cmdModalTitle: "Add Command",
        targetModalTitle: "Add Target",
        rewardModalTitle: "Add Reward",
        reqModalTitle: "Add Requirement",
        save: "Save",
        noQuestSelected: "Select a quest to edit",
        importStatsTitle: "Import Result",
        statDialoguesLabel: "Dialogues found:",
        statQuestsLabel: "Quests found:",
        statUnknownLabel: "Unrecognized:",
        importOk: "OK",
        back: "Back"
    },
    de: {
        appTitle: "Schmiede des Skalden v2.2",
        appSubtitle: "Dialog- & Quest-Editor · by OdinSons & Enotin",
        searchPlaceholder: "Suche...",
        importBtn: "Importieren",
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
        legendEnd: "Ende",
        paletteTitle: "Quests",
        propNodeTitle: "NPC-Dialog",
        labelNodeId: "Profil-ID:",
        labelNodeText: "NPC-Text:",
        propOptionsTitle: "Dialogoptionen",
        addNodeOption: "+ Option hinzufügen",
        propOptionTitle: "Spieleroption",
        labelOptionText: "Text:",
        labelIcon: "Symbol:",
        propCondTitle: "Bedingungen",
        addCondition: "+ Bedingung",
        propCmdTitle: "Befehle",
        addCommand: "+ Befehl",
        propQuestTitle: "Quest",
        labelAutocomplete: "Auto-Abschluss",
        labelQuestType: "Typ:",
        labelQuestName: "Name:",
        labelQuestDesc: "Beschreibung:",
        labelTargets: "Ziele",
        labelRewards: "Belohnungen",
        labelRequirements: "Anforderungen",
        labelCooldown: "Abklingzeit (Tage):",
        emptyStateText: "Wähle einen Knoten oder erstelle einen neuen",
        tabField: "Feld",
        tabCode: "Code",
        applyCode: "Änderungen übernehmen",
        copyCode: "Kopieren",
        downloadCode: "Datei herunterladen",
        codeHint: "Änderungen werden per 'Übernehmen'-Button angewendet",
        previewTitle: "Vorschau",
        condModalTitle: "Bedingung hinzufügen",
        cmdModalTitle: "Befehl hinzufügen",
        targetModalTitle: "Ziel hinzufügen",
        rewardModalTitle: "Belohnung hinzufügen",
        reqModalTitle: "Anforderung hinzufügen",
        save: "Speichern",
        noQuestSelected: "Wähle eine Quest zum Bearbeiten",
        importStatsTitle: "Importergebnis",
        statDialoguesLabel: "Dialoge gefunden:",
        statQuestsLabel: "Quests gefunden:",
        statUnknownLabel: "Nicht erkannt:",
        importOk: "OK",
        back: "Zurück"
    },
    es: {
        appTitle: "Forja del Escaldo v2.2",
        appSubtitle: "Editor de diálogos y misiones · by OdinSons & Enotin",
        searchPlaceholder: "Buscar...",
        importBtn: "Importar",
        export: "Exportar",
        validate: "Validar",
        addNode: "+ Diálogo",
        addQuest: "+ Misión",
        delete: "Eliminar",
        fitToScreen: "Ajustar",
        loadSample: "Ejemplo",
        hintText: "Arrastra el círculo de la opción → al nodo, misión o vacío",
        legendTransition: "Transición",
        legendQuestLink: "Enlace a misión",
        legendOtherQuest: "Dependencia de misión",
        legendEnd: "Fin",
        paletteTitle: "Misiones",
        propNodeTitle: "Diálogo del NPC",
        labelNodeId: "ID de perfil:",
        labelNodeText: "Texto del NPC:",
        propOptionsTitle: "Opciones del diálogo",
        addNodeOption: "+ Añadir opción",
        propOptionTitle: "Opción del jugador",
        labelOptionText: "Texto:",
        labelIcon: "Icono:",
        propCondTitle: "Condiciones",
        addCondition: "+ Condición",
        propCmdTitle: "Comandos",
        addCommand: "+ Comando",
        propQuestTitle: "Misión",
        labelAutocomplete: "Autocompletar",
        labelQuestType: "Tipo:",
        labelQuestName: "Nombre:",
        labelQuestDesc: "Descripción:",
        labelTargets: "Objetivos",
        labelRewards: "Recompensas",
        labelRequirements: "Requisitos",
        labelCooldown: "Enfriamiento (días):",
        emptyStateText: "Selecciona un nodo o crea uno nuevo",
        tabField: "Campo",
        tabCode: "Código",
        applyCode: "Aplicar cambios",
        copyCode: "Copiar",
        downloadCode: "Descargar archivo",
        codeHint: "Los cambios se aplican con el botón 'Aplicar'",
        previewTitle: "Vista previa",
        condModalTitle: "Añadir condición",
        cmdModalTitle: "Añadir comando",
        targetModalTitle: "Añadir objetivo",
        rewardModalTitle: "Añadir recompensa",
        reqModalTitle: "Añadir requisito",
        save: "Guardar",
        noQuestSelected: "Selecciona una misión para editar",
        importStatsTitle: "Resultado de importación",
        statDialoguesLabel: "Diálogos encontrados:",
        statQuestsLabel: "Misiones encontradas:",
        statUnknownLabel: "No reconocidos:",
        importOk: "OK",
        back: "Atrás"
    },
    fr: {
        appTitle: "Forge du Skalde v2.2",
        appSubtitle: "Éditeur de dialogues et quêtes · by OdinSons & Enotin",
        searchPlaceholder: "Rechercher...",
        importBtn: "Importer",
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
        legendEnd: "Fin",
        paletteTitle: "Quêtes",
        propNodeTitle: "Dialogue PNJ",
        labelNodeId: "ID du profil :",
        labelNodeText: "Texte du PNJ :",
        propOptionsTitle: "Options du dialogue",
        addNodeOption: "+ Ajouter option",
        propOptionTitle: "Option du joueur",
        labelOptionText: "Texte :",
        labelIcon: "Icône :",
        propCondTitle: "Conditions",
        addCondition: "+ Condition",
        propCmdTitle: "Commandes",
        addCommand: "+ Commande",
        propQuestTitle: "Quête",
        labelAutocomplete: "Auto-complétion",
        labelQuestType: "Type :",
        labelQuestName: "Nom :",
        labelQuestDesc: "Description :",
        labelTargets: "Objectifs",
        labelRewards: "Récompenses",
        labelRequirements: "Exigences",
        labelCooldown: "Recharge (jours) :",
        emptyStateText: "Sélectionnez un nœud ou créez-en un nouveau",
        tabField: "Champ",
        tabCode: "Code",
        applyCode: "Appliquer les modifications",
        copyCode: "Copier",
        downloadCode: "Télécharger le fichier",
        codeHint: "Les modifications sont appliquées via le bouton 'Appliquer'",
        previewTitle: "Aperçu",
        condModalTitle: "Ajouter condition",
        cmdModalTitle: "Ajouter commande",
        targetModalTitle: "Ajouter objectif",
        rewardModalTitle: "Ajouter récompense",
        reqModalTitle: "Ajouter exigence",
        save: "Enregistrer",
        noQuestSelected: "Sélectionnez une quête à modifier",
        importStatsTitle: "Résultat de l'import",
        statDialoguesLabel: "Dialogues trouvés :",
        statQuestsLabel: "Quêtes trouvées :",
        statUnknownLabel: "Non reconnus :",
        importOk: "OK",
        back: "Retour"
    },
    pl: {
        appTitle: "Kuźnia Skalda v2.2",
        appSubtitle: "Edytor dialogów i zadań · by OdinSons & Enotin",
        searchPlaceholder: "Szukaj...",
        importBtn: "Importuj",
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
        legendEnd: "Koniec",
        paletteTitle: "Zadania",
        propNodeTitle: "Dialog NPC",
        labelNodeId: "ID profilu:",
        labelNodeText: "Tekst NPC:",
        propOptionsTitle: "Opcje dialogu",
        addNodeOption: "+ Dodaj opcję",
        propOptionTitle: "Opcja gracza",
        labelOptionText: "Tekst:",
        labelIcon: "Ikona:",
        propCondTitle: "Warunki",
        addCondition: "+ Warunek",
        propCmdTitle: "Polecenia",
        addCommand: "+ Polecenie",
        propQuestTitle: "Zadanie",
        labelAutocomplete: "Auto-ukończenie",
        labelQuestType: "Typ:",
        labelQuestName: "Nazwa:",
        labelQuestDesc: "Opis:",
        labelTargets: "Cele",
        labelRewards: "Nagrody",
        labelRequirements: "Wymagania",
        labelCooldown: "Odnowienie (dni):",
        emptyStateText: "Wybierz węzeł lub utwórz nowy",
        tabField: "Pole",
        tabCode: "Kod",
        applyCode: "Zastosuj zmiany",
        copyCode: "Kopiuj",
        downloadCode: "Pobierz plik",
        codeHint: "Zmiany są stosowane przyciskiem 'Zastosuj'",
        previewTitle: "Podgląd",
        condModalTitle: "Dodaj warunek",
        cmdModalTitle: "Dodaj polecenie",
        targetModalTitle: "Dodaj cel",
        rewardModalTitle: "Dodaj nagrodę",
        reqModalTitle: "Dodaj wymóg",
        save: "Zapisz",
        noQuestSelected: "Wybierz zadanie do edycji",
        importStatsTitle: "Wynik importu",
        statDialoguesLabel: "Znalezione dialogi:",
        statQuestsLabel: "Znalezione zadania:",
        statUnknownLabel: "Nierozpoznane:",
        importOk: "OK",
        back: "Wstecz"
    },
    pt: {
        appTitle: "Forja do Escaldo v2.2",
        appSubtitle: "Editor de diálogos e missões · by OdinSons & Enotin",
        searchPlaceholder: "Pesquisar...",
        importBtn: "Importar",
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
        legendEnd: "Fim",
        paletteTitle: "Missões",
        propNodeTitle: "Diálogo do NPC",
        labelNodeId: "ID do perfil:",
        labelNodeText: "Texto do NPC:",
        propOptionsTitle: "Opções do diálogo",
        addNodeOption: "+ Adicionar opção",
        propOptionTitle: "Opção do jogador",
        labelOptionText: "Texto:",
        labelIcon: "Ícone:",
        propCondTitle: "Condições",
        addCondition: "+ Condição",
        propCmdTitle: "Comandos",
        addCommand: "+ Comando",
        propQuestTitle: "Missão",
        labelAutocomplete: "Auto-conclusão",
        labelQuestType: "Tipo:",
        labelQuestName: "Nome:",
        labelQuestDesc: "Descrição:",
        labelTargets: "Objetivos",
        labelRewards: "Recompensas",
        labelRequirements: "Requisitos",
        labelCooldown: "Recarga (dias):",
        emptyStateText: "Selecione um nó ou crie um novo",
        tabField: "Campo",
        tabCode: "Código",
        applyCode: "Aplicar alterações",
        copyCode: "Copiar",
        downloadCode: "Baixar arquivo",
        codeHint: "Alterações são aplicadas pelo botão 'Aplicar'",
        previewTitle: "Pré-visualização",
        condModalTitle: "Adicionar condição",
        cmdModalTitle: "Adicionar comando",
        targetModalTitle: "Adicionar objetivo",
        rewardModalTitle: "Adicionar recompensa",
        reqModalTitle: "Adicionar requisito",
        save: "Salvar",
        noQuestSelected: "Selecione uma missão para editar",
        importStatsTitle: "Resultado da importação",
        statDialoguesLabel: "Diálogos encontrados:",
        statQuestsLabel: "Missões encontradas:",
        statUnknownLabel: "Não reconhecidos:",
        importOk: "OK",
        back: "Voltar"
    },
    sv: {
        appTitle: "Skaldens Smedja v2.2",
        appSubtitle: "Dialog- & uppdragredigerare · by OdinSons & Enotin",
        searchPlaceholder: "Sök...",
        importBtn: "Importera",
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
        legendEnd: "Slut",
        paletteTitle: "Uppdrag",
        propNodeTitle: "NPC-dialog",
        labelNodeId: "Profil-ID:",
        labelNodeText: "NPC-text:",
        propOptionsTitle: "Dialogalternativ",
        addNodeOption: "+ Lägg till alternativ",
        propOptionTitle: "Spelaralternativ",
        labelOptionText: "Text:",
        labelIcon: "Ikon:",
        propCondTitle: "Villkor",
        addCondition: "+ Villkor",
        propCmdTitle: "Kommandon",
        addCommand: "+ Kommando",
        propQuestTitle: "Uppdrag",
        labelAutocomplete: "Autoslutförande",
        labelQuestType: "Typ:",
        labelQuestName: "Namn:",
        labelQuestDesc: "Beskrivning:",
        labelTargets: "Mål",
        labelRewards: "Belöningar",
        labelRequirements: "Krav",
        labelCooldown: "Nedkylning (dagar):",
        emptyStateText: "Välj en nod eller skapa en ny",
        tabField: "Fält",
        tabCode: "Kod",
        applyCode: "Tillämpa ändringar",
        copyCode: "Kopiera",
        downloadCode: "Ladda ner fil",
        codeHint: "Ändringar tillämpas via 'Tillämpa'-knappen",
        previewTitle: "Förhandsgranskning",
        condModalTitle: "Lägg till villkor",
        cmdModalTitle: "Lägg till kommando",
        targetModalTitle: "Lägg till mål",
        rewardModalTitle: "Lägg till belöning",
        reqModalTitle: "Lägg till krav",
        save: "Spara",
        noQuestSelected: "Välj ett uppdrag att redigera",
        importStatsTitle: "Importresultat",
        statDialoguesLabel: "Hittade dialoger:",
        statQuestsLabel: "Hittade uppdrag:",
        statUnknownLabel: "Okända:",
        importOk: "OK",
        back: "Tillbaka"
    },
    ja: {
        appTitle: "スカルドの鍛冶屋 v2.2",
        appSubtitle: "ダイアログ＆クエストエディタ · by OdinSons & Enotin",
        searchPlaceholder: "検索...",
        importBtn: "インポート",
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
        legendEnd: "終了",
        paletteTitle: "クエスト",
        propNodeTitle: "NPCダイアログ",
        labelNodeId: "プロフィールID:",
        labelNodeText: "NPCテキスト:",
        propOptionsTitle: "ダイアログオプション",
        addNodeOption: "+ オプションを追加",
        propOptionTitle: "プレイヤーオプション",
        labelOptionText: "テキスト:",
        labelIcon: "アイコン:",
        propCondTitle: "条件",
        addCondition: "+ 条件",
        propCmdTitle: "コマンド",
        addCommand: "+ コマンド",
        propQuestTitle: "クエスト",
        labelAutocomplete: "自動完了",
        labelQuestType: "タイプ:",
        labelQuestName: "名前:",
        labelQuestDesc: "説明:",
        labelTargets: "目標",
        labelRewards: "報酬",
        labelRequirements: "要件",
        labelCooldown: "クールダウン (日):",
        emptyStateText: "ノードを選択するか新規作成",
        tabField: "フィールド",
        tabCode: "コード",
        applyCode: "変更を適用",
        copyCode: "コピー",
        downloadCode: "ファイルをダウンロード",
        codeHint: "変更は「適用」ボタンで適用されます",
        previewTitle: "プレビュー",
        condModalTitle: "条件を追加",
        cmdModalTitle: "コマンドを追加",
        targetModalTitle: "目標を追加",
        rewardModalTitle: "報酬を追加",
        reqModalTitle: "要件を追加",
        save: "保存",
        noQuestSelected: "編集するクエストを選択",
        importStatsTitle: "インポート結果",
        statDialoguesLabel: "見つかったダイアログ:",
        statQuestsLabel: "見つかったクエスト:",
        statUnknownLabel: "認識できなかった:",
        importOk: "OK",
        back: "戻る"
    }
};

class DialogueEditor {
    constructor() {
        this.blocks = []; // единый массив блоков {type, id, data, comments}
        this.selectedBlock = null;
        this.selectedOption = null;
        
        this.currentZoom = 1;
        this.canvasOffset = { x: 0, y: 0 };
        this.isCanvasDragging = false;
        this.canvasStartPos = { x: 0, y: 0 };
        
        this.previewHistory = [];
        this.currentPreviewNode = null;
        
        this.isDrawingCurve = false;
        this.drawingFromOption = null;
        this.drawingTempPath = null;
        
        this.cfgFiles = {}; // filename -> {raw, generated}
        this.currentCfgFile = null;
        
        this.lang = localStorage.getItem('skald_lang') || 'ru';
        this.itemSelectorData = [];
        this.loadItemDataForPreview();
        
        this.optionIconSelector = null;
        this.targetPrefabSelector = null;
        
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
            'appTitle', 'appSubtitle', 'searchInput', 'importBtn',
            'exportBtn', 'validateBtn', 'previewBtn', 'addNodeBtn', 'addQuestBtn',
            'deleteBtn', 'zoomInBtn', 'zoomOutBtn', 'fitToScreenBtn', 'loadSampleBtn',
            'hintText', 'paletteTitle', 'questPalette', 'questPaletteList', 'toggleQuestPalette',
            'connectionLayer', 'nodeContainer', 'canvasContainer',
            'nodeProperties', 'optionProperties', 'questProperties', 'emptyState', 'emptyStateText',
            'propNodeTitle', 'labelNodeId', 'nodeId', 'labelNodeText', 'nodeText',
            'propOptionsTitle', 'nodeOptionsList', 'addNodeOptionBtn',
            'propOptionTitle', 'labelOptionText', 'optionText', 'optionIconSelector',
            'propCondTitle', 'conditionsList', 'addConditionBtn', 'propCmdTitle', 'commandsList', 'addCommandBtn',
            'propQuestTitle', 'questAutocomplete', 'labelAutocomplete', 'labelQuestType', 'questType',
            'labelQuestName', 'questName', 'labelQuestDesc', 'questDescription',
            'labelTargets', 'questTargetsList', 'addQuestTargetBtn',
            'labelRewards', 'questRewardsList', 'addQuestRewardBtn',
            'labelRequirements', 'questRequirementsList', 'addQuestRequirementBtn',
            'labelCooldown', 'questCooldown',
            'tabFieldBtn', 'tabCodeBtn', 'fileTabs', 'codeEditor', 'applyCodeBtn', 'copyCodeBtn', 'downloadCodeBtn', 'codeHint',
            'previewModal', 'previewContent', 'previewTitle',
            'importStatsModal', 'importStatsTitle', 'statDialoguesLabel', 'statDialoguesCount',
            'statQuestsLabel', 'statQuestsCount', 'statUnknownLabel', 'statUnknownCount', 'importStatsOkBtn',
            'conditionModal', 'conditionType', 'conditionParams', 'saveConditionBtn', 'condModalTitle',
            'commandModal', 'commandType', 'commandParams', 'saveCommandBtn', 'cmdModalTitle',
            'questTargetModal', 'targetPrefabSelector', 'targetAmount', 'targetLevel', 'saveQuestTargetBtn', 'targetModalTitle',
            'questRewardModal', 'rewardType', 'rewardPrefab', 'rewardAmount', 'rewardLevel', 'saveQuestRewardBtn', 'rewardModalTitle',
            'questRequirementModal', 'requirementType', 'requirementParams', 'saveQuestRequirementBtn', 'reqModalTitle',
            'dialogueFileInput', 'fileInput',
            'legendTransition', 'legendQuestLink', 'legendOtherQuest', 'legendEnd'
        ];
        ids.forEach(id => { this.els[id] = document.getElementById(id); });
    }
    
    initEventListeners() {
        this.els.addNodeBtn.addEventListener('click', () => this.addDialogueBlock());
        this.els.addQuestBtn.addEventListener('click', () => this.addQuestBlock());
        this.els.deleteBtn.addEventListener('click', () => this.deleteSelected());
        this.els.zoomInBtn.addEventListener('click', () => this.zoom(0.1));
        this.els.zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));
        this.els.fitToScreenBtn.addEventListener('click', () => this.fitToScreen());
        this.els.loadSampleBtn.addEventListener('click', () => this.loadSampleData());
        
        this.els.searchInput.addEventListener('input', (e) => this.searchBlocks(e.target.value));
        this.els.importBtn.addEventListener('click', () => this.els.fileInput.click());
        this.els.exportBtn.addEventListener('click', () => this.exportCurrentCfg());
        this.els.validateBtn.addEventListener('click', () => this.validateAll());
        this.els.previewBtn.addEventListener('click', () => this.showPreview());
        
        this.els.fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        
        // Node properties
        this.els.nodeId.addEventListener('change', (e) => this.updateBlockProperty('id', e.target.value));
        this.els.nodeText.addEventListener('input', (e) => this.updateBlockProperty('text', e.target.value));
        this.els.addNodeOptionBtn.addEventListener('click', () => this.addOptionToSelected());
        
        // Option properties
        this.els.optionText.addEventListener('input', (e) => this.updateOptionProperty('text', e.target.value));
        this.els.addConditionBtn.addEventListener('click', () => this.openModal('conditionModal'));
        this.els.addCommandBtn.addEventListener('click', () => this.openModal('commandModal'));
        
        // Quest properties
        this.els.questId.addEventListener('change', (e) => this.updateQuestProperty('id', e.target.value));
        this.els.questAutocomplete.addEventListener('change', (e) => this.updateQuestProperty('autocomplete', e.target.checked));
        this.els.questType.addEventListener('change', (e) => this.updateQuestProperty('questType', e.target.value));
        this.els.questName.addEventListener('input', (e) => this.updateQuestProperty('name', e.target.value));
        this.els.questDescription.addEventListener('input', (e) => this.updateQuestProperty('description', e.target.value));
        this.els.questCooldown.addEventListener('input', (e) => this.updateQuestProperty('cooldown', e.target.value));
        this.els.addQuestTargetBtn.addEventListener('click', () => this.openModal('questTargetModal'));
        this.els.addQuestRewardBtn.addEventListener('click', () => this.openModal('questRewardModal'));
        this.els.addQuestRequirementBtn.addEventListener('click', () => this.openModal('questRequirementModal'));
        
        // Modals
        this.els.conditionType.addEventListener('change', () => this.updateConditionParams());
        this.els.saveConditionBtn.addEventListener('click', () => this.saveCondition());
        this.els.commandType.addEventListener('change', () => this.updateCommandParams());
        this.els.saveCommandBtn.addEventListener('click', () => this.saveCommand());
        this.els.saveQuestTargetBtn.addEventListener('click', () => this.saveQuestTarget());
        this.els.saveQuestRewardBtn.addEventListener('click', () => this.saveQuestReward());
        this.els.requirementType.addEventListener('change', () => this.updateRequirementParams());
        this.els.saveQuestRequirementBtn.addEventListener('click', () => this.saveQuestRequirement());
        this.els.importStatsOkBtn.addEventListener('click', () => this.closeAllModals());
        
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
            if (e.key === 'Delete' && this.selectedBlock && !isTyping) this.deleteSelected();
        });
    }
    
    applyLanguage() {
        const t = translations[this.lang];
        if (!t) return;
        this.els.appTitle.textContent = t.appTitle;
        this.els.appSubtitle.textContent = t.appSubtitle;
        this.els.searchInput.placeholder = t.searchPlaceholder;
        this.els.importBtn.textContent = t.importBtn;
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
        this.els.labelIcon.textContent = t.labelIcon;
        this.els.propCondTitle.textContent = t.propCondTitle;
        this.els.addConditionBtn.textContent = t.addCondition;
        this.els.propCmdTitle.textContent = t.propCmdTitle;
        this.els.addCommandBtn.textContent = t.addCommand;
        this.els.propQuestTitle.textContent = t.propQuestTitle;
        this.els.labelAutocomplete.textContent = t.labelAutocomplete;
        this.els.labelQuestType.textContent = t.labelQuestType;
        this.els.labelQuestName.textContent = t.labelQuestName;
        this.els.labelQuestDesc.textContent = t.labelQuestDesc;
        this.els.labelTargets.textContent = t.labelTargets;
        this.els.labelRewards.textContent = t.labelRewards;
        this.els.labelRequirements.textContent = t.labelRequirements;
        this.els.labelCooldown.textContent = t.labelCooldown;
        this.els.emptyStateText.textContent = t.emptyStateText;
        this.els.tabFieldBtn.textContent = t.tabField;
        this.els.tabCodeBtn.textContent = t.tabCode;
        this.els.applyCodeBtn.textContent = t.applyCode;
        this.els.copyCodeBtn.textContent = t.copyCode;
        this.els.downloadCodeBtn.textContent = t.downloadCode;
        this.els.codeHint.textContent = t.codeHint;
        this.els.previewTitle.textContent = t.previewTitle;
        this.els.importStatsTitle.textContent = t.importStatsTitle;
        this.els.statDialoguesLabel.textContent = t.statDialoguesLabel;
        this.els.statQuestsLabel.textContent = t.statQuestsLabel;
        this.els.statUnknownLabel.textContent = t.statUnknownLabel;
        this.els.importStatsOkBtn.textContent = t.importOk;
        this.els.condModalTitle.textContent = t.condModalTitle;
        this.els.cmdModalTitle.textContent = t.cmdModalTitle;
        this.els.targetModalTitle.textContent = t.targetModalTitle;
        this.els.rewardModalTitle.textContent = t.rewardModalTitle;
        this.els.reqModalTitle.textContent = t.reqModalTitle;
        if (this.els.legendTransition) this.els.legendTransition.textContent = t.legendTransition;
        if (this.els.legendQuestLink) this.els.legendQuestLink.textContent = t.legendQuestLink;
        if (this.els.legendOtherQuest) this.els.legendOtherQuest.textContent = t.legendOtherQuest;
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
        const fileData = this.cfgFiles[filename];
        if (!fileData) return;
        // Показываем raw content если есть, иначе generated
        this.els.codeEditor.value = fileData.raw || fileData.generated || '';
    }
    
    applyCodeFromEditor() {
        if (!this.currentCfgFile) return;
        const content = this.els.codeEditor.value;
        this.cfgFiles[this.currentCfgFile].generated = content;
        // Парсим и обновляем блоки
        this.parseUnifiedCfg(content, true);
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
            const fileData = this.cfgFiles[this.currentCfgFile];
            const content = fileData.raw || fileData.generated || '';
            this.downloadFile(this.currentCfgFile, content);
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
            case 'select-block': this.selectBlock(data.id, data.type); break;
            case 'select-option': this.selectOption(data.optionId); break;
            case 'navigate': this.previewNavigate(data.target); break;
            case 'preview-go-back': this.previewGoBack(); break;
            case 'delete-option': this.deleteOptionFromBlock(data.optionId); break;
            case 'delete-condition': this.removeCondition(parseInt(data.index)); break;
            case 'delete-command': this.removeCommand(parseInt(data.index)); break;
            case 'delete-quest-target': this.deleteQuestTarget(parseInt(data.index)); break;
            case 'delete-quest-reward': this.deleteQuestReward(parseInt(data.index)); break;
            case 'delete-quest-req': this.deleteQuestRequirement(parseInt(data.index)); break;
            case 'open-quest-link': this.openQuestLink(data.questId); break;
        }
    }
    
    openQuestLink(questId) {
        const block = this.blocks.find(b => b.type === 'quest' && b.id === questId);
        if (block) {
            this.selectBlock(questId, 'quest');
        }
    }
    
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('open');
            if (id === 'conditionModal') this.updateConditionParams();
            if (id === 'commandModal') this.updateCommandParams();
            if (id === 'questRequirementModal') this.updateRequirementParams();
            if (id === 'questTargetModal') {
                if (this.targetPrefabSelector) this.targetPrefabSelector.container.innerHTML = '';
                this.targetPrefabSelector = new ItemSelector(this.els.targetPrefabSelector, '');
            }
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    }
    
    addDialogueBlock(id = null, x = null, y = null) {
        const blockId = id || `dialogue_${Date.now()}`;
        if (this.blocks.some(b => b.id === blockId)) return null;
        const offset = this.blocks.filter(b => b.type === 'dialogue').length * 50;
        const block = {
            type: 'dialogue',
            id: blockId,
            x: x !== null ? x : 100 + offset,
            y: y !== null ? y : 100 + offset,
            data: {
                text: 'New dialogue...',
                options: []
            },
            comments: []
        };
        this.blocks.push(block);
        this.render();
        this.selectBlock(blockId, 'dialogue');
        this.syncCodeView();
        return block;
    }
    
    addQuestBlock(id = null, x = null, y = null) {
        const blockId = id || `quest_${Date.now()}`;
        if (this.blocks.some(b => b.id === blockId)) return null;
        const offset = this.blocks.filter(b => b.type === 'quest').length * 50;
        const block = {
            type: 'quest',
            id: blockId,
            x: x !== null ? x : 400 + offset,
            y: y !== null ? y : 100 + offset,
            data: {
                questType: 'Kill',
                name: 'New Quest',
                description: 'Description...',
                targets: [],
                rewards: [],
                requirements: [],
                cooldown: '',
                autocomplete: false
            },
            comments: []
        };
        this.blocks.push(block);
        this.render();
        this.selectBlock(blockId, 'quest');
        this.syncCodeView();
        return block;
    }
    
    selectBlock(id, type) {
        this.selectedBlock = { id, type };
        this.selectedOption = null;
        
        document.querySelectorAll('.dialogue-node, .quest-node').forEach(el => {
            el.classList.toggle('selected', el.dataset.blockId === id);
        });
        
        if (id) {
            const block = this.blocks.find(b => b.id === id);
            if (!block) return;
            
            if (block.type === 'dialogue') {
                this.els.nodeProperties.style.display = 'block';
                this.els.optionProperties.style.display = 'none';
                this.els.questProperties.style.display = 'none';
                this.els.emptyState.style.display = 'none';
                this.els.nodeId.value = block.id;
                this.els.nodeText.value = block.data.text;
                this.renderNodeOptionsList();
            } else if (block.type === 'quest') {
                this.els.nodeProperties.style.display = 'none';
                this.els.optionProperties.style.display = 'none';
                this.els.questProperties.style.display = 'block';
                this.els.emptyState.style.display = 'none';
                this.els.questId.value = block.id;
                this.els.questAutocomplete.checked = block.data.autocomplete;
                this.els.questType.value = block.data.questType;
                this.els.questName.value = block.data.name;
                this.els.questDescription.value = block.data.description;
                this.els.questCooldown.value = block.data.cooldown;
                this.renderQuestTargetsList();
                this.renderQuestRewardsList();
                this.renderQuestRequirementsList();
            }
        }
    }
    
    selectOption(optionId) {
        this.selectedOption = optionId;
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block || block.type !== 'dialogue') return;
        const option = block.data.options.find(o => o.id === optionId);
        if (!option) return;
        
        this.els.nodeProperties.style.display = 'none';
        this.els.optionProperties.style.display = 'block';
        this.els.questProperties.style.display = 'none';
        
        this.els.optionText.value = option.text || '';
        this.renderConditionsList(option.conditions);
        this.renderCommandsList(option.commands);
        this.renderNodeOptionsList();
        
        if (this.optionIconSelector) this.optionIconSelector.container.innerHTML = '';
        this.optionIconSelector = new ItemSelector(this.els.optionIconSelector, option.icon || '');
        this.optionIconSelector.input.addEventListener('change', (e) => {
            option.icon = e.target.value.trim();
            this.render();
            this.syncCodeView();
        });
    }
    
    addOptionToSelected() {
        if (!this.selectedBlock || this.selectedBlock.type !== 'dialogue') { alert('Select a dialogue first!'); return; }
        this.addOptionToBlock(this.selectedBlock.id);
    }
    
    addOptionToBlock(blockId, text = 'New option') {
        const block = this.blocks.find(b => b.id === blockId);
        if (!block || block.type !== 'dialogue') return null;
        const option = {
            id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            text: text,
            transition: '',
            questLink: '',
            icon: '',
            conditions: [],
            commands: []
        };
        block.data.options.push(option);
        this.render();
        this.selectOption(option.id);
        this.syncCodeView();
        return option;
    }
    
    deleteOptionFromBlock(optionId) {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        block.data.options = block.data.options.filter(o => o.id !== optionId);
        if (this.selectedOption === optionId) {
            this.selectedOption = null;
            this.els.optionProperties.style.display = 'none';
            this.els.nodeProperties.style.display = 'block';
        }
        this.render();
        this.syncCodeView();
    }
    
    updateBlockProperty(property, value) {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        if (property === 'id') {
            if (value && value !== block.id && !this.blocks.some(b => b.id === value)) {
                block.id = value;
                this.selectedBlock.id = value;
                this.render();
            }
        } else if (property === 'text') {
            block.data.text = value;
            this.render();
        }
        this.syncCodeView();
    }
    
    updateOptionProperty(property, value) {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        const option = block.data.options.find(o => o.id === this.selectedOption);
        if (!option) return;
        if (property === 'transition' && value) {
            option.questLink = '';
        } else if (property === 'questLink' && value) {
            option.transition = '';
        }
        option[property] = value;
        this.render();
        this.syncCodeView();
    }
    
    updateQuestProperty(property, value) {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        if (property === 'id') {
            if (value && value !== block.id && !this.blocks.some(b => b.id === value)) {
                block.id = value;
                this.selectedBlock.id = value;
                this.els.questId.value = value;
                this.render();
            }
        } else {
            block.data[property] = value;
            this.render();
        }
        this.syncCodeView();
    }
    
    deleteSelected() {
        if (this.selectedOption) {
            this.deleteOptionFromBlock(this.selectedOption);
        } else if (this.selectedBlock) {
            // Удаляем связи
            this.blocks.forEach(b => {
                if (b.type === 'dialogue') {
                    b.data.options.forEach(opt => {
                        if (opt.transition === this.selectedBlock.id) opt.transition = '';
                        if (opt.questLink === this.selectedBlock.id) opt.questLink = '';
                    });
                } else if (b.type === 'quest') {
                    b.data.requirements = b.data.requirements.filter(r => !(r.type === 'OtherQuest' && r.param === this.selectedBlock.id));
                }
            });
            this.blocks = this.blocks.filter(b => b.id !== this.selectedBlock.id);
            this.selectedBlock = null;
            this.selectedOption = null;
            this.els.nodeProperties.style.display = 'none';
            this.els.optionProperties.style.display = 'none';
            this.els.questProperties.style.display = 'none';
            this.els.emptyState.style.display = 'flex';
            this.render();
            this.syncCodeView();
        }
    }
    
    render() { this.renderBlocks(); this.renderQuestPalette(); }
    
    renderBlocks() {
        const container = this.els.nodeContainer;
        container.innerHTML = '';
        this.blocks.forEach(block => {
            const el = block.type === 'dialogue' ? this.createDialogueElement(block) : this.createQuestElement(block);
            container.appendChild(el);
        });
        requestAnimationFrame(() => this.renderConnections());
    }
    
    createDialogueElement(block) {
        const div = document.createElement('div');
        div.className = `dialogue-node ${this.selectedBlock && this.selectedBlock.id === block.id ? 'selected' : ''}`;
        div.dataset.blockId = block.id;
        div.dataset.action = 'select-block';
        div.dataset.id = block.id;
        div.dataset.type = 'dialogue';
        div.style.left = `${block.x}px`;
        div.style.top = `${block.y}px`;
        
        const previewText = this.escapeHtml(block.data.text.length > 80 ? block.data.text.substring(0, 80) + '...' : block.data.text);
        
        div.innerHTML = `
            <div class="node-header">
                <span class="node-header-text">📝 ${this.escapeHtml(block.id)}</span>
            </div>
            <div class="node-content">
                <div class="node-text">${previewText}</div>
                ${block.data.options.map((opt) => {
                    const handleClass = this.getOptionHandleClass(opt);
                    const iconHtml = opt.icon ? this.getIconHtml(opt.icon, 16) : '';
                    return `
                    <div class="option ${this.selectedOption === opt.id ? 'selected' : ''} ${this.getOptionClass(opt)}" 
                         data-action="select-option" 
                         data-option-id="${opt.id}">
                        ${iconHtml}
                        <span class="option-text">${this.escapeHtml(opt.text.length > 25 ? opt.text.substring(0, 25) + '...' : opt.text)}</span>
                        <div class="option-draw-handle ${handleClass}" 
                             data-draw-handle 
                             data-block-id="${block.id}" 
                             data-option-id="${opt.id}"></div>
                    </div>
                `;
                }).join('')}
            </div>
        `;
        this.setupNodeDrag(div, block);
        this.setupDrawHandles(div, block);
        return div;
    }
    
    createQuestElement(block) {
        const div = document.createElement('div');
        div.className = `quest-node ${this.selectedBlock && this.selectedBlock.id === block.id ? 'selected' : ''}`;
        div.dataset.blockId = block.id;
        div.dataset.action = 'select-block';
        div.dataset.id = block.id;
        div.dataset.type = 'quest';
        div.style.left = `${block.x}px`;
        div.style.top = `${block.y}px`;
        
        const targetsText = block.data.targets.map(t => `${t.prefab} x${t.amount}`).join(', ');
        const rewardsText = block.data.rewards.map(r => `${r.type}: ${r.prefab} x${r.amount}`).join(', ');
        
        div.innerHTML = `
            <div class="node-header">
                <span class="node-header-text">📜 ${this.escapeHtml(block.id)}${block.data.autocomplete ? ' ★' : ''}</span>
            </div>
            <div class="node-content">
                <div class="quest-node-info">
                    <div class="quest-type">${block.data.questType}</div>
                    <div class="quest-name">${this.escapeHtml(block.data.name)}</div>
                    ${targetsText ? `<div class="quest-targets">🎯 ${this.escapeHtml(targetsText)}</div>` : ''}
                    ${rewardsText ? `<div class="quest-rewards">🎁 ${this.escapeHtml(rewardsText)}</div>` : ''}
                </div>
            </div>
        `;
        this.setupNodeDrag(div, block);
        return div;
    }
    
    getOptionClass(opt) {
        if (opt.conditions.length > 0) return 'has-conditions';
        if (opt.commands.length > 0) return 'has-commands';
        if (opt.transition || opt.questLink) return 'has-transition';
        return '';
    }
    
    getOptionHandleClass(opt) {
        if (opt.conditions.length > 0) return 'has-conditions';
        if (opt.commands.length > 0) return 'has-commands';
        if (opt.transition || opt.questLink) return 'has-transition';
        return '';
    }
    
    getIconHtml(iconId, size = 16) {
        const itemData = this.itemSelectorData.find(i => i.id === iconId);
        const iconUrl = itemData ? `https://raw.githubusercontent.com/EnotinMax/skald/main/icons/${itemData.icon}` : 'https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png';
        return `<img src="${iconUrl}" class="option-icon" style="width: ${size}px; height: ${size}px;" alt="${iconId}" title="${iconId}" onerror="this.src='https://raw.githubusercontent.com/EnotinMax/skald/main/icons/unknown.png'">`;
    }
    
    setupNodeDrag(element, block) {
        let isDragging = false;
        let startX = 0, startY = 0;
        let startBlockX = 0, startBlockY = 0;
        const onMouseDown = (e) => {
            if (e.target.closest('[data-draw-handle]') || e.target.closest('button') || e.target.closest('.option') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            this.selectBlock(block.id, block.type);
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startBlockX = block.x;
            startBlockY = block.y;
            e.stopPropagation();
            e.preventDefault();
        };
        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = (e.clientX - startX) / this.currentZoom;
            const dy = (e.clientY - startY) / this.currentZoom;
            block.x = startBlockX + dx;
            block.y = startBlockY + dy;
            element.style.left = `${block.x}px`;
            element.style.top = `${block.y}px`;
            this.renderConnections();
        };
        const onMouseUp = () => { isDragging = false; };
        element.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }
    
    setupDrawHandles(element, block) {
        const handles = element.querySelectorAll('[data-draw-handle]');
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.startDrawing(e, block.id, handle.dataset.optionId);
            });
        });
    }
    
    startDrawing(e, blockId, optionId) {
        this.isDrawingCurve = true;
        this.drawingFromOption = { blockId, optionId };
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
        const block = this.blocks.find(b => b.id === this.drawingFromOption.blockId);
        if (!block) { this.cancelDrawing(); return; }
        const option = block.data.options.find(o => o.id === this.drawingFromOption.optionId);
        if (!option) { this.cancelDrawing(); return; }
        
        if (target.type === 'dialogue') {
            option.transition = target.id;
            option.questLink = '';
        } else if (target.type === 'quest') {
            option.questLink = target.id;
            option.transition = '';
        } else if (target.type === 'quest-dependency') {
            // Квест -> Квест: добавляем OtherQuest в целевой квест
            const targetBlock = this.blocks.find(b => b.id === target.id);
            if (targetBlock && targetBlock.type === 'quest') {
                if (!targetBlock.data.requirements.some(r => r.type === 'OtherQuest' && r.param === block.id)) {
                    targetBlock.data.requirements.push({ type: 'OtherQuest', param: block.id });
                }
            }
        } else {
            option.transition = '';
            option.questLink = '';
        }
        this.cancelDrawing();
        this.render();
        this.syncCodeView();
        if (this.selectedOption === option.id) {
            this.selectOption(option.id);
        }
    }
    
    findDrawTarget(e) {
        const nodeEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-block-id]');
        if (nodeEl && nodeEl.dataset.blockId !== this.drawingFromOption.blockId) {
            return { type: nodeEl.dataset.type, id: nodeEl.dataset.blockId };
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
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block || block.type !== 'dialogue') return;
        this.els.nodeOptionsList.innerHTML = block.data.options.map((opt, i) => `
            <div class="option-list-item ${this.selectedOption === opt.id ? 'selected' : ''}" 
                 data-action="select-option" 
                 data-option-id="${opt.id}">
                <span class="option-list-text">${i + 1}. ${this.escapeHtml(opt.text)}</span>
                <div class="option-list-buttons">
                    <button class="option-list-btn danger" data-action="delete-option" data-option-id="${opt.id}">×</button>
                </div>
            </div>
        `).join('');
    }
    
    renderQuestTargetsList() {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        this.els.questTargetsList.innerHTML = block.data.targets.map((t, i) => `
            <div class="quest-target-item">
                <span>${this.escapeHtml(t.prefab)} x${t.amount}${t.level ? `, lvl ${t.level}` : ''}</span>
                <button data-action="delete-quest-target" data-index="${i}">×</button>
            </div>
        `).join('');
    }
    
    renderQuestRewardsList() {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        this.els.questRewardsList.innerHTML = block.data.rewards.map((r, i) => `
            <div class="quest-reward-item">
                <span>${r.type}: ${this.escapeHtml(r.prefab)} x${r.amount}${r.level ? `, lvl ${r.level}` : ''}</span>
                <button data-action="delete-quest-reward" data-index="${i}">×</button>
            </div>
        `).join('');
    }
    
    renderQuestRequirementsList() {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        this.els.questRequirementsList.innerHTML = block.data.requirements.map((r, i) => `
            <div class="quest-requirement-item">
                <span>${r.type}: ${this.escapeHtml(r.param)}</span>
                <button data-action="delete-quest-req" data-index="${i}">×</button>
            </div>
        `).join('');
    }
    
    renderConnections() {
        const svg = this.els.connectionLayer;
        svg.querySelectorAll('path:not([stroke-dasharray="8 4"]), .end-cloud-group, .connection-dot').forEach(el => el.remove());
        
        this.blocks.forEach(block => {
            if (block.type === 'dialogue') {
                const nodeEl = this.els.nodeContainer.querySelector(`[data-block-id="${block.id}"][data-type="dialogue"]`);
                if (!nodeEl) return;
                block.data.options.forEach((opt) => {
                    const optionEl = nodeEl.querySelector(`[data-option-id="${opt.id}"]`);
                    if (!optionEl) return;
                    const handle = optionEl.querySelector('[data-draw-handle]');
                    if (!handle) return;
                    const handleRect = handle.getBoundingClientRect();
                    const containerRect = this.els.canvasContainer.getBoundingClientRect();
                    const sx = (handleRect.right - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                    const sy = (handleRect.top + handleRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                    
                    if (opt.transition) {
                        const targetEl = this.els.nodeContainer.querySelector(`[data-block-id="${opt.transition}"]`);
                        if (!targetEl) return;
                        const tRect = targetEl.getBoundingClientRect();
                        const tx = (tRect.left - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                        const ty = (tRect.top + tRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                        this.drawConnection(svg, sx, sy, tx, ty, '#3498db', 'blue');
                    } else if (opt.questLink) {
                        const targetEl = this.els.nodeContainer.querySelector(`[data-block-id="${opt.questLink}"]`);
                        if (!targetEl) return;
                        const tRect = targetEl.getBoundingClientRect();
                        const tx = (tRect.left - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                        const ty = (tRect.top + tRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                        this.drawConnection(svg, sx, sy, tx, ty, '#f39c12', 'orange');
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
                        svg.appendChild(path);
                        this.renderEndCloud(endX, endY, svg);
                    }
                });
            } else if (block.type === 'quest') {
                // Рисуем зависимости OtherQuest
                block.data.requirements.forEach(req => {
                    if (req.type === 'OtherQuest') {
                        const sourceBlock = this.blocks.find(b => b.id === req.param);
                        if (!sourceBlock) return;
                        const sourceEl = this.els.nodeContainer.querySelector(`[data-block-id="${sourceBlock.id}"]`);
                        const targetEl = this.els.nodeContainer.querySelector(`[data-block-id="${block.id}"]`);
                        if (!sourceEl || !targetEl) return;
                        const sRect = sourceEl.getBoundingClientRect();
                        const tRect = targetEl.getBoundingClientRect();
                        const containerRect = this.els.canvasContainer.getBoundingClientRect();
                        const sx = (sRect.right - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                        const sy = (sRect.top + sRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                        const tx = (tRect.left - containerRect.left - this.canvasOffset.x) / this.currentZoom;
                        const ty = (tRect.top + tRect.height / 2 - containerRect.top - this.canvasOffset.y) / this.currentZoom;
                        this.drawConnection(svg, sx, sy, tx, ty, '#27ae60', 'green', true);
                    }
                });
            }
        });
    }
    
    drawConnection(svg, sx, sy, tx, ty, color, markerId, dashed = false) {
        const pathD = this.getCurvePath(sx, sy, tx, ty);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2.5');
        if (dashed) path.setAttribute('stroke-dasharray', '6 4');
        path.setAttribute('marker-end', `url(#arrowhead-${markerId})`);
        path.setAttribute('opacity', '0.85');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('class', 'connection-dot');
        dot.setAttribute('cx', sx);
        dot.setAttribute('cy', sy);
        dot.setAttribute('r', '4');
        dot.setAttribute('fill', color);
        dot.setAttribute('stroke', '#fff');
        dot.setAttribute('stroke-width', '1');
        svg.appendChild(dot);
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
            return `M ${sx} ${sy} C ${sx + loopOffset} ${sy}, ${sx + loopOffset} ${midY}, ${(sx + tx) / 2} ${midY} S ${tx - loopOffset} ${ty}, ${tx} ${ty}`;
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
        this.els.questPaletteList.innerHTML = this.blocks.filter(b => b.type === 'quest').map(q => `
            <div class="quest-palette-item" data-block-id="${q.id}">
                <div class="quest-palette-item-name">${this.escapeHtml(q.data.name)}</div>
                <div class="quest-palette-item-id">${this.escapeHtml(q.id)}</div>
            </div>
        `).join('');
    }
    
    startCanvasDrag(e) {
        if (e.target.closest('.dialogue-node') || e.target.closest('.quest-node') || e.target.closest('.quest-palette') || e.target.closest('[data-draw-handle]')) return;
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
        if (!this.selectedBlock || this.selectedBlock.type !== 'dialogue') { alert('Select a dialogue first'); return; }
        this.previewHistory = [];
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        this.currentPreviewNode = block;
        this.els.previewContent.innerHTML = this.generatePreview(block, true);
        this.openModal('previewModal');
    }
    
    generatePreview(block, isRoot = false) {
        const processedText = this.processTextForPreview(block.data.text);
        let html = '';
        if (!isRoot) {
            html += `<div class="preview-back"><button data-action="preview-go-back">← ${translations[this.lang].back}</button></div>`;
        }
        html += `
            <div class="preview-profile">[ ${this.escapeHtml(block.id)} ]</div>
            <div class="preview-npc-text">${processedText}</div>
            <div class="preview-options">
        `;
        block.data.options.forEach((option, index) => {
            const processedOptionText = this.processTextForPreview(option.text);
            let transitionText = '';
            let onClickAttr = '';
            if (option.transition) {
                transitionText = `→ ${this.escapeHtml(option.transition)}`;
                onClickAttr = `data-action="navigate" data-target="${this.escapeHtml(option.transition)}"`;
            } else if (option.questLink) {
                const quest = this.blocks.find(b => b.id === option.questLink);
                transitionText = `📜 ${quest ? this.escapeHtml(quest.data.name) : option.questLink}`;
                onClickAttr = '';
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
        const targetBlock = this.blocks.find(b => b.id === nodeId);
        if (!targetBlock) return;
        this.previewHistory.push(this.currentPreviewNode);
        this.currentPreviewNode = targetBlock;
        this.els.previewContent.innerHTML = this.generatePreview(targetBlock, false);
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
        this.renderParamInputs(this.els.requirementParams, this.getRequirementParams(this.els.requirementType.value));
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
    
    getRequirementParams(type) {
        const map = {
            'Skill': ['SkillName', 'MinLevel'],
            'OtherQuest': ['QuestID'],
            'GlobalKey': ['KeyName'],
            'EpicMMO_Level': ['Level'],
            'HasItem': ['ItemPrefab'],
            'NotFinished': ['QuestID'],
            'IsVIP': [],
            'MH_Level': ['Level'],
            'Time': ['Seconds'],
            'HasAchievement': ['AchievementID'],
            'CustomValueMore': ['ValueName', 'Value'],
            'CustomValueLess': ['ValueName', 'Value']
        };
        return map[type] || [];
    }
    
    saveCondition() {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        const option = block.data.options.find(o => o.id === this.selectedOption);
        if (!option) return;
        const type = this.els.conditionType.value;
        const params = Array.from(this.els.conditionParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v);
        option.conditions.push({ type, params });
        this.renderConditionsList(option.conditions);
        this.closeAllModals();
        this.render();
        this.syncCodeView();
    }
    
    saveCommand() {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        const option = block.data.options.find(o => o.id === this.selectedOption);
        if (!option) return;
        const type = this.els.commandType.value;
        const params = Array.from(this.els.commandParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v);
        option.commands.push({ type, params });
        this.renderCommandsList(option.commands);
        this.closeAllModals();
        this.render();
        this.syncCodeView();
    }
    
    saveQuestTarget() {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        const prefab = this.targetPrefabSelector ? this.targetPrefabSelector.input.value.trim() : '';
        if (!prefab) { alert('Enter prefab'); return; }
        block.data.targets.push({ prefab, amount: this.els.targetAmount.value || '1', level: this.els.targetLevel.value || '' });
        this.closeAllModals();
        this.renderQuestTargetsList();
        this.syncCodeView();
    }
    
    saveQuestReward() {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        const prefab = this.els.rewardPrefab.value.trim();
        if (!prefab) { alert('Enter prefab'); return; }
        block.data.rewards.push({ 
            type: this.els.rewardType.value, 
            prefab, 
            amount: this.els.rewardAmount.value || '1',
            level: this.els.rewardLevel.value || ''
        });
        this.closeAllModals();
        this.renderQuestRewardsList();
        this.syncCodeView();
    }
    
    saveQuestRequirement() {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        const type = this.els.requirementType.value;
        const params = Array.from(this.els.requirementParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v);
        const param = params.join(', ');
        block.data.requirements.push({ type, param });
        this.closeAllModals();
        this.renderQuestRequirementsList();
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
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        const option = block.data.options.find(o => o.id === this.selectedOption);
        if (option) { option.conditions.splice(index, 1); this.renderConditionsList(option.conditions); this.syncCodeView(); }
    }
    
    removeCommand(index) {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (!block) return;
        const option = block.data.options.find(o => o.id === this.selectedOption);
        if (option) { option.commands.splice(index, 1); this.renderCommandsList(option.commands); this.syncCodeView(); }
    }
    
    deleteQuestTarget(index) {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (block) { block.data.targets.splice(index, 1); this.renderQuestTargetsList(); this.syncCodeView(); }
    }
    
    deleteQuestReward(index) {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (block) { block.data.rewards.splice(index, 1); this.renderQuestRewardsList(); this.syncCodeView(); }
    }
    
    deleteQuestRequirement(index) {
        const block = this.blocks.find(b => b.id === this.selectedBlock.id);
        if (block) { block.data.requirements.splice(index, 1); this.renderQuestRequirementsList(); this.syncCodeView(); }
    }
    
    // === УМНЫЙ ПАРСЕР ===
    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            const stats = this.parseUnifiedCfg(content, false);
            this.cfgFiles[file.name] = { raw: content, generated: this.generateCfgFromData() };
            this.currentCfgFile = file.name;
            this.renderCodeTabs();
            this.showCodeFile(file.name);
            this.switchTab('tabField');
            this.showImportStats(stats);
        };
        reader.readAsText(file);
        e.target.value = '';
    }
    
    parseUnifiedCfg(content, keepExisting = false) {
        if (!keepExisting) this.blocks = [];
        
        const stats = { dialogues: 0, quests: 0, unknown: 0 };
        
        // Разбиваем на блоки по [ID]
        const blockRegex = /\[([^\]=]+)(?:=autocomplete)?\]/g;
        let match;
        const blocks = [];
        let lastIndex = 0;
        
        while ((match = blockRegex.exec(content)) !== null) {
            const blockId = match[1].trim();
            const isAutocomplete = match[0].includes('=autocomplete');
            const blockStart = match.index;
            const blockContent = content.substring(blockStart);
            blocks.push({ id: blockId, content: blockContent, autocomplete: isAutocomplete });
        }
        
        blocks.forEach(block => {
            const lines = block.content.split('\n');
            const headerComments = [];
            let dataStartIndex = 0;
            
            // Собираем комментарии до заголовка
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('#')) {
                    headerComments.push(line);
                } else if (line === '') {
                    // пропускаем
                } else {
                    dataStartIndex = i;
                    break;
                }
            }
            
            // Определяем тип блока
            const firstDataLine = lines[dataStartIndex]?.trim() || '';
            const questTypes = ['Kill', 'Collect', 'Harvest', 'Craft', 'Talk', 'Build', 'Move'];
            
            let blockType = 'unknown';
            if (block.autocomplete || questTypes.includes(firstDataLine)) {
                blockType = 'quest';
            } else if (lines.some(l => l.trim().startsWith('Text:'))) {
                blockType = 'dialogue';
            }
            
            if (blockType === 'quest') {
                const questData = this.parseQuestBlock(lines, dataStartIndex, block.autocomplete);
                this.blocks.push({
                    type: 'quest',
                    id: block.id,
                    data: questData,
                    comments: headerComments,
                    x: 400 + this.blocks.filter(b => b.type === 'quest').length * 50,
                    y: 100
                });
                stats.quests++;
            } else if (blockType === 'dialogue') {
                const dialogueData = this.parseDialogueBlock(lines, dataStartIndex);
                this.blocks.push({
                    type: 'dialogue',
                    id: block.id,
                    data: dialogueData,
                    comments: headerComments,
                    x: 100 + this.blocks.filter(b => b.type === 'dialogue').length * 50,
                    y: 100
                });
                stats.dialogues++;
            } else {
                stats.unknown++;
            }
        });
        
        this.render();
        return stats;
    }
    
    parseDialogueBlock(lines, startIndex) {
        const data = { text: '', options: [] };
        let i = startIndex;
        const textLines = [];
        
        // Читаем текст NPC до первой строки Text:
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line.startsWith('Text:')) break;
            if (line !== '' && !line.startsWith('#')) {
                textLines.push(line);
            }
            i++;
        }
        data.text = textLines.join('\n');
        
        // Читаем опции
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line.startsWith('Text:')) {
                this.parseOptionLine(data, line);
            }
            i++;
        }
        
        return data;
    }
    
    parseOptionLine(data, line) {
        const parts = line.split('|').map(p => p.trim());
        const textPart = parts.find(p => p.startsWith('Text:'));
        if (!textPart) return;
        
        const option = {
            id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            text: textPart.substring(5).trim(),
            transition: '',
            questLink: '',
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
                const cmdStr = part.substring(8).trim();
                // Проверяем, не является ли это OpenUI, Quests, ID
                const openUIMatch = cmdStr.match(/^OpenUI,\s*Quests,\s*(.+)$/i);
                if (openUIMatch) {
                    option.questLink = openUIMatch[1].trim();
                } else {
                    this.parseCommand(option, cmdStr);
                }
            }
        });
        
        data.options.push(option);
    }
    
    parseCondition(option, str) {
        const parts = str.split(',').map(p => p.trim());
        option.conditions.push({ type: parts[0], params: parts.slice(1) });
    }
    
    parseCommand(option, str) {
        const parts = str.split(',').map(p => p.trim());
        option.commands.push({ type: parts[0], params: parts.slice(1) });
    }
    
    parseQuestBlock(lines, startIndex, autocomplete = false) {
        const data = {
            questType: '',
            name: '',
            description: '',
            targets: [],
            rewards: [],
            requirements: [],
            cooldown: '',
            autocomplete: autocomplete
        };
        
        let i = startIndex;
        const questTypes = ['Kill', 'Collect', 'Harvest', 'Craft', 'Talk', 'Build', 'Move'];
        
        // 1. Тип квеста
        while (i < lines.length && (lines[i].trim() === '' || lines[i].trim().startsWith('#'))) i++;
        if (i < lines.length && questTypes.includes(lines[i].trim())) {
            data.questType = lines[i].trim();
            i++;
        }
        
        // 2. Название
        while (i < lines.length && (lines[i].trim() === '' || lines[i].trim().startsWith('#'))) i++;
        if (i < lines.length) {
            data.name = lines[i].trim();
            i++;
        }
        
        // 3. Описание (многострочное, до строки-цели)
        const descLines = [];
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) {
                descLines.push(line);
                i++;
                continue;
            }
            if (this.isTargetLine(line) || this.isRewardLine(line) || this.isCooldownLine(line)) {
                break;
            }
            descLines.push(line);
            i++;
        }
        data.description = descLines.join('\n').trim();
        
        // 4. Цели
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) { i++; continue; }
            if (line === 'None') { i++; break; }
            if (!this.isTargetLine(line) && !this.isRewardLine(line)) break;
            if (this.isTargetLine(line)) {
                const targets = line.split('|').map(t => t.trim());
                targets.forEach(t => {
                    const parts = t.split(',').map(p => p.trim());
                    if (parts.length >= 2) {
                        data.targets.push({ prefab: parts[0], amount: parts[1], level: parts[2] || '' });
                    }
                });
            }
            i++;
        }
        
        // 5. Награды
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) { i++; continue; }
            if (line === 'None') { i++; break; }
            if (!this.isRewardLine(line)) break;
            const rewards = line.split('|').map(r => r.trim());
            rewards.forEach(r => {
                const match = r.match(/^(\w+):\s*([^,]+),\s*(\d+)(?:,\s*(\d+))?$/);
                if (match) {
                    data.rewards.push({ type: match[1], prefab: match[2].trim(), amount: match[3], level: match[4] || '' });
                }
            });
            i++;
        }
        
        // 6. Cooldown
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) { i++; continue; }
            if (this.isCooldownLine(line)) {
                data.cooldown = line;
                i++;
                break;
            }
            break;
        }
        
        // 7. Требования
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) { i++; continue; }
            if (line === 'None') { i++; break; }
            const reqs = line.split('|').map(r => r.trim());
            reqs.forEach(r => {
                const match = r.match(/^(\w+):\s*(.+)$/);
                if (match) {
                    data.requirements.push({ type: match[1], param: match[2].trim() });
                }
            });
            i++;
        }
        
        return data;
    }
    
    isTargetLine(line) {
        return /^[^,\n]+,\s*\d+(,\s*\d+)?$/.test(line);
    }
    
    isRewardLine(line) {
        return /^\w+:\s*[^,]+,\s*\d+/.test(line);
    }
    
    isCooldownLine(line) {
        return /^\d+$/.test(line);
    }
    
    showImportStats(stats) {
        this.els.statDialoguesCount.textContent = stats.dialogues;
        this.els.statQuestsCount.textContent = stats.quests;
        this.els.statUnknownCount.textContent = stats.unknown;
        this.openModal('importStatsModal');
    }
    
    generateCfgFromData() {
        let cfg = '';
        // Сначала диалоги
        this.blocks.filter(b => b.type === 'dialogue').forEach(block => {
            if (block.comments.length > 0) {
                cfg += block.comments.join('\n') + '\n';
            }
            cfg += `[${block.id}]\n`;
            cfg += `${block.data.text}\n`;
            block.data.options.forEach(opt => {
                let line = `Text: ${opt.text}`;
                if (opt.transition) line += ` | Transition: ${opt.transition}`;
                if (opt.questLink) line += ` | Command: OpenUI, Quests, ${opt.questLink}`;
                opt.commands.forEach(cmd => { line += ` | Command: ${cmd.type}${cmd.params.length ? ', ' + cmd.params.join(', ') : ''}`; });
                opt.conditions.forEach(cond => { line += ` | Condition: ${cond.type}${cond.params.length ? ', ' + cond.params.join(', ') : ''}`; });
                if (opt.icon) line += ` | Icon: ${opt.icon}`;
                cfg += `${line}\n`;
            });
            cfg += '\n';
        });
        // Потом квесты
        this.blocks.filter(b => b.type === 'quest').forEach(block => {
            if (block.comments.length > 0) {
                cfg += block.comments.join('\n') + '\n';
            }
            const questId = block.data.autocomplete ? `${block.id}=autocomplete` : block.id;
            cfg += `[${questId}]\n`;
            cfg += `${block.data.questType}\n`;
            cfg += `${block.data.name}\n`;
            cfg += `${block.data.description}\n`;
            cfg += block.data.targets.length > 0 ? block.data.targets.map(t => `${t.prefab}, ${t.amount}${t.level ? ', ' + t.level : ''}`).join(' | ') : 'None';
            cfg += '\n';
            cfg += block.data.rewards.length > 0 ? block.data.rewards.map(r => `${r.type}: ${r.prefab}, ${r.amount}${r.level ? ', ' + r.level : ''}`).join(' | ') : 'None';
            cfg += '\n';
            cfg += block.data.cooldown || 'None';
            cfg += '\n';
            cfg += block.data.requirements.length > 0 ? block.data.requirements.map(r => `${r.type}: ${r.param}`).join(' | ') : 'None';
            cfg += '\n\n';
        });
        return cfg;
    }
    
    exportCurrentCfg() {
        if (!this.currentCfgFile) { alert('No file selected'); return; }
        const content = this.generateCfgFromData();
        this.downloadFile(this.currentCfgFile, content);
    }
    
    validateAll() {
        const errors = [];
        this.blocks.forEach(block => {
            if (block.type === 'dialogue') {
                if (!block.data.text || !block.data.text.trim()) errors.push(`"${block.id}": no NPC text`);
                block.data.options.forEach((opt, i) => {
                    if (!opt.text || !opt.text.trim()) errors.push(`"${block.id}" #${i + 1}: no option text`);
                    if (opt.transition && !this.blocks.some(b => b.id === opt.transition)) errors.push(`"${block.id}" #${i + 1}: invalid transition "${opt.transition}"`);
                    if (opt.questLink && !this.blocks.some(b => b.id === opt.questLink)) errors.push(`"${block.id}" #${i + 1}: invalid quest link "${opt.questLink}"`);
                });
            } else if (block.type === 'quest') {
                if (!block.data.questType) errors.push(`"${block.id}": no quest type`);
                if (!block.data.name) errors.push(`"${block.id}": no quest name`);
            }
        });
        if (errors.length === 0) alert('No errors found!');
        else alert('Errors:\n\n' + errors.join('\n'));
    }
    
    searchBlocks(query) {
        if (!query.trim()) {
            document.querySelectorAll('.dialogue-node, .quest-node').forEach(el => el.style.opacity = '1');
            return;
        }
        const q = query.toLowerCase();
        this.blocks.forEach(block => {
            const el = document.querySelector(`[data-block-id="${block.id}"]`);
            if (!el) return;
            let match = block.id.toLowerCase().includes(q);
            if (block.type === 'dialogue') {
                match = match || block.data.text.toLowerCase().includes(q) || block.data.options.some(o => o.text.toLowerCase().includes(q));
            } else if (block.type === 'quest') {
                match = match || block.data.name.toLowerCase().includes(q) || block.data.description.toLowerCase().includes(q);
            }
            el.style.opacity = match ? '1' : '0.25';
        });
    }
    
    loadSampleData() {
        if (this.blocks.length > 0 && !confirm('Replace current data with sample?')) return;
        this.blocks = [];
        this.cfgFiles = {};
        this.currentCfgFile = 'sample.cfg';
        
        const d1 = this.addDialogueBlock('лапшеслав', 100, 150);
        d1.data.text = 'Приветствую, путник!\nХочешь перекусить?';
        const o1 = this.addOptionToBlock('лапшеслав', 'А ты кто вообще, воин?'); o1.transition = 'лапшеслав_о_себе';
        const o2 = this.addOptionToBlock('лапшеслав', '<color=#f1c40f>Может помочь?</color>'); o2.transition = 'лапшеслав_просьба'; o2.icon = 'Hammer';
        const o3 = this.addOptionToBlock('лапшеслав', '(уйти)');
        
        const d2 = this.addDialogueBlock('лапшеслав_о_себе', 500, 100);
        d2.data.text = 'Я Лапшеслав, повар.\nГотовлю рамен. Вон меню.';
        const o4 = this.addOptionToBlock('лапшеслав_о_себе', 'Сомнительно, я не буду.'); o4.transition = 'лапшеслав';
        
        const d3 = this.addDialogueBlock('лапшеслав_просьба', 500, 300);
        d3.data.text = 'Да, помощь нужна.\nДля рамена со свининой не хватает одного ингредиента.\nПринеси, пожалуйста <color=#e74c3c>10 кусков свинины</color>.';
        const o5 = this.addOptionToBlock('лапшеслав_просьба', 'Хорошо'); o5.questLink = 'лапшеслав_квест';
        const o6 = this.addOptionToBlock('лапшеслав_просьба', 'В другой раз'); o6.transition = 'лапшеслав';
        
        const q1 = this.addQuestBlock('лапшеслав_квест', 900, 300);
        q1.data = {
            questType: 'Collect',
            name: 'Недостающий ингредиент',
            description: 'Принести для варева 10 кусков сырой кабанины.',
            targets: [{ prefab: 'RawMeat', amount: '10', level: '' }],
            rewards: [{ type: 'Item', prefab: 'Coins', amount: '100', level: '' }],
            requirements: [],
            cooldown: '1',
            autocomplete: false
        };
        
        this.cfgFiles['sample.cfg'] = { raw: this.generateCfgFromData(), generated: this.generateCfgFromData() };
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
        if (this.currentCfgFile && this.cfgFiles[this.currentCfgFile]) {
            this.cfgFiles[this.currentCfgFile].generated = this.generateCfgFromData();
            // Если показываем raw, не обновляем editor
            if (!this.cfgFiles[this.currentCfgFile].raw) {
                this.showCodeFile(this.currentCfgFile);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.editor = new DialogueEditor();
});
