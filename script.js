// ============================================
// КУЗНИЦА СКАЛЬДА — Dialogue Editor (v2.1)
// ============================================

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

        // рисование кривой
        this.isDrawingCurve = false;
        this.drawingFromOption = null; // { nodeId, optionId }
        this.drawingTempPath = null;

        // вкладка кода
        this.currentCodeFile = 'index.html';
        this.sourceCode = {
            'index.html': '',
            'style.css': '',
            'script.js': ''
        };

        this.els = {};
        this.cacheElements();
        this.initEventListeners();
        this.loadSourceCode();
        this.render();

        console.log('✒ Кузница Скальда v2.1 инициализирована');
    }

    cacheElements() {
        const ids = [
            'searchInput', 'importDialogueBtn', 'importQuestBtn', 'questsBtn',
            'exportBtn', 'validateBtn', 'previewBtn', 'addNodeBtn', 'addOptionBtn',
            'deleteBtn', 'zoomInBtn', 'zoomOutBtn', 'fitToScreenBtn', 'loadSampleBtn',
            'connectionLayer', 'nodeContainer', 'canvasContainer',
            'nodeProperties', 'optionProperties', 'emptyState',
            'nodeId', 'nodeText', 'nodeOptionsList', 'addNodeOptionBtn',
            'optionText', 'optionTransition', 'optionQuestLink', 'optionIcon', 'optionColor',
            'conditionsList', 'commandsList', 'addConditionBtn', 'addCommandBtn',
            'previewModal', 'previewContent',
            'questsModal', 'addQuestBtn', 'questsList', 'questEditor',
            'conditionModal', 'conditionType', 'conditionParams', 'saveConditionBtn',
            'commandModal', 'commandType', 'commandParams', 'saveCommandBtn',
            'dialogueFileInput', 'questFileInput',
            'questTargetModal', 'targetPrefab', 'targetAmount', 'targetLevel', 'saveQuestTargetBtn',
            'questRewardModal', 'rewardType', 'rewardPrefab', 'rewardAmount', 'saveQuestRewardBtn',
            'questRequirementModal', 'requirementType', 'requirementParams', 'saveQuestRequirementBtn',
            'questPreviewModal', 'questPreviewContent',
            'questPalette', 'questPaletteList', 'toggleQuestPalette',
            'tabField', 'tabCode', 'codeEditor', 'copyCodeBtn', 'downloadCodeBtn'
        ];
        ids.forEach(id => { this.els[id] = document.getElementById(id); });
    }

    initEventListeners() {
        // Toolbar
        this.els.addNodeBtn.addEventListener('click', () => this.addNode());
        this.els.addOptionBtn.addEventListener('click', () => this.addOptionToSelected());
        this.els.deleteBtn.addEventListener('click', () => this.deleteSelected());
        this.els.zoomInBtn.addEventListener('click', () => this.zoom(0.1));
        this.els.zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));
        this.els.fitToScreenBtn.addEventListener('click', () => this.fitToScreen());
        this.els.loadSampleBtn.addEventListener('click', () => this.loadSampleData());

        // Header
        this.els.searchInput.addEventListener('input', (e) => this.searchDialogue(e.target.value));
        this.els.importDialogueBtn.addEventListener('click', () => this.els.dialogueFileInput.click());
        this.els.importQuestBtn.addEventListener('click', () => this.els.questFileInput.click());
        this.els.questsBtn.addEventListener('click', () => this.openModal('questsModal'));
        this.els.exportBtn.addEventListener('click', () => this.exportCfg());
        this.els.validateBtn.addEventListener('click', () => this.validateDialogue());
        this.els.previewBtn.addEventListener('click', () => this.showPreview());

        // File inputs
        this.els.dialogueFileInput.addEventListener('change', (e) => this.handleDialogueFileImport(e));
        this.els.questFileInput.addEventListener('change', (e) => this.handleQuestFileImport(e));

        // Node properties
        this.els.nodeId.addEventListener('change', (e) => this.updateNodeProperty('id', e.target.value));
        this.els.nodeText.addEventListener('input', (e) => this.updateNodeProperty('text', e.target.value));
        this.els.addNodeOptionBtn.addEventListener('click', () => this.addOptionToNode(this.selectedNode));

        // Option properties
        this.els.optionText.addEventListener('input', (e) => this.updateOptionProperty('text', e.target.value));
        this.els.optionTransition.addEventListener('change', (e) => this.updateOptionProperty('transition', e.target.value));
        this.els.optionQuestLink.addEventListener('change', (e) => this.updateOptionProperty('questLink', e.target.value));
        this.els.optionIcon.addEventListener('input', (e) => this.updateOptionProperty('icon', e.target.value));
        this.els.optionColor.addEventListener('input', (e) => this.updateOptionProperty('color', e.target.value));
        this.els.addConditionBtn.addEventListener('click', () => this.openModal('conditionModal'));
        this.els.addCommandBtn.addEventListener('click', () => this.openModal('commandModal'));

        // Condition/Command modals
        this.els.conditionType.addEventListener('change', () => this.updateConditionParams());
        this.els.saveConditionBtn.addEventListener('click', () => this.saveCondition());
        this.els.commandType.addEventListener('change', () => this.updateCommandParams());
        this.els.saveCommandBtn.addEventListener('click', () => this.saveCommand());

        // Quests
        this.els.addQuestBtn.addEventListener('click', () => this.addQuest());
        this.els.saveQuestTargetBtn.addEventListener('click', () => this.saveQuestTarget());
        this.els.saveQuestRewardBtn.addEventListener('click', () => this.saveQuestReward());
        this.els.requirementType.addEventListener('change', () => this.updateRequirementParams());
        this.els.saveQuestRequirementBtn.addEventListener('click', () => this.saveQuestRequirement());

        // Quest palette toggle
        this.els.toggleQuestPalette.addEventListener('click', () => {
            this.els.questPalette.classList.toggle('collapsed');
            this.els.toggleQuestPalette.textContent = this.els.questPalette.classList.contains('collapsed') ? '+' : '−';
        });

        // Canvas drag
        this.els.canvasContainer.addEventListener('mousedown', (e) => this.startCanvasDrag(e));
        window.addEventListener('mousemove', (e) => this.canvasDrag(e));
        window.addEventListener('mouseup', (e) => this.stopCanvasDrag(e));
        this.els.canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom(e.deltaY < 0 ? 0.1 : -0.1);
        }, { passive: false });

        // Drawing curve - global mouse events
        window.addEventListener('mousemove', (e) => this.onDrawMouseMove(e));
        window.addEventListener('mouseup', (e) => this.onDrawMouseUp(e));

        // Global click delegation
        document.addEventListener('click', (e) => this.handleGlobalClick(e));

        // Bottom tabs
        document.querySelectorAll('.bottom-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Code tabs
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchCodeFile(tab.dataset.file));
        });

        // Code actions
        this.els.copyCodeBtn.addEventListener('click', () => this.copyCurrentCode());
        this.els.downloadCodeBtn.addEventListener('click', () => this.downloadCurrentCode());

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isDrawingCurve) this.cancelDrawing();
                else this.closeAllModals();
            }
            if (e.key === 'Delete' && this.selectedNode) this.deleteSelected();
        });
    }

    // === TABS ===
    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.bottom-tab[data-tab="${tabId}"]`).classList.add('active');

        if (tabId === 'tabCode') {
            this.loadSourceCode();
            this.showCodeFile(this.currentCodeFile);
        }
    }

    switchCodeFile(file) {
        this.currentCodeFile = file;
        document.querySelectorAll('.code-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.file === file);
        });
        this.showCodeFile(file);
    }

    showCodeFile(file) {
        this.els.codeEditor.value = this.sourceCode[file] || '// Файл не загружен';
    }

    async loadSourceCode() {
        const files = ['index.html', 'style.css', 'script.js'];
        for (const file of files) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    this.sourceCode[file] = await response.text();
                }
            } catch (e) {
                console.warn(`Не удалось загрузить ${file}:`, e);
            }
        }
    }

    copyCurrentCode() {
        this.els.codeEditor.select();
        document.execCommand('copy');
        this.els.copyCodeBtn.textContent = '✓ Скопировано!';
        setTimeout(() => { this.els.copyCodeBtn.textContent = '📋 Копировать'; }, 2000);
    }

    downloadCurrentCode() {
        this.downloadFile(this.currentCodeFile, this.els.codeEditor.value);
    }

    // === GLOBAL CLICK ===
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
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    }

    // === NODES ===
    addNode(id = null, x = null, y = null) {
        const nodeId = id || `Node_${Date.now()}`;
        if (this.nodes.has(nodeId)) return null;

        const offset = this.nodes.size * 50;
        const node = {
            id: nodeId,
            text: 'Новый диалог...',
            options: [],
            x: x !== null ? x : 100 + offset,
            y: y !== null ? y : 100 + offset,
            collapsed: false
        };

        this.nodes.set(nodeId, node);
        this.renderNodes();
        this.selectNode(nodeId);
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
        this.els.optionIcon.value = option.icon || '';
        this.els.optionColor.value = option.color || '#ffffff';

        this.renderConditionsList(option.conditions);
        this.renderCommandsList(option.commands);
        this.renderNodeOptionsList();
        this.updateQuestLinksList();
    }

    addOptionToSelected() {
        if (!this.selectedNode) { alert('Сначала выберите узел!'); return; }
        this.addOptionToNode(this.selectedNode);
    }

    addOptionToNode(nodeId, text = 'Новая опция') {
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
    }

    updateOptionProperty(property, value) {
        const node = this.nodes.get(this.selectedNode);
        if (!node || !this.selectedOption) return;
        const option = node.options.find(o => o.id === this.selectedOption);
        if (!option) return;

        // одна кнопка = одно действие
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

    updateQuestLinksList() {
        const select = this.els.optionQuestLink;
        select.innerHTML = '<option value="">— Нет —</option>';
        this.quests.forEach((quest, questId) => {
            const opt = document.createElement('option');
            opt.value = questId;
            opt.textContent = quest.name || questId;
            select.appendChild(opt);
        });
    }

    // === RENDER ===
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
                <span class="node-header-text">📝 ${this.escapeHtml(node.id)}</span>
            </div>
            <div class="node-content">
                <div class="node-text">${previewText}</div>
                ${node.options.map((opt) => {
                    const handleClass = this.getOptionHandleClass(opt);
                    return `
                    <div class="option ${opt.id === this.selectedOption ? 'selected' : ''} ${this.getOptionClass(opt)}" 
                         data-action="select-option" 
                         data-option-id="${opt.id}">
                        ${opt.icon ? `<div class="option-icon" title="${this.escapeHtml(opt.icon)}"></div>` : ''}
                        <span class="option-text">${this.escapeHtml(opt.text.length > 25 ? opt.text.substring(0, 25) + '...' : opt.text)}</span>
                        <div class="option-draw-handle ${handleClass}" 
                             data-draw-handle 
                             data-node-id="${node.id}" 
                             data-option-id="${opt.id}"
                             title="Тяни к другому узлу, квесту или в пустоту"></div>
                    </div>
                `;
                }).join('')}
            </div>
        `;

        this.setupNodeDrag(div, node);
        this.setupDrawHandles(div, node);
        return div;
    }

    getOptionClass(opt) {
        if (opt.conditions.length > 0) return 'has-conditions';
        if (opt.commands.length > 0) return 'has-commands';
        if (opt.transition) return 'has-transition';
        if (opt.questLink) return 'has-transition';
        return 'is-end';
    }

    getOptionHandleClass(opt) {
        if (opt.conditions.length > 0) return 'has-conditions';
        if (opt.commands.length > 0) return 'has-commands';
        if (opt.transition) return 'has-transition';
        if (opt.questLink) return 'has-transition';
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

    // === DRAWING CURVES ===
    startDrawing(e, nodeId, optionId) {
        this.isDrawingCurve = true;
        this.drawingFromOption = { nodeId, optionId };
        this.els.canvasContainer.classList.add('drawing-mode');

        // создаём временный path
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

        // Находим стартовую точку
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
            // тащим на узел - transition
            option.transition = target.id;
            option.questLink = '';
        } else if (target.type === 'quest') {
            // тащим на квест - questLink
            option.questLink = target.id;
            option.transition = '';
        } else {
            // тащим в пустоту - "Конец"
            option.transition = '';
            option.questLink = '';
        }

        this.cancelDrawing();
        this.renderNodes();
        this.renderNodeOptionsList();
        if (this.selectedOption === option.id) {
            this.els.optionTransition.value = option.transition;
            this.els.optionQuestLink.value = option.questLink;
        }
    }

    findDrawTarget(e) {
        // чек, попали ли на узел
        const nodeEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.dialogue-node');
        if (nodeEl && nodeEl.dataset.nodeId !== this.drawingFromOption.nodeId) {
            return { type: 'node', id: nodeEl.dataset.nodeId };
        }

        // чек, попали ли на квест в палитре
        const questEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.quest-palette-item');
        if (questEl) {
            return { type: 'quest', id: questEl.dataset.questId };
        }

        // пустота - "Конец"
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

    // === CONNECTIONS ===
    renderConnections() {
        const svg = this.els.connectionLayer;
        svg.querySelectorAll('path:not([stroke-dasharray="8 4"]), .end-cloud-group, .quest-cloud-group').forEach(p => p.remove());

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
                    // кривая к узлу
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

                    // кружок в начале
                    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    dot.setAttribute('cx', sx);
                    dot.setAttribute('cy', sy);
                    dot.setAttribute('r', '4');
                    dot.setAttribute('fill', colorInfo.color);
                    dot.setAttribute('stroke', '#fff');
                    dot.setAttribute('stroke-width', '1');
                    svg.appendChild(dot);

                } else if (opt.questLink && this.quests.has(opt.questLink)) {
                    // кривая к квесту (облачко "Квест")
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
                    dot.setAttribute('cx', sx);
                    dot.setAttribute('cy', sy);
                    dot.setAttribute('r', '4');
                    dot.setAttribute('fill', colorInfo.color);
                    dot.setAttribute('stroke', '#fff');
                    dot.setAttribute('stroke-width', '1');
                    svg.appendChild(dot);

                    this.renderQuestCloud(endX, endY, opt.questLink, svg);

                } else {
                    // выход - облачко "Конец"
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

        const cloudParts = [
            { cx: x + 35, cy: y, rx: 38, ry: 18 },
            { cx: x + 22, cy: y - 8, rx: 20, ry: 12 },
            { cx: x + 48, cy: y - 8, rx: 20, ry: 12 },
            { cx: x + 22, cy: y + 8, rx: 18, ry: 10 },
            { cx: x + 48, cy: y + 8, rx: 18, ry: 10 },
        ];

        cloudParts.forEach(p => {
            const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            ellipse.setAttribute('cx', p.cx);
            ellipse.setAttribute('cy', p.cy);
            ellipse.setAttribute('rx', p.rx);
            ellipse.setAttribute('ry', p.ry);
            ellipse.setAttribute('fill', '#3d4450');
            ellipse.setAttribute('stroke', '#95a5a6');
            ellipse.setAttribute('stroke-width', '1.5');
            g.appendChild(ellipse);
        });

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 35);
        text.setAttribute('y', y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#bdc3c7');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-style', 'italic');
        text.textContent = 'Конец';
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

        // Облачко
        const cloudParts = [
            { cx: x + 40, cy: y, rx: 42, ry: 20 },
            { cx: x + 25, cy: y - 10, rx: 22, ry: 14 },
            { cx: x + 55, cy: y - 10, rx: 22, ry: 14 },
            { cx: x + 25, cy: y + 10, rx: 20, ry: 12 },
            { cx: x + 55, cy: y + 10, rx: 20, ry: 12 },
        ];

        cloudParts.forEach(p => {
            const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            ellipse.setAttribute('cx', p.cx);
            ellipse.setAttribute('cy', p.cy);
            ellipse.setAttribute('rx', p.rx);
            ellipse.setAttribute('ry', p.ry);
            ellipse.setAttribute('fill', '#2d4a2d');
            ellipse.setAttribute('stroke', '#27ae60');
            ellipse.setAttribute('stroke-width', '1.5');
            g.appendChild(ellipse);
        });

        // эмодзи свитка
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('x', x + 20);
        icon.setAttribute('y', y + 5);
        icon.setAttribute('font-size', '14');
        icon.textContent = '📜';
        g.appendChild(icon);

        // текст "Квест"
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 45);
        text.setAttribute('y', y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#27ae60');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.textContent = 'Квест';
        g.appendChild(text);

        // подсказка с названием квеста
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${quest.name} (${questId}) — клик для перехода в редактор`;
        g.appendChild(title);

        svg.appendChild(g);
    }

    // === QUEST PALETTE ===
    renderQuestPalette() {
        this.els.questPaletteList.innerHTML = Array.from(this.quests.values()).map(q => `
            <div class="quest-palette-item" data-quest-id="${q.id}">
                <div class="quest-palette-item-name">📜 ${this.escapeHtml(q.name)}</div>
                <div class="quest-palette-item-id">${this.escapeHtml(q.id)}</div>
            </div>
        `).join('');
    }

    // === CANVAS ===
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

    // === PREVIEW ===
    showPreview() {
        if (!this.selectedNode) { alert('Выберите диалог для предпросмотра'); return; }
        this.previewHistory = [];
        this.currentPreviewNode = this.nodes.get(this.selectedNode);
        this.els.previewContent.innerHTML = this.generatePreview(this.currentPreviewNode, true);
        this.openModal('previewModal');
    }

    generatePreview(node, isRoot = false) {
        const processedText = this.processTextForPreview(node.text);
        let html = '';

        if (!isRoot) {
            html += `<div class="preview-back"><button data-action="preview-go-back">← Назад</button></div>`;
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

            html += `
                <div class="preview-option" ${onClickAttr}>
                    ${option.icon ? `<div class="preview-option-icon" title="${this.escapeHtml(option.icon)}"></div>` : ''}
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
        return processed;
    }

    // === CONDITIONS & COMMANDS ===
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
        if (option) { option.conditions.splice(index, 1); this.renderConditionsList(option.conditions); this.renderNodes(); }
    }

    removeCommand(index) {
        const node = this.nodes.get(this.selectedNode);
        if (!node || !this.selectedOption) return;
        const option = node.options.find(o => o.id === this.selectedOption);
        if (option) { option.commands.splice(index, 1); this.renderCommandsList(option.commands); this.renderNodes(); }
    }

    // === QUESTS ===
    addQuest() {
        const id = `Quest_${Date.now()}`;
        this.quests.set(id, {
            id, type: 'Kill', name: 'Новый квест', description: 'Описание...',
            targets: [], rewards: [], cooldown: '', timeLimit: '',
            requirements: [], autocomplete: false
        });
        this.renderQuestsList();
        this.renderQuestPalette();
        this.selectQuest(id);
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
            this.els.questEditor.innerHTML = '<div class="no-quest-selected"><p>Выберите квест для редактирования</p></div>';
            return;
        }

        const targetsHtml = quest.targets.map((t, i) => `
            <div class="quest-target-item">
                <span>${this.escapeHtml(t.prefab)} x${t.amount}</span>
                <button data-action="delete-quest-target" data-index="${i}">×</button>
            </div>
        `).join('');

        const rewardsHtml = quest.rewards.map((r, i) => `
            <div class="quest-reward-item">
                <span>${r.type}: ${this.escapeHtml(r.prefab)} x${r.amount}</span>
                <button data-action="delete-quest-reward" data-index="${i}">×</button>
            </div>
        `).join('');

        const reqsHtml = quest.requirements.map((r, i) => `
            <div class="quest-requirement-item">
                <span>${r.type}(${r.params.join(', ')})</span>
                <button data-action="delete-quest-req" data-index="${i}">×</button>
            </div>
        `).join('');

        this.els.questEditor.innerHTML = `
            <div class="quest-form">
                <div class="quest-form-section">
                    <h4>Основное</h4>
                    <div class="form-group"><label>ID:</label><input type="text" class="form-control quest-id-input" value="${this.escapeHtml(quest.id)}"></div>
                    <div class="form-group">
                        <label>Тип:</label>
                        <select class="form-control quest-type-input">
                            ${['Kill','Collect','Harvest','Craft','Talk','Build','Move'].map(t => `<option value="${t}" ${quest.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>Название:</label><input type="text" class="form-control quest-name-input" value="${this.escapeHtml(quest.name)}"></div>
                    <div class="form-group"><label>Описание:</label><textarea class="form-control quest-desc-input" rows="3">${this.escapeHtml(quest.description)}</textarea></div>
                    <div class="form-group"><label><input type="checkbox" class="quest-auto-input" ${quest.autocomplete ? 'checked' : ''}> Автозавершение</label></div>
                </div>
                <div class="quest-form-section">
                    <h4>Цели</h4>
                    <div class="quest-targets">${targetsHtml || '<p>Нет целей</p>'}</div>
                    <button class="btn-small" data-action="show-quest-target-modal">+ Добавить цель</button>
                </div>
                <div class="quest-form-section">
                    <h4>Награды</h4>
                    <div class="quest-rewards">${rewardsHtml || '<p>Нет наград</p>'}</div>
                    <button class="btn-small" data-action="show-quest-reward-modal">+ Добавить награду</button>
                </div>
                <div class="quest-form-section">
                    <h4>Требования</h4>
                    <div class="quest-requirements">${reqsHtml || '<p>Нет требований</p>'}</div>
                    <button class="btn-small" data-action="show-quest-req-modal">+ Добавить требование</button>
                </div>
                <div class="quest-form-section">
                    <h4>Время</h4>
                    <div class="form-group"><label>Кулдаун (дни):</label><input type="number" class="form-control quest-cd-input" value="${quest.cooldown}"></div>
                    <div class="form-group"><label>Лимит (сек):</label><input type="number" class="form-control quest-tl-input" value="${quest.timeLimit}"></div>
                </div>
                <button class="quest-preview-btn" data-action="show-quest-preview">🎮 Предпросмотр квеста</button>
            </div>
        `;

        this.bindQuestFormEvents(quest);
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
    }

    saveQuestTarget() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        const prefab = this.els.targetPrefab.value.trim();
        if (!prefab) { alert('Введите префаб'); return; }
        quest.targets.push({ prefab, amount: this.els.targetAmount.value || '1', level: this.els.targetLevel.value || '' });
        this.closeAllModals();
        this.renderQuestEditor();
    }

    saveQuestReward() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        const prefab = this.els.rewardPrefab.value.trim();
        if (!prefab) { alert('Введите префаб'); return; }
        quest.rewards.push({ type: this.els.rewardType.value, prefab, amount: this.els.rewardAmount.value || '1' });
        this.closeAllModals();
        this.renderQuestEditor();
    }

    saveQuestRequirement() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return;
        const type = this.els.requirementType.value;
        const params = Array.from(this.els.requirementParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v);
        if (params.length === 0) { alert('Заполните параметры'); return; }
        quest.requirements.push({ type, params });
        this.closeAllModals();
        this.renderQuestEditor();
    }

    deleteQuestTarget(index) {
        const quest = this.quests.get(this.selectedQuest);
        if (quest) { quest.targets.splice(index, 1); this.renderQuestEditor(); }
    }

    deleteQuestReward(index) {
        const quest = this.quests.get(this.selectedQuest);
        if (quest) { quest.rewards.splice(index, 1); this.renderQuestEditor(); }
    }

    deleteQuestRequirement(index) {
        const quest = this.quests.get(this.selectedQuest);
        if (quest) { quest.requirements.splice(index, 1); this.renderQuestEditor(); }
    }

    showQuestPreview() {
        if (!this.selectedQuest) { alert('Выберите квест'); return; }
        this.els.questPreviewContent.innerHTML = this.generateQuestPreview();
        this.openModal('questPreviewModal');
    }

    generateQuestPreview() {
        const quest = this.quests.get(this.selectedQuest);
        if (!quest) return '';

        const questsList = Array.from(this.quests.values()).map(q => `
            <div class="quest-preview-list-item ${q.id === quest.id ? 'selected' : ''}" data-action="preview-select-quest" data-id="${q.id}">
                ${this.escapeHtml(q.name)}
            </div>
        `).join('');

        const description = this.processQuestDescription(quest.description);
        const targetsHtml = quest.targets.map(t => `<div class="quest-preview-objective"><span>${this.escapeHtml(t.prefab)}</span><span>x${t.amount}</span></div>`).join('');
        const rewardsHtml = quest.rewards.map(r => `<div class="quest-preview-reward"><span>${this.escapeHtml(r.prefab)}</span><span>x${r.amount}</span></div>`).join('');

        return `
            <div class="quest-preview-content">
                <div class="quest-preview-sidebar">
                    <h3>Квесты</h3>
                    <div class="quest-preview-list">${questsList}</div>
                </div>
                <div class="quest-preview-details">
                    <div class="quest-preview-title">${this.escapeHtml(quest.name)}</div>
                    ${description}
                    <div class="quest-preview-separator"></div>
                    <div class="quest-preview-section"><h4>Что нужно сделать:</h4><div class="quest-preview-objectives">${targetsHtml || '<p>Нет целей</p>'}</div></div>
                    <div class="quest-preview-separator"></div>
                    <div class="quest-preview-section"><h4>Вознаграждение:</h4><div class="quest-preview-rewards">${rewardsHtml || '<p>Нет наград</p>'}</div></div>
                    <button class="quest-preview-accept-btn">Взять квест</button>
                </div>
            </div>
        `;
    }

    processQuestDescription(desc) {
        if (!desc) return '<div class="quest-preview-description">Нет описания</div>';
        const imageMatch = desc.match(/<image=([^>]+)>/);
        let imageHtml = '';
        let cleanDesc = desc;
        if (imageMatch) {
            imageHtml = `<div class="quest-preview-image"><img src="${imageMatch[1]}" alt="Quest" onerror="this.style.display='none'"></div>`;
            cleanDesc = desc.replace(/<image=[^>]+>/, '');
        }
        return `<div class="quest-preview-description">${this.escapeHtml(cleanDesc).replace(/\\n/g, '<br>')}</div>${imageHtml}`;
    }

    previewSelectQuest(id) {
        this.selectedQuest = id;
        this.renderQuestsList();
        this.els.questPreviewContent.innerHTML = this.generateQuestPreview();
    }

    // === EXPORT / IMPORT ===
    exportCfg() {
        let cfg = '';
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
        this.downloadFile('dialogue.cfg', cfg);
    }

    handleDialogueFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => this.parseDialogueCfg(ev.target.result);
        reader.readAsText(file);
        e.target.value = '';
    }

    handleQuestFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => this.parseQuestCfg(ev.target.result);
        reader.readAsText(file);
        e.target.value = '';
    }

    parseDialogueCfg(content) {
        this.nodes.clear();
        const blocks = content.split(/\n(?=\[)/);
        
        blocks.forEach(block => {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length === 0) return;
            
            const firstLine = lines[0];
            if (!firstLine.startsWith('[') || !firstLine.endsWith(']')) return;
            
            const nodeId = firstLine.slice(1, -1).trim();
            if (!nodeId || this.nodes.has(nodeId)) return;
            
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
        if (this.nodes.size > 0) {
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
        this.quests.clear();
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
        if (this.quests.size > 0) {
            this.selectQuest(this.quests.keys().next().value);
        }
    }

    validateDialogue() {
        const errors = [];
        this.nodes.forEach((node, id) => {
            if (!node.text || !node.text.trim()) errors.push(`"${id}": нет текста NPC`);
            node.options.forEach((opt, i) => {
                if (!opt.text || !opt.text.trim()) errors.push(`"${id}" #${i+1}: нет текста опции`);
                if (opt.transition && !this.nodes.has(opt.transition)) errors.push(`"${id}" #${i+1}: переход на несуществующий "${opt.transition}"`);
                if (opt.questLink && !this.quests.has(opt.questLink)) errors.push(`"${id}" #${i+1}: ссылка на несуществующий квест "${opt.questLink}"`);
            });
        });
        if (errors.length === 0) alert('✅ Ошибок не найдено!');
        else alert('Ошибки:\n\n' + errors.join('\n'));
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
        if (this.nodes.size > 0 && !confirm('Текущие данные будут заменены примером. Продолжить?')) return;
        this.nodes.clear();
        this.quests.clear();

        const n1 = this.addNode('Start', 100, 150);
        n1.text = 'Приветствую тебя, путник!\\nЧем могу помочь?';
        const o1 = this.addOptionToNode('Start', 'Расскажи о себе'); o1.transition = 'About';
        const o2 = this.addOptionToNode('Start', '<color=#f1c40f>Есть работа?</color>'); o2.transition = 'QuestOffer'; o2.color = '#f1c40f'; o2.icon = 'Hammer';
        const o3 = this.addOptionToNode('Start', 'Прощай');

        const n2 = this.addNode('About', 500, 100);
        n2.text = 'Я кузнец, работаю здесь уже 20 лет.\\nМогу сделать любое оружие.';
        const o4 = this.addOptionToNode('About', 'Назад'); o4.transition = 'Start';

        const n3 = this.addNode('QuestOffer', 500, 300);
        n3.text = 'Есть одно дельце...\\nНужно принести <color=#e74c3c>10 шкур кабана</color>.';
        const o5 = this.addOptionToNode('QuestOffer', 'Берусь!'); o5.questLink = 'BoarHunt';
        const o6 = this.addOptionToNode('QuestOffer', 'Не сейчас'); o6.transition = 'Start';

        const n4 = this.addNode('Accepted', 900, 300);
        n4.text = 'Отлично! Жду тебя с добычей.';
        this.addOptionToNode('Accepted', 'До встречи');

        this.quests.set('BoarHunt', {
            id: 'BoarHunt', type: 'Kill', name: 'Охота на кабанов',
            description: 'Принеси кузнецу 10 шкур кабана.\\n<image=https://example.com/boar.jpg>',
            targets: [{ prefab: 'Boar', amount: '10', level: '' }],
            rewards: [{ type: 'Item', prefab: 'Coins', amount: '100' }],
            cooldown: '1', timeLimit: '', requirements: [], autocomplete: false
        });

        this.renderNodes();
        this.renderQuestsList();
        this.renderQuestPalette();
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.editor = new DialogueEditor();
});
