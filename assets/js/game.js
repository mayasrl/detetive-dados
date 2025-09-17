/**
 * DETETIVE DE DADOS - GAME MANAGER
 * 
 * Sistema principal de gerenciamento do jogo educacional SQL
 * Responsável por:
 * - Inicialização de casos
 * - Validação de consultas SQL
 * - Progressão entre casos
 * - Sistema de conquistas
 * - Interface do usuário
 */

class GameManager {
    constructor() {
        this.currentCase = null;
        this.caseState = {
            id: 0,
            completed: false,
            hintsUsed: 0,
            attempts: 0,
            startTime: Date.now()
        };
    }

    /**
     * Inicializa um caso específico
     * @param {Object} caseConfig - Configuração do caso
     */
    initializeCase(caseConfig) {
        this.currentCase = caseConfig;
        this.caseState = {
            id: caseConfig.id,
            completed: false,
            hintsUsed: 0,
            attempts: 0,
            startTime: Date.now()
        };

        console.log(`🔄 Inicializando Caso ${caseConfig.id}: ${caseConfig.title}`);
        
        // Inicializar banco de dados
        this.initializeDatabase();
        
        // Verificar se o caso já foi completado
        this.checkCaseCompletion();
        
        // Configurar eventos da interface
        this.setupEventListeners();
        
        console.log(`✅ Caso ${caseConfig.id} inicializado com sucesso`);
    }

