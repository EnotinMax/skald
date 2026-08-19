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

        this.isDrawingCurve = false;
        this.drawingFromOption = null;
        this.drawingTempPath = null;

        this.els = {};
        this.cacheElements();
        this.initEventListeners();
        this.render();

        console.log('Кузница Скальда v2.1 инициализирована');
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
            'questTargetModal', 'targetPrefab', 'targetAmount', 'saveQuestTargetBtn',
            'questRewardModal', 'rewardType', 'rewardPrefab', 'rewardAmount', 'saveQuestRewardBtn',
            'questRequirementModal', 'requirementType', 'requirementParams', 'saveQuestRequirementBtn',
            'questPreviewModal', 'questPreviewContent',
            'questPalette', 'questPaletteList', 'toggleQuestPalette',
            'tabField', 'tabCode', 'codeEditor', 'copyCodeBtn', 'downloadCodeBtn', 'applyCodeBtn'
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
        this.els.exportBtn.addEventListener('click', () => this.exportCfg());
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
        this.els.optionIcon.addEventListener('input', (e) => this.updateOptionProperty('icon', e.target.value));
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

        document.querySelectorAll('.bottom-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        this.els.applyCodeBtn.addEventListener('click', () => this.applyCodeChanges());
        this.els.copyCodeBtn.addEventListener('click', () => this.copyCurrentCode());
        this.els.downloadCodeBtn.addEventListener('click', () => this.downloadCurrentCode());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isDrawingCurve) this.cancelDrawing();
                else this.closeAllModals();
            }
            if (e.key === 'Delete' && this.selectedNode) this.deleteSelected();
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.bottom-tab[data-tab="${tabId}"]`).classList.add('active');

        if (tabId === 'tabCode') {
            this.syncCodeView();
        }
    }

    syncCodeView() {
        this.els.codeEditor.value = this.generateCfgContent();
    }

    applyCodeChanges() {
        const code = this.els.codeEditor.value;
        if (!code.trim()) {
            alert('Код пуст');
            return;
        }
        if (this.nodes.size > 0 && !confirm('Это перезапишет все текущие диалоги и квесты данными из кода. Продолжить?')) {
            return;
        }
        
        this.nodes.clear();
        this.quests.clear();
        
        // разделяем код на блоки диалогов и квестов (упрощенно: ищем [ID])
        // для надежности парсим всё подряд, парсер сам разберется
        this.parseDialogueCfg(code);
        this.parseQuestCfg(code);
        
        this.render();
        this.switchTab('tabField');
        alert('Данные успешно применены из кода!');
    }

    copyCurrentCode() {
        this.els.codeEditor.select();
        document.execCommand('copy');
        this.els.copyCodeBtn.textContent = 'Скопировано!';
        setTimeout(() => { this.els.copyCodeBtn.textContent = 'Копировать'; }, 2000);
    }

    downloadCurrentCode() {
        this.downloadFile('config.cfg', this.els.codeEditor.value);
    }

    handleGlobalClick(e) {
        if (e.target.matches('.close') || e.target.closest('.close')) { this.closeAllModals(); return; }
        if (e.target.classList.contains('modal')) { this.closeAllModals(); return; }

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
            id: nodeId, text: 'Новый диалог...', options: [],
            x: x !== null ? x : 100 + offset, y: y !== null ? y : 100 + offset, collapsed: false
        };

        this.nodes.set(nodeId, node);
        this.renderNodes();
        this.selectNode(nodeId);
        return node;
    }

    selectNode(nodeId) {
        this.selectedNode = nodeId;
        this.selectedOption = null;
        document.querySelectorAll('.dialogue-node').forEach(el => el.classList.toggle('selected', el.dataset.nodeId === nodeId));

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
            text, transition: '', questLink: '', icon: '', color: '#ffffff', conditions: [], commands: []
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

        if (property === 'transition' && value) { option.questLink = ''; this.els.optionQuestLink.value = ''; }
        else if (property === 'questLink' && value) { option.transition = ''; this.els.optionTransition.value = ''; }

        option[property] = value;
        this.renderNodes();
        this.renderNodeOptionsList();
    }

    deleteSelected() {
        if (this.selectedOption) {
            this.deleteOptionFromNode(this.selectedOption);
        } else if (this.selectedNode) {
            this.nodes.forEach(otherNode => {
                otherNode.options.forEach(opt => { if (opt.transition === this.selectedNode) opt.transition = ''; });
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
                opt.value = nodeId; opt.textContent = nodeId;
                select.appendChild(opt);
            }
        });
    }

    updateQuestLinksList() {
        const select = this.els.optionQuestLink;
        select.innerHTML = '<option value="">— Нет —</option>';
        this.quests.forEach((quest, questId) => {
            const opt = document.createElement('option');
            opt.value = questId; opt.textContent = quest.name || questId;
            select.appendChild(opt);
        });
    }

    // === RENDER & SVG SIZING ===
    render() {
        this.renderNodes();
        this.renderQuestPalette();
        if (document.getElementById('tabCode').classList.contains('active')) {
            this.syncCodeView();
        }
    }

    renderNodes() {
        const container = this.els.nodeContainer;
        container.innerHTML = '';
        this.nodes.forEach((node, nodeId) => {
            container.appendChild(this.createNodeElement(node));
        });
        this.updateSvgSize();
        requestAnimationFrame(() => this.renderConnections());
    }

    updateSvgSize() {
        let maxX = 3000, maxY = 3000; // базовый большой размер
        this.nodes.forEach(node => {
            maxX = Math.max(maxX, node.x + 500);
            maxY = Math.max(maxY, node.y + 500);
        });
        this.els.connectionLayer.setAttribute('width', maxX);
        this.els.connectionLayer.setAttribute('height', maxY);
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
                <button class="collapse-btn" data-action="toggle-collapse" data-id="${node.id}">${node.collapsed ? '▶' : '▼'}</button>
                <span class="node-header-text">📝 ${this.escapeHtml(node.id)}</span>
            </div>
            <div class="node-content">
                <div class="node-text">${previewText}</div>
                ${node.options.map((opt) => {
                    const handleClass = this.getOptionHandleClass(opt);
                    return `
                    <div class="option ${opt.id === this.selectedOption ? 'selected' : ''} ${this.getOptionClass(opt)}" 
                         data-action="select-option" data-option-id="${opt.id}">
                        ${opt.icon ? `<div class="option-icon" title="${this.escapeHtml(opt.icon)}"></div>` : ''}
                        <span class="option-text">${this.escapeHtml(opt.text.length > 25 ? opt.text.substring(0, 25) + '...' : opt.text)}</span>
                        <div class="option-draw-handle ${handleClass}" data-draw-handle data-node-id="${node.id}" data-option-id="${opt.id}" title="Тяни к узлу, квесту или в пустоту"></div>
                    </div>`;
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
        let isDragging = false, startX = 0, startY = 0, startNodeX = 0, startNodeY = 0;
        const onMouseDown = (e) => {
            if (e.target.closest('[data-draw-handle]') || e.target.closest('button') || e.target.closest('.option') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            this.selectNode(node.id);
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            startNodeX = node.x; startNodeY = node.y;
            e.stopPropagation(); e.preventDefault();
        };
        const onMouseMove = (e) => {
            if (!isDragging) return;
            node.x = startNodeX + (e.clientX - startX) / this.currentZoom;
            node.y = startNodeY + (e.clientY - startY) / this.currentZoom;
            element.style.left = `${node.x}px`;
            element.style.top = `${node.y}px`;
            this.renderConnections();
        };
        const onMouseUp = () => { 
            if (isDragging) { isDragging = false; this.updateSvgSize(); } 
        };
        element.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    setupDrawHandles(element, node) {
        element.querySelectorAll('[data-draw-handle]').forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation(); e.preventDefault();
                this.startDrawing(e, node.id, handle.dataset.optionId);
            });
        });
    }

    // === DRAWING ===
    startDrawing(e, nodeId, optionId) {
        this.isDrawingCurve = true;
        this.drawingFromOption = { nodeId, optionId };
        this.els.canvasContainer.classList.add('drawing-mode');
        this.drawingTempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.drawingTempPath.setAttribute('fill', 'none');
        this.drawingTempPath.setAttribute('stroke', '#fff');
        this.drawingTempPath.setAttribute('stroke-width', '2.5');
        this.drawingTempPath.setAttribute('stroke-dasharray', '8 4');
        this.drawingTempPath.setAttribute('marker-end', 'url(#arrowhead-drawing)');
        this.drawingTempPath.setAttribute('opacity', '0.8');
        this.els.connectionLayer.appendChild(this.drawingTempPath);
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
        this.drawingTempPath.setAttribute('d', this.getCurvePath(sx, sy, mouseX, mouseY));
    }

    onDrawMouseUp(e) {
        if (!this.isDrawingCurve) return;
        const target = this.findDrawTarget(e);
        const node = this.nodes.get(this.drawingFromOption.nodeId);
        if (!node) { this.cancelDrawing(); return; }
        const option = node.options.find(o => o.id === this.drawingFromOption.optionId);
        if (!option) { this.cancelDrawing(); return; }

        if (target.type === 'node') { option.transition = target.id; option.questLink = ''; }
        else if (target.type === 'quest') { option.questLink = target.id; option.transition = ''; }
        else { option.transition = ''; option.questLink = ''; }

        this.cancelDrawing();
        this.renderNodes();
        this.renderNodeOptionsList();
        if (this.selectedOption === option.id) {
            this.els.optionTransition.value = option.transition;
            this.els.optionQuestLink.value = option.questLink;
        }
    }

    findDrawTarget(e) {
        const nodeEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.dialogue-node');
        if (nodeEl && nodeEl.dataset.nodeId !== this.drawingFromOption.nodeId) return { type: 'node', id: nodeEl.dataset.nodeId };
        const questEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.quest-palette-item');
        if (questEl) return { type: 'quest', id: questEl.dataset.questId };
        return { type: 'end' };
    }

    cancelDrawing() {
        this.isDrawingCurve = false;
        this.drawingFromOption = null;
        this.els.canvasContainer.classList.remove('drawing-mode');
        if (this.drawingTempPath) { this.drawingTempPath.remove(); this.drawingTempPath = null; }
    }

    renderNodeOptionsList() {
        const node = this.nodes.get(this.selectedNode);
        if (!node) return;
        this.els.nodeOptionsList.innerHTML = node.options.map((opt, i) => `
            <div class="option-list-item ${opt.id === this.selectedOption ? 'selected' : ''}" data-action="select-option" data-option-id="${opt.id}">
                <span class="option-list-text">${i + 1}. ${this.escapeHtml(opt.text)}</span>
                <div class="option-list-buttons"><button class="option-list-btn danger" data-action="delete-option" data-option-id="${opt.id}">×</button></div>
            </div>
        `).join('');
    }

    // === CONNECTIONS ===
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
                    this.drawCurve(svg, sx, sy, tx, ty, colorInfo.color, `arrowhead-${colorInfo.marker}`);
                    this.drawDot(svg, sx, sy, colorInfo.color);
                } else if (opt.questLink && this.quests.has(opt.questLink)) {
                    this.drawCurve(svg, sx, sy, sx + 120, sy, colorInfo.color, `arrowhead-${colorInfo.marker}`);
                    this.drawDot(svg, sx, sy, colorInfo.color);
                    this.renderQuestCloud(sx + 120, sy, opt.questLink, svg);
                } else {
                    this.drawCurve(svg, sx, sy, sx + 120, sy, '#95a5a6', 'arrowhead-gray', true);
                    this.drawDot(svg, sx, sy, '#95a5a6');
                    this.renderEndCloud(sx + 120, sy, svg);
                }
            });
        });
    }

    drawCurve(svg, sx, sy, tx, ty, color, markerId, isDashed = false) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.getCurvePath(sx, sy, tx, ty));
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('marker-end', `url(#${markerId})`);
        path.setAttribute('opacity', '0.85');
        path.setAttribute('stroke-linecap', 'round');
        if (isDashed) {
            path.setAttribute('stroke-dasharray', '6 4');
            path.setAttribute('opacity', '0.7');
        }
        svg.appendChild(path);
    }

    drawDot(svg, x, y, color) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('class', 'connection-dot');
        dot.setAttribute('cx', x); dot.setAttribute('cy', y);
        dot.setAttribute('r', '4'); dot.setAttribute('fill', color);
        dot.setAttribute('stroke', '#fff'); dot.setAttribute('stroke-width', '1');
        svg.appendChild(dot);
    }

    getOptionColorInfo(opt) {
        if (opt.conditions.length > 0) return { color: '#e74c3c', marker: 'red' };
        if (opt.commands.length > 0) return { color: '#27ae60', marker: 'green' };
        if (opt.transition || opt.questLink) return { color: '#f39c12', marker: 'orange' };
        return { color: '#95a5a6', marker: 'gray' };
    }

    getCurvePath(sx, sy, tx, ty) {
        const dx = tx - sx;
        if (dx > 30) {
            const cpOffset = Math.max(50, dx * 0.4);
            return `M ${sx} ${sy} C ${sx + cpOffset} ${sy}, ${tx - cpOffset} ${ty}, ${tx} ${ty}`;
        } else {
            const loopOffset = 80 + Math.abs(ty - sy) * 0.3;
            const vertDir = sy > 200 ? -1 : 1;
            const midY = sy + vertDir * loopOffset;
            return `M ${sx} ${sy} C ${sx + loopOffset} ${sy}, ${sx + loopOffset} ${midY}, ${(sx + tx) / 2} ${midY} S ${tx - loopOffset} ${ty}, ${tx} ${ty}`;
        }
    }

    renderEndCloud(x, y, svg) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'end-cloud-group');
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x); rect.setAttribute('y', y - 16);
        rect.setAttribute('width', 80); rect.setAttribute('height', 32);
        rect.setAttribute('rx', 8); rect.setAttribute('ry', 8);
        rect.setAttribute('fill', '#3d4450'); rect.setAttribute('stroke', '#95a5a6');
        rect.setAttribute('stroke-width', '1.5');
        g.appendChild(rect);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 40); text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', '#bdc3c7');
        text.setAttribute('font-size', '12'); text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-style', 'italic'); text.textContent = 'Конец';
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
        rect.setAttribute('x', x); rect.setAttribute('y', y - 18);
        rect.setAttribute('width', 90); rect.setAttribute('height', 36);
        rect.setAttribute('rx', 8); rect.setAttribute('ry', 8);
        rect.setAttribute('fill', '#2d4a2d'); rect.setAttribute('stroke', '#27ae60');
        rect.setAttribute('stroke-width', '1.5');
        g.appendChild(rect);

        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('x', x + 14); icon.setAttribute('y', y + 5);
        icon.setAttribute('font-size', '14'); icon.textContent = '📜';
        g.appendChild(icon);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 52); text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', '#27ae60');
        text.setAttribute('font-size', '12'); text.setAttribute('font-weight', 'bold');
        text.textContent = 'Квест';
        g.appendChild(text);

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${quest.name} (${questId}) — клик для перехода`;
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
        this.els.connectionLayer.style.transform = transform;
        this.els.connectionLayer.style.transformOrigin = '0 0';
        this.els.nodeContainer.style.transform = transform;
        this.els.nodeContainer.style.transformOrigin = '0 0';
    }
    zoom(delta) {
        this.currentZoom = Math.max(0.2, Math.min(3, this.currentZoom + delta));
        this.applyCanvasTransform();
    }
    fitToScreen() {
        this.currentZoom = 1; this.canvasOffset = { x: 0, y: 0 };
        this.applyCanvasTransform();
    }

    // === RICH TEXT PARSER (Images, Size, Color, etc.) ===
    parseRichText(text) {
        if (!text) return '';
        // 1. экранируем HTML для безопасности
        let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
        
        // 2. распознаем и восстанавливаем наши теги
        html = html.replace(/&lt;image=(.*?)&gt;/g, '<img src="$1" class="rich-text-image" onerror="this.style.display=\'none\'">');
        html = html.replace(/&lt;size=(.*?)&gt;(.*?)&lt;\/size&gt;/g, '<span style="font-size: $1px">$2</span>');
        html = html.replace(/&lt;color=(.*?)&gt;(.*?)&lt;\/color&gt;/g, '<span style="color: $1">$2</span>');
        html = html.replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, '<b>$1</b>');
        html = html.replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/g, '<i>$1</i>');
        html = html.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/g, '<u>$1</u>');
        
        return html;
    }

    // === PREVIEW ===
    showPreview() {
        if (!this.selectedNode) { alert('Выберите диалог'); return; }
        this.previewHistory = [];
        this.currentPreviewNode = this.nodes.get(this.selectedNode);
        this.els.previewContent.innerHTML = this.generatePreview(this.currentPreviewNode, true);
        this.openModal('previewModal');
    }

    generatePreview(node, isRoot = false) {
        let html = '';
        if (!isRoot) html += `<div class="preview-back"><button data-action="preview-go-back">← Назад</button></div>`;
        html += `<div class="preview-profile">[ ${this.escapeHtml(node.id)} ]</div>`;
        html += `<div class="preview-npc-text">${this.parseRichText(node.text)}</div><div class="preview-options">`;

        node.options.forEach((option, index) => {
            const colorStyle = option.color && option.color !== '#ffffff' ? `style="color: ${option.color}"` : '';
            let transitionText = '', onClickAttr = '';
            if (option.transition) {
                transitionText = `→ ${this.escapeHtml(option.transition)}`;
                onClickAttr = `data-action="navigate" data-target="${this.escapeHtml(option.transition)}"`;
            } else if (option.questLink) {
                const quest = this.quests.get(option.questLink);
                transitionText = `📜 ${quest ? this.escapeHtml(quest.name) : option.questLink}`;
            }

            html += `
                <div class="preview-option" ${onClickAttr}>
                    ${option.icon ? `<div class="preview-option-icon" title="${this.escapeHtml(option.icon)}"></div>` : ''}
                    <span class="preview-option-number">${index + 1})</span>
                    <span class="preview-option-text" ${colorStyle}>${this.parseRichText(option.text)}</span>
                    ${transitionText ? `<span class="preview-option-transition">${transitionText}</span>` : ''}
                </div>`;
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
            this.els.previewContent.innerHTML = this.generatePreview(this.currentPreviewNode, this.previewHistory.length === 0);
        }
    }

    // === CONDITIONS & COMMANDS ===
    updateConditionParams() { this.renderParamInputs(this.els.conditionParams, this.getConditionParams(this.els.conditionType.value)); }
    updateCommandParams() { this.renderParamInputs(this.els.commandParams, this.getCommandParams(this.els.commandType.value)); }
    updateRequirementParams() { this.renderParamInputs(this.els.requirementParams, this.getConditionParams(this.els.requirementType.value)); }

    renderParamInputs(container, params) {
        container.innerHTML = params.map(name => `<div class="form-group"><label>${name}:</label><input type="text" class="form-control param-input" data-param="${name}" placeholder="${name}"></div>`).join('');
    }

    getConditionParams(type) {
        const map = { 'HasItem': ['ItemPrefab', 'Amount', 'ItemLevel'], 'NotHasItem': ['ItemPrefab', 'Amount', 'ItemLevel'], 'SkillMore': ['SkillName', 'MinLevel'], 'QuestFinished': ['QuestName'], 'HasQuest': ['QuestName'], 'GlobalKey': ['KeyName'] };
        return map[type] || [];
    }
    getCommandParams(type) {
        const map = { 'GiveItem': ['ItemPrefab', 'Amount', 'Level'], 'GiveQuest': ['QuestName'], 'FinishQuest': ['QuestID'], 'PlaySound': ['SoundName'], 'Spawn': ['PrefabName', 'Amount', 'Level'], 'Teleport': ['X', 'Y', 'Z'] };
        return map[type] || [];
    }

    saveCondition() {
        const option = this.nodes.get(this.selectedNode)?.options.find(o => o.id === this.selectedOption);
        if (!option) return;
        option.conditions.push({ type: this.els.conditionType.value, params: Array.from(this.els.conditionParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v) });
        this.renderConditionsList(option.conditions);
        this.closeAllModals();
        this.renderNodes();
    }

    saveCommand() {
        const option = this.nodes.get(this.selectedNode)?.options.find(o => o.id === this.selectedOption);
        if (!option) return;
        option.commands.push({ type: this.els.commandType.value, params: Array.from(this.els.commandParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v) });
        this.renderCommandsList(option.commands);
        this.closeAllModals();
        this.renderNodes();
    }

    renderConditionsList(conditions) {
        this.els.conditionsList.innerHTML = conditions.map((c, i) => `<div class="condition-item"><span>${c.type}(${c.params.join(', ')})</span><button data-action="delete-condition" data-index="${i}">×</button></div>`).join('');
    }
    renderCommandsList(commands) {
        this.els.commandsList.innerHTML = commands.map((c, i) => `<div class="command-item"><span>${c.type}(${c.params.join(', ')})</span><button data-action="delete-command" data-index="${i}">×</button></div>`).join('');
    }
    removeCondition(index) {
        const option = this.nodes.get(this.selectedNode)?.options.find(o => o.id === this.selectedOption);
        if (option) { option.conditions.splice(index, 1); this.renderConditionsList(option.conditions); this.renderNodes(); }
    }
    removeCommand(index) {
        const option = this.nodes.get(this.selectedNode)?.options.find(o => o.id === this.selectedOption);
        if (option) { option.commands.splice(index, 1); this.renderCommandsList(option.commands); this.renderNodes(); }
    }

    // === QUESTS ===
    addQuest() {
        const id = `Quest_${Date.now()}`;
        this.quests.set(id, { id, type: 'Kill', name: 'Новый квест', description: 'Описание...', targets: [], rewards: [], cooldown: '', timeLimit: '', requirements: [], autocomplete: false });
        this.renderQuestsList(); this.renderQuestPalette(); this.selectQuest(id);
    }
    selectQuest(id) {
        this.selectedQuest = id;
        document.querySelectorAll('.quest-item').forEach(el => el.classList.toggle('selected', el.dataset.id === id));
        this.renderQuestEditor();
    }
    renderQuestsList() {
        this.els.questsList.innerHTML = Array.from(this.quests.values()).map(q => `
            <div class="quest-item ${q.id === this.selectedQuest ? 'selected' : ''}" data-action="select-quest" data-id="${q.id}">
                <div class="quest-item-name">${this.escapeHtml(q.name)}</div><div class="quest-item-id">${this.escapeHtml(q.id)}</div>
            </div>`).join('');
    }
    renderQuestEditor() {
        const q = this.quests.get(this.selectedQuest);
        if (!q) { this.els.questEditor.innerHTML = '<div class="no-quest-selected"><p>Выберите квест</p></div>'; return; }

        const tHtml = q.targets.map((t, i) => `<div class="quest-target-item"><span>${this.escapeHtml(t.prefab)} x${t.amount}</span><button data-action="delete-quest-target" data-index="${i}">×</button></div>`).join('');
        const rHtml = q.rewards.map((r, i) => `<div class="quest-reward-item"><span>${r.type}: ${this.escapeHtml(r.prefab)} x${r.amount}</span><button data-action="delete-quest-reward" data-index="${i}">×</button></div>`).join('');
        const reqHtml = q.requirements.map((r, i) => `<div class="quest-requirement-item"><span>${r.type}(${r.params.join(', ')})</span><button data-action="delete-quest-req" data-index="${i}">×</button></div>`).join('');

        this.els.questEditor.innerHTML = `
            <div class="quest-form">
                <div class="quest-form-section">
                    <h4>Основное</h4>
                    <div class="form-group"><label>ID:</label><input type="text" class="form-control quest-id-input" value="${this.escapeHtml(q.id)}"></div>
                    <div class="form-group"><label>Тип:</label><select class="form-control quest-type-input">${['Kill','Collect','Harvest','Craft','Talk','Build','Move'].map(t => `<option value="${t}" ${q.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Название:</label><input type="text" class="form-control quest-name-input" value="${this.escapeHtml(q.name)}"></div>
                    <div class="form-group"><label>Описание:</label><textarea class="form-control quest-desc-input" rows="3">${this.escapeHtml(q.description)}</textarea></div>
                    <div class="form-group"><label><input type="checkbox" class="quest-auto-input" ${q.autocomplete ? 'checked' : ''}> Автозавершение</label></div>
                </div>
                <div class="quest-form-section"><h4>Цели</h4><div class="quest-targets">${tHtml || '<p>Нет</p>'}</div><button class="btn-small" data-action="show-quest-target-modal">+ Цель</button></div>
                <div class="quest-form-section"><h4>Награды</h4><div class="quest-rewards">${rHtml || '<p>Нет</p>'}</div><button class="btn-small" data-action="show-quest-reward-modal">+ Награда</button></div>
                <div class="quest-form-section"><h4>Требования</h4><div class="quest-requirements">${reqHtml || '<p>Нет</p>'}</div><button class="btn-small" data-action="show-quest-req-modal">+ Требование</button></div>
                <div class="quest-form-section"><h4>Время</h4>
                    <div class="form-group"><label>Кулдаун (дни):</label><input type="number" class="form-control quest-cd-input" value="${q.cooldown}"></div>
                    <div class="form-group"><label>Лимит (сек):</label><input type="number" class="form-control quest-tl-input" value="${q.timeLimit}"></div>
                </div>
                <button class="quest-preview-btn" data-action="show-quest-preview">Предпросмотр</button>
            </div>`;
        this.bindQuestFormEvents(q);
    }

    bindQuestFormEvents(q) {
        const qe = this.els.questEditor;
        const bind = (sel, prop, parser = v => v) => {
            const el = qe.querySelector(sel);
            if (el) {
                el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', (e) => {
                    q[prop] = parser(el.type === 'checkbox' ? e.target.checked : e.target.value);
                    if (prop === 'name' || prop === 'id') { this.renderQuestsList(); this.renderQuestPalette(); }
                });
            }
        };
        bind('.quest-id-input', 'id'); bind('.quest-type-input', 'type'); bind('.quest-name-input', 'name');
        bind('.quest-desc-input', 'description'); bind('.quest-auto-input', 'autocomplete');
        bind('.quest-cd-input', 'cooldown'); bind('.quest-tl-input', 'timeLimit');
    }

    saveQuestTarget() {
        const q = this.quests.get(this.selectedQuest); if (!q) return;
        const prefab = this.els.targetPrefab.value.trim(); if (!prefab) { alert('Введите префаб'); return; }
        q.targets.push({ prefab, amount: this.els.targetAmount.value || '1' });
        this.closeAllModals(); this.renderQuestEditor();
    }
    saveQuestReward() {
        const q = this.quests.get(this.selectedQuest); if (!q) return;
        const prefab = this.els.rewardPrefab.value.trim(); if (!prefab) { alert('Введите префаб'); return; }
        q.rewards.push({ type: this.els.rewardType.value, prefab, amount: this.els.rewardAmount.value || '1' });
        this.closeAllModals(); this.renderQuestEditor();
    }
    saveQuestRequirement() {
        const q = this.quests.get(this.selectedQuest); if (!q) return;
        const params = Array.from(this.els.requirementParams.querySelectorAll('.param-input')).map(i => i.value).filter(v => v);
        if (params.length === 0) { alert('Заполните параметры'); return; }
        q.requirements.push({ type: this.els.requirementType.value, params });
        this.closeAllModals(); this.renderQuestEditor();
    }
    deleteQuestTarget(i) { const q = this.quests.get(this.selectedQuest); if (q) { q.targets.splice(i, 1); this.renderQuestEditor(); } }
    deleteQuestReward(i) { const q = this.quests.get(this.selectedQuest); if (q) { q.rewards.splice(i, 1); this.renderQuestEditor(); } }
    deleteQuestRequirement(i) { const q = this.quests.get(this.selectedQuest); if (q) { q.requirements.splice(i, 1); this.renderQuestEditor(); } }

    showQuestPreview() {
        if (!this.selectedQuest) { alert('Выберите квест'); return; }
        this.els.questPreviewContent.innerHTML = this.generateQuestPreview();
        this.openModal('questPreviewModal');
    }

    generateQuestPreview() {
        const q = this.quests.get(this.selectedQuest); if (!q) return '';
        const qList = Array.from(this.quests.values()).map(qq => `<div class="quest-preview-list-item ${qq.id === q.id ? 'selected' : ''}" data-action="preview-select-quest" data-id="${qq.id}">${this.escapeHtml(qq.name)}</div>`).join('');
        const tHtml = q.targets.map(t => `<div class="quest-preview-objective"><span>${this.escapeHtml(t.prefab)}</span><span>x${t.amount}</span></div>`).join('');
        const rHtml = q.rewards.map(r => `<div class="quest-preview-reward"><span>${this.escapeHtml(r.prefab)}</span><span>x${r.amount}</span></div>`).join('');

        return `
            <div class="quest-preview-content">
                <div class="quest-preview-sidebar"><h3>Квесты</h3><div class="quest-preview-list">${qList}</div></div>
                <div class="quest-preview-details">
                    <div class="quest-preview-title">${this.escapeHtml(q.name)}</div>
                    ${this.parseRichText(q.description)}
                    <div class="quest-preview-separator"></div>
                    <div class="quest-preview-section"><h4>Что нужно сделать:</h4><div class="quest-preview-objectives">${tHtml || '<p>Нет</p>'}</div></div>
                    <div class="quest-preview-separator"></div>
                    <div class="quest-preview-section"><h4>Вознаграждение:</h4><div class="quest-preview-rewards">${rHtml || '<p>Нет</p>'}</div></div>
                    <button class="quest-preview-accept-btn">Взять квест</button>
                </div>
            </div>`;
    }

    previewSelectQuest(id) { this.selectedQuest = id; this.renderQuestsList(); this.els.questPreviewContent.innerHTML = this.generateQuestPreview(); }

    // === EXPORT / IMPORT / CFG GENERATION ===
    generateCfgContent() {
        let cfg = '';
        // диалоги
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

        // квесты
        this.quests.forEach(q => {
            cfg += `[${q.id}${q.autocomplete ? '=autocomplete' : ''}]\n`;
            cfg += `${q.type}\n`;
            cfg += `${q.name}\n`;
            cfg += `${q.description}\n`;
            cfg += q.targets.length ? q.targets.map(t => `${t.prefab},${t.amount},${t.level || ''}`).join(' | ') : 'None';
            cfg += '\n';
            cfg += q.rewards.length ? q.rewards.map(r => `${r.type}:${r.prefab},${r.amount}`).join(' | ') : 'None';
            cfg += '\n';
            cfg += (q.cooldown || q.timeLimit) ? `${q.cooldown},${q.timeLimit}` : 'None';
            cfg += '\n';
            cfg += q.requirements.length ? q.requirements.map(r => `${r.type}:${r.params.join(',')}`).join(' | ') : 'None';
            cfg += '\n\n';
        });
        return cfg.trim();
    }

    exportCfg() { this.downloadFile('config.cfg', this.generateCfgContent()); }

    handleDialogueFileImport(e) {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { this.parseDialogueCfg(ev.target.result); this.render(); };
        reader.readAsText(file); e.target.value = '';
    }

    handleQuestFileImport(e) {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { this.parseQuestCfg(ev.target.result); this.render(); };
        reader.readAsText(file); e.target.value = '';
    }

    parseDialogueCfg(content) {
        const blocks = content.split(/\n(?=\[)/);
        blocks.forEach(block => {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length === 0) return;
            const firstLine = lines[0];
            if (!firstLine.startsWith('[') || !firstLine.endsWith(']')) return;
            const nodeId = firstLine.slice(1, -1).trim();
            if (!nodeId || this.nodes.has(nodeId)) return;

            const node = { id: nodeId, text: '', options: [], x: 100 + (this.nodes.size % 5) * 300, y: 100 + Math.floor(this.nodes.size / 5) * 300, collapsed: false };
            if (lines.length > 1 && !lines[1].startsWith('Text:')) node.text = lines[1];

            for (let i = 2; i < lines.length; i++) {
                if (lines[i].startsWith('Text:')) this.parseOptionLine(node, lines[i]);
            }
            this.nodes.set(nodeId, node);
        });
        this.updateTransitionsList();
    }

    parseOptionLine(node, line) {
        const parts = line.split('|').map(p => p.trim());
        const textPart = parts.find(p => p.startsWith('Text:'));
        if (!textPart) return;
        const option = { id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, text: textPart.substring(5).trim(), transition: '', questLink: '', icon: '', color: '#ffffff', conditions: [], commands: [] };
        parts.forEach(part => {
            if (part.startsWith('Transition:')) option.transition = part.substring(11).trim();
            else if (part.startsWith('QuestLink:')) option.questLink = part.substring(10).trim();
            else if (part.startsWith('Icon:')) option.icon = part.substring(5).trim();
            else if (part.startsWith('Color:')) {
                const rgb = part.substring(6).trim().split(',').map(c => parseInt(c.trim()));
                if (rgb.length === 3) option.color = '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
            }
            else if (part.startsWith('Condition:')) option.conditions.push({ type: part.substring(10).trim().split(',')[0], params: part.substring(10).trim().split(',').slice(1) });
            else if (part.startsWith('Command:')) option.commands.push({ type: part.substring(8).trim().split(',')[0], params: part.substring(8).trim().split(',').slice(1) });
        });
        node.options.push(option);
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
                    if (tl && tl !== 'None') tl.split('|').map(p => p.trim()).forEach(p => { const d = p.split(','); q.targets.push({ prefab: d[0] || '', amount: d[1] || '1', level: d[2] || '' }); });
                    i++;
                }
                if (i < lines.length) {
                    const rl = lines[i].trim();
                    if (rl && rl !== 'None') rl.split('|').map(p => p.trim()).forEach(p => { const d = p.split(':'); if (d.length >= 2) { const ps = d[1].split(','); q.rewards.push({ type: d[0], prefab: ps[0] || '', amount: ps[1] || '1' }); } });
                    i++;
                }
                if (i < lines.length) {
                    const tl = lines[i].trim();
                    if (tl && tl !== 'None') { const d = tl.split(','); q.cooldown = d[0] || ''; q.timeLimit = d[1] || ''; }
                    i++;
                }
                if (i < lines.length) {
                    const rl = lines[i].trim();
                    if (rl && rl !== 'None') rl.split('|').map(p => p.trim()).forEach(p => { const d = p.split(':'); q.requirements.push({ type: d[0], params: d.length > 1 ? d[1].split(',').map(x => x.trim()) : [] }); });
                    i++;
                }
                this.quests.set(q.id, q);
            } else { i++; }
        }
        this.renderQuestsList();
        this.renderQuestPalette();
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
        if (errors.length === 0) alert('Ошибок не найдено!');
        else alert('⚠ Ошибки:\n\n' + errors.join('\n'));
    }

    searchDialogue(query) {
        if (!query.trim()) { document.querySelectorAll('.dialogue-node').forEach(el => el.style.opacity = '1'); return; }
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
        this.nodes.clear(); this.quests.clear();

        const n1 = this.addNode('Start', 100, 150);
        n1.text = 'Приветствую, путник!\\nЧем могу помочь?';
        const o1 = this.addOptionToNode('Start', 'Расскажи о себе'); o1.transition = 'About';
        const o2 = this.addOptionToNode('Start', '<color=#f1c40f>Есть работа?</color>'); o2.transition = 'QuestOffer'; o2.color = '#f1c40f'; o2.icon = 'Hammer';
        const o3 = this.addOptionToNode('Start', 'Прощай');

        const n2 = this.addNode('About', 500, 100);
        n2.text = 'Я кузнец, работаю здесь 20 лет.\\nМогу сделать любое оружие.';
        this.addOptionToNode('About', 'Назад').transition = 'Start';

        const n3 = this.addNode('QuestOffer', 500, 300);
        n3.text = 'Есть дельце...\\nНужно принести <color=#e74c3c>10 шкур кабана</color>.\\n<image=https://via.placeholder.com/150>';
        const o5 = this.addOptionToNode('QuestOffer', 'Берусь!'); o5.questLink = 'BoarHunt';
        const o6 = this.addOptionToNode('QuestOffer', 'Не сейчас'); o6.transition = 'Start';

        const n4 = this.addNode('Accepted', 900, 300);
        n4.text = 'Отлично! Жду с добычей.';
        this.addOptionToNode('Accepted', 'До встречи');

        this.quests.set('BoarHunt', {
            id: 'BoarHunt', type: 'Kill', name: 'Охота на кабанов',
            description: 'Принеси кузнецу 10 шкур кабана.\\n<image=https://via.placeholder.com/150>',
            targets: [{ prefab: 'Boar', amount: '10', level: '' }],
            rewards: [{ type: 'Item', prefab: 'Coins', amount: '100' }],
            cooldown: '1', timeLimit: '', requirements: [], autocomplete: false
        });

        this.render();
    }

    escapeHtml(text) { if (!text) return ''; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
    hexToRgb(hex) { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null; }
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => { window.editor = new DialogueEditor(); });