    /**
     * Inicializa o banco de dados
     */
    async initializeDatabase() {
        try {
            if (window.gameDB) {
                const initialized = await window.gameDB.initialize();
                if (!initialized) {
                    throw new Error('Falha ao inicializar banco de dados');
                }
            } else {
                throw new Error('gameDB não encontrado');
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar banco:', error);
            this.showError('Erro ao carregar o banco de dados. Recarregue a página.');
        }
    }

    /**
     * Configura os event listeners da interface
     */
    setupEventListeners() {
        // Enter no input SQL
        const sqlInput = document.getElementById('sql-input');
        if (sqlInput) {
            sqlInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.executeQuery();
                }
            });
        }

        // Botão executar
        const executeBtn = document.querySelector('.execute-btn');
        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.executeQuery());
        }
    }

    /**
     * Adiciona texto ao campo de input SQL
     * @param {string} text - Texto a ser adicionado
     */
    addToQuery(text) {
        const input = document.getElementById('sql-input');
        if (!input) return;
        
        const currentValue = input.value.trim();
        
        // Lógica para construir a consulta corretamente
        if (currentValue === '') {
            input.value = text;
        } else if (text === '*' && currentValue.endsWith('SELECT')) {
            input.value = currentValue + ' *';
        } else if (text === 'FROM' && currentValue.includes('SELECT')) {
            input.value = currentValue + ' FROM';
        } else if (text === 'cidadaos' && currentValue.includes('FROM')) {
            input.value = currentValue + ' cidadaos';
        } else if (text === ',' && !currentValue.endsWith(',')) {
            input.value = currentValue + ',';
        } else if (text !== ',' && currentValue.endsWith(',')) {
            input.value = currentValue + ' ' + text;
        } else {
            input.value = currentValue + ' ' + text;
        }
        
        // Focar no input
        input.focus();
    }

    /**
     * Limpa o campo de input SQL
     */
    clearQuery() {
        const input = document.getElementById('sql-input');
        if (input) {
            input.value = '';
            input.focus();
        }
    }

    /**
     * Executa a consulta SQL digitada pelo usuário
     */
    async executeQuery() {
        const input = document.getElementById('sql-input');
        if (!input) return;
        
        const sql = input.value.trim();
        
        if (!sql) {
            this.showError('Digite uma consulta SQL primeiro.');
            return;
        }
        
        this.caseState.attempts++;
        console.log(`🔍 Tentativa ${this.caseState.attempts}: ${sql}`);
        
        try {
            // Executar consulta no banco
            const results = window.gameDB.executeQuery(sql);
            
            // Exibir resultados
            this.displayResults(results);
            
            // Validar se a consulta está correta
            this.validateCaseQuery(sql);
            
        } catch (error) {
            console.error('❌ Erro na consulta:', error);
            this.showError(`Erro na consulta SQL: ${error.message}`);
        }
    }

    /**
     * Valida se a consulta resolve o caso atual
     * @param {string} sql - Consulta SQL do usuário
     */
    validateCaseQuery(sql) {
        if (!this.currentCase) return;
        
        // Normalizar consulta para comparação
        const normalizedQuery = sql.toLowerCase().trim().replace(/\s+/g, ' ');
        const expectedQuery = this.currentCase.expectedQuery.toLowerCase().trim().replace(/\s+/g, ' ');
        
        console.log('🔍 Validando consulta:');
        console.log('   Usuário:', normalizedQuery);
        console.log('   Esperado:', expectedQuery);
        
        // Verificar se a consulta está correta
        if (normalizedQuery === expectedQuery) {
            // Caso resolvido com sucesso!
            this.completeCaseSuccess();
        } else {
            // Consulta incorreta, dar feedback específico
            this.provideFeedback(normalizedQuery, expectedQuery);
            
            // Sugerir dica se muitas tentativas
            if (this.caseState.attempts >= 3) {
                this.suggestHint();
            }
        }
    }

    /**
     * Fornece feedback específico baseado na consulta do usuário
     * @param {string} userQuery - Consulta do usuário
     * @param {string} expectedQuery - Consulta esperada
     */
    provideFeedback(userQuery, expectedQuery) {
        let feedback = 'A consulta não resolve o caso. ';
        
        // Feedback específico baseado no que está faltando
        if (!userQuery.includes('select')) {
            feedback += 'Lembre-se de usar SELECT para escolher os dados.';
        } else if (!userQuery.includes('from')) {
            feedback += 'Não esqueça de especificar a tabela com FROM.';
        } else if (expectedQuery.includes('where') && !userQuery.includes('where')) {
            feedback += 'Este caso requer filtrar os dados com WHERE.';
        } else if (expectedQuery.includes('join') && !userQuery.includes('join')) {
            feedback += 'Este caso requer relacionar tabelas com JOIN.';
        } else if (expectedQuery.includes('group by') && !userQuery.includes('group by')) {
            feedback += 'Este caso requer agrupar dados com GROUP BY.';
        } else if (expectedQuery.includes('order by') && !userQuery.includes('order by')) {
            feedback += 'Este caso requer ordenar dados com ORDER BY.';
        } else if (expectedQuery.includes('like') && !userQuery.includes('like')) {
            feedback += 'Este caso requer busca por padrão com LIKE.';
        } else if (expectedQuery.includes('in') && !userQuery.includes('in')) {
            feedback += 'Este caso requer seleção múltipla com IN.';
        } else {
            feedback += 'Verifique a sintaxe e os valores na sua consulta.';
        }
        
        this.showError(feedback);
    }

    /**
     * Marca o caso como completado com sucesso
     */
    completeCaseSuccess() {
        this.caseState.completed = true;
        
        // Atualizar interface - status do caso
        const statusEl = document.getElementById('case-status');
        if (statusEl) {
            statusEl.textContent = 'RESOLVIDO';
            statusEl.className = 'case-status completed';
            statusEl.style.backgroundColor = '#00ff88';
            statusEl.style.color = '#000';
        }
        
        // Habilitar próximo caso - IMPORTANTE: só habilita quando completa
        const nextBtn = document.getElementById('next-case-btn');
        if (nextBtn) {
            nextBtn.classList.remove('disabled');
            nextBtn.style.pointerEvents = 'auto';
            nextBtn.style.opacity = '1';
            nextBtn.style.backgroundColor = '#00ff88';
            nextBtn.style.color = '#000';
        }
        
        // Salvar progresso
        this.saveCaseProgress();
        
        // Mostrar conquista
        this.showAchievement(this.currentCase.achievement, 'Você completou este caso com sucesso!');
        
        // Mostrar mensagem de sucesso específica
        let successMessage = '🎉 Excelente! Você resolveu o caso!';
        if (this.currentCase.nextCase) {
            successMessage += ' O botão "PRÓXIMO CASO" foi habilitado. Clique nele para continuar a investigação.';
        } else {
            successMessage += ' Parabéns por completar todos os casos! Agora você pode fazer o quiz final.';
        }
        this.showSuccess(successMessage);
        
        console.log(`✅ Caso ${this.caseState.id} completado com sucesso!`);
        
        // Animar o botão próximo caso para chamar atenção
        if (nextBtn) {
            nextBtn.style.animation = 'pulse 2s infinite';
            setTimeout(() => {
                if (nextBtn.style) {
                    nextBtn.style.animation = '';
                }
            }, 6000);
        }
    }

    /**
     * Exibe os resultados da consulta SQL
     * @param {Array} results - Resultados da consulta
     */
    displayResults(results) {
        const container = document.getElementById('results-content');
        const counter = document.getElementById('results-count');
        
        if (!container || !counter) return;
        
        if (!results || results.length === 0) {
            container.innerHTML = '<div class="no-results">Nenhum resultado encontrado.</div>';
            counter.textContent = '0 registros';
            return;
        }
        
        const result = results[0];
        const { columns, values } = result;
        
        // Criar tabela HTML
        let tableHTML = '<table class="results-table">';
        
        // Cabeçalho
        tableHTML += '<thead><tr>';
        columns.forEach(col => {
            tableHTML += `<th>${col}</th>`;
        });
        tableHTML += '</tr></thead>';
        
        // Dados
        tableHTML += '<tbody>';
        values.forEach(row => {
            tableHTML += '<tr>';
            row.forEach(cell => {
                tableHTML += `<td>${cell || ''}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        
        container.innerHTML = tableHTML;
        counter.textContent = `${values.length} registros encontrados`;
        
        console.log(`📊 Exibindo ${values.length} registros`);
    }

    /**
     * Mostra/esconde dicas opcionais
     * @param {string} hintId - ID da dica
     */
    toggleHint(hintId) {
        const hintContent = document.getElementById(hintId);
        const button = document.querySelector(`[onclick*="${hintId}"]`);
        
        if (!hintContent || !button) return;
        
        if (hintContent.style.display === 'none') {
            hintContent.style.display = 'block';
            button.textContent = '💡 ESCONDER DICA';
            button.classList.add('expanded');
            this.caseState.hintsUsed++;
            console.log('💡 Dica mostrada');
        } else {
            hintContent.style.display = 'none';
            button.textContent = '💡 MOSTRAR DICA (Opcional)';
            button.classList.remove('expanded');
        }
    }

    /**
     * Sugere mostrar dica após várias tentativas
     */
    suggestHint() {
        if (this.caseState.hintsUsed === 0) {
            this.showError('💡 Dica: Que tal dar uma olhada na dica opcional? Pode ajudar!');
        }
    }

    /**
     * Verifica se o caso já foi completado anteriormente
     */
    checkCaseCompletion() {
        const completed = localStorage.getItem(`case_${this.caseState.id}_completed`);
        if (completed === 'true') {
            this.caseState.completed = true;
            
            // Atualizar interface para caso já completado
            const statusEl = document.getElementById('case-status');
            if (statusEl) {
                statusEl.textContent = 'RESOLVIDO';
                statusEl.className = 'case-status completed';
                statusEl.style.backgroundColor = '#00ff88';
                statusEl.style.color = '#000';
            }
            
            // Habilitar próximo caso se já foi completado
            const nextBtn = document.getElementById('next-case-btn');
            if (nextBtn) {
                nextBtn.classList.remove('disabled');
                nextBtn.style.pointerEvents = 'auto';
                nextBtn.style.opacity = '1';
                nextBtn.style.backgroundColor = '#00ff88';
                nextBtn.style.color = '#000';
            }
            
            console.log(`✅ Caso ${this.caseState.id} já foi completado anteriormente`);
        } else {
            // Garantir que o botão próximo caso esteja desabilitado
            const nextBtn = document.getElementById('next-case-btn');
            if (nextBtn) {
                nextBtn.classList.add('disabled');
                nextBtn.style.pointerEvents = 'none';
                nextBtn.style.opacity = '0.5';
                nextBtn.style.backgroundColor = '#333';
                nextBtn.style.color = '#666';
            }
        }
    }

    /**
     * Salva o progresso do caso no localStorage
     */
    saveCaseProgress() {
        localStorage.setItem(`case_${this.caseState.id}_completed`, 'true');
        
        const progress = {
            caseId: this.caseState.id,
            completedAt: new Date().toISOString(),
            attempts: this.caseState.attempts,
            hintsUsed: this.caseState.hintsUsed,
            timeSpent: Date.now() - this.caseState.startTime
        };
        
        localStorage.setItem(`case_${this.caseState.id}_progress`, JSON.stringify(progress));
        console.log(`💾 Progresso do caso ${this.caseState.id} salvo`);
    }

    /**
     * Mostra notificação de conquista
     * @param {string} title - Título da conquista
     * @param {string} description - Descrição da conquista
     */
    showAchievement(title, description) {
        const achievement = document.getElementById('achievement');
        if (!achievement) return;
        
        const titleEl = achievement.querySelector('.achievement-title');
        const descEl = achievement.querySelector('.achievement-description');
        
        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = description;
        
        achievement.classList.add('show');
        
        setTimeout(() => {
            achievement.classList.remove('show');
        }, 4000);
    }

    /**
     * Mostra mensagem de sucesso
     * @param {string} message - Mensagem a ser exibida
     */
    showSuccess(message) {
        const container = document.getElementById('results-content');
        if (!container) return;
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            background: #00ff88;
            color: #000;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-weight: bold;
        `;
        
        container.insertBefore(successDiv, container.firstChild);
        
        // Remover após 8 segundos
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 8000);
    }

    /**
     * Mostra mensagem de erro
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        const container = document.getElementById('results-content');
        if (!container) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #ff4757;
            color: #fff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-weight: bold;
        `;
        
        container.insertBefore(errorDiv, container.firstChild);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Criar instância global do GameManager
window.gameManager = new GameManager();

// Funções globais para compatibilidade com HTML inline
function addToQuery(text) {
    window.gameManager.addToQuery(text);
}

function clearQuery() {
    window.gameManager.clearQuery();
}

function executeQuery() {
    window.gameManager.executeQuery();
}

function toggleHint(hintId) {
    window.gameManager.toggleHint(hintId);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        window.gameManager.executeQuery();
    }
}

console.log('🎮 Game Manager carregado com sucesso');

