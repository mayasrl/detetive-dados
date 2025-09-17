// Database.js - Configuração e inicialização do banco de dados SQL para o jogo
// Detetive de Dados: O Mistério da Tabela Perdida

class GameDatabase {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.fallbackData = null;
    }

    /**
     * Inicializa o banco de dados SQL.js
     * @returns {Promise<boolean>} True se inicializado com sucesso
     */
    async initialize() {
        try {
            console.log('🔄 Inicializando banco de dados...');
            
            // Verificar se initSqlJs está disponível
            if (typeof initSqlJs === 'undefined') {
                console.warn('⚠️ SQL.js não encontrado, usando modo fallback');
                this.createFallbackData();
                this.isInitialized = true;
                return true;
            }

            // Inicializar SQL.js com configuração de localização dos arquivos
            const SQL = await initSqlJs({
                locateFile: file => {
                    console.log(`📁 Carregando arquivo: ${file}`);
                    return `assets/js/${file}`;
                }
            });
            
            console.log('✅ SQL.js inicializado com sucesso');
            
            // Criar banco de dados em memória
            this.db = new SQL.Database();
            console.log('✅ Banco de dados criado');
            
            // Criar tabelas e inserir dados
            this.createTables();
            this.insertInitialData();
            
            this.isInitialized = true;
            console.log('✅ Banco de dados inicializado completamente!');
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao inicializar banco de dados:', error);
            
            // Fallback: criar dados simulados
            console.log('🔄 Usando modo fallback...');
            this.createFallbackData();
            this.isInitialized = true;
            return true;
        }
    }

    /**
     * Cria dados simulados caso o SQL.js não funcione
     */
    createFallbackData() {
        this.fallbackData = {
            cidadaos: [
                {id: 1, nome: 'X-7 Androide', tipo: 'androide', cor: 'prata', cidade: 'Neon-City', idade: 5, profissao: 'segurança', status: 'desaparecido'},
                {id: 2, nome: 'Maya Chen', tipo: 'humano', cor: 'morena', cidade: 'Neon-City', idade: 28, profissao: 'programadora', status: 'ativo'},
                {id: 3, nome: 'Zara-9', tipo: 'androide', cor: 'azul', cidade: 'Cyber-District', idade: 3, profissao: 'analista', status: 'ativo'},
                {id: 4, nome: 'João Silva', tipo: 'humano', cor: 'branco', cidade: 'Neon-City', idade: 35, profissao: 'detetive', status: 'ativo'},
                {id: 5, nome: 'R2-Unit', tipo: 'robô', cor: 'vermelho', cidade: 'Tech-Zone', idade: 7, profissao: 'manutenção', status: 'ativo'},
                {id: 6, nome: 'Ana Santos', tipo: 'humano', cor: 'negra', cidade: 'Neon-City', idade: 42, profissao: 'médica', status: 'ativo'},
                {id: 7, nome: 'Cyber-Cat', tipo: 'pet-bot', cor: 'dourado', cidade: 'Neon-City', idade: 2, profissao: 'companhia', status: 'ativo'},
                {id: 8, nome: 'Marcus Webb', tipo: 'humano', cor: 'branco', cidade: 'Old-Town', idade: 55, profissao: 'comerciante', status: 'ativo'},
                {id: 9, nome: 'Luna-X1', tipo: 'androide', cor: 'branco', cidade: 'Sky-City', idade: 4, profissao: 'piloto', status: 'ativo'},
                {id: 10, nome: 'Carlos Mendez', tipo: 'humano', cor: 'moreno', cidade: 'Cyber-District', idade: 31, profissao: 'engenheiro', status: 'ativo'}
            ],
            veiculos: [
                {id: 1, modelo: 'Hover-Car X1', cor: 'azul', proprietario_id: 2, ano: 2089, tipo: 'pessoal'},
                {id: 2, modelo: 'Cyber-Bike', cor: 'vermelho', proprietario_id: 4, ano: 2090, tipo: 'trabalho'},
                {id: 3, modelo: 'Sky-Transport', cor: 'branco', proprietario_id: 9, ano: 2091, tipo: 'comercial'},
                {id: 4, modelo: 'Ground-Vehicle', cor: 'preto', proprietario_id: 8, ano: 2088, tipo: 'pessoal'},
                {id: 5, modelo: 'Patrol-Unit', cor: 'azul', proprietario_id: 4, ano: 2090, tipo: 'policial'}
            ],
            crimes: [
                {id: 1, tipo: 'desaparecimento', local: 'Base Central', data_ocorrencia: '2091-09-15', suspeito_id: 1, resolvido: 0, descricao: 'Androide X-7 desapareceu misteriosamente'},
                {id: 2, tipo: 'roubo', local: 'Tech-Zone', data_ocorrencia: '2091-09-14', suspeito_id: null, resolvido: 0, descricao: 'Equipamentos de alta tecnologia foram roubados'},
                {id: 3, tipo: 'invasão', local: 'Cyber-District', data_ocorrencia: '2091-09-13', suspeito_id: null, resolvido: 0, descricao: 'Sistema de segurança foi comprometido'}
            ]
        };
        
        this.isInitialized = true;
        console.log('✅ Dados de fallback criados');
    }

    /**
     * Cria as tabelas do banco de dados
     */
    createTables() {
        if (!this.db) return;
        
        try {
            // Tabela de cidadãos (para os primeiros casos)
            this.db.run(`
                CREATE TABLE cidadaos (
                    id INTEGER PRIMARY KEY,
                    nome TEXT NOT NULL,
                    tipo TEXT NOT NULL,
                    cor TEXT,
                    cidade TEXT NOT NULL,
                    idade INTEGER,
                    profissao TEXT,
                    status TEXT DEFAULT 'ativo'
                )
            `);

            // Tabela de veículos (para casos de JOIN)
            this.db.run(`
                CREATE TABLE veiculos (
                    id INTEGER PRIMARY KEY,
                    modelo TEXT NOT NULL,
                    cor TEXT NOT NULL,
                    proprietario_id INTEGER,
                    ano INTEGER,
                    tipo TEXT,
                    FOREIGN KEY (proprietario_id) REFERENCES cidadaos(id)
                )
            `);

            // Tabela de crimes (para casos avançados)
            this.db.run(`
                CREATE TABLE crimes (
                    id INTEGER PRIMARY KEY,
                    tipo TEXT NOT NULL,
                    local TEXT NOT NULL,
                    data_ocorrencia DATE,
                    suspeito_id INTEGER,
                    resolvido BOOLEAN DEFAULT 0,
                    descricao TEXT,
                    FOREIGN KEY (suspeito_id) REFERENCES cidadaos(id)
                )
            `);

            // Tabela de evidências
            this.db.run(`
                CREATE TABLE evidencias (
                    id INTEGER PRIMARY KEY,
                    crime_id INTEGER,
                    tipo TEXT NOT NULL,
                    descricao TEXT,
                    encontrada_por TEXT,
                    data_coleta DATE,
                    FOREIGN KEY (crime_id) REFERENCES crimes(id)
                )
            `);

            console.log('📋 Tabelas criadas com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao criar tabelas:', error);
            throw error;
        }
    }

    /**
     * Insere os dados iniciais nas tabelas
     */
    insertInitialData() {
        if (!this.db) return;
        
        try {
            // Dados dos cidadãos
            const cidadaos = [
                [1, 'X-7 Androide', 'androide', 'prata', 'Neon-City', 5, 'segurança', 'desaparecido'],
                [2, 'Maya Chen', 'humano', 'morena', 'Neon-City', 28, 'programadora', 'ativo'],
                [3, 'Zara-9', 'androide', 'azul', 'Cyber-District', 3, 'analista', 'ativo'],
                [4, 'João Silva', 'humano', 'branco', 'Neon-City', 35, 'detetive', 'ativo'],
                [5, 'R2-Unit', 'robô', 'vermelho', 'Tech-Zone', 7, 'manutenção', 'ativo'],
                [6, 'Ana Santos', 'humano', 'negra', 'Neon-City', 42, 'médica', 'ativo'],
                [7, 'Cyber-Cat', 'pet-bot', 'dourado', 'Neon-City', 2, 'companhia', 'ativo'],
                [8, 'Marcus Webb', 'humano', 'branco', 'Old-Town', 55, 'comerciante', 'ativo'],
                [9, 'Luna-X1', 'androide', 'branco', 'Sky-City', 4, 'piloto', 'ativo'],
                [10, 'Carlos Mendez', 'humano', 'moreno', 'Cyber-District', 31, 'engenheiro', 'ativo']
            ];

            const stmt = this.db.prepare(`
                INSERT INTO cidadaos (id, nome, tipo, cor, cidade, idade, profissao, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            cidadaos.forEach(cidadao => {
                stmt.run(cidadao);
            });
            stmt.free();

            // Dados dos veículos
            const veiculos = [
                [1, 'Hover-Car X1', 'azul', 2, 2089, 'pessoal'],
                [2, 'Cyber-Bike', 'vermelho', 4, 2090, 'trabalho'],
                [3, 'Sky-Transport', 'branco', 9, 2091, 'comercial'],
                [4, 'Ground-Vehicle', 'preto', 8, 2088, 'pessoal'],
                [5, 'Patrol-Unit', 'azul', 4, 2090, 'policial']
            ];

            const stmtVeiculos = this.db.prepare(`
                INSERT INTO veiculos (id, modelo, cor, proprietario_id, ano, tipo) 
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            veiculos.forEach(veiculo => {
                stmtVeiculos.run(veiculo);
            });
            stmtVeiculos.free();

            // Dados dos crimes
            const crimes = [
                [1, 'desaparecimento', 'Base Central', '2091-09-15', 1, 0, 'Androide X-7 desapareceu misteriosamente'],
                [2, 'roubo', 'Tech-Zone', '2091-09-14', null, 0, 'Equipamentos de alta tecnologia foram roubados'],
                [3, 'invasão', 'Cyber-District', '2091-09-13', null, 0, 'Sistema de segurança foi comprometido']
            ];

            const stmtCrimes = this.db.prepare(`
                INSERT INTO crimes (id, tipo, local, data_ocorrencia, suspeito_id, resolvido, descricao) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            crimes.forEach(crime => {
                stmtCrimes.run(crime);
            });
            stmtCrimes.free();

            // Dados das evidências
            const evidencias = [
                [1, 1, 'digital', 'Logs de acesso comprometidos', 'Sistema', '2091-09-15'],
                [2, 1, 'física', 'Fragmento de metal encontrado', 'Detetive Silva', '2091-09-15'],
                [3, 2, 'digital', 'Rastro de IP suspeito', 'Sistema', '2091-09-14'],
                [4, 3, 'digital', 'Código malicioso identificado', 'Analista Zara-9', '2091-09-13']
            ];

            const stmtEvidencias = this.db.prepare(`
                INSERT INTO evidencias (id, crime_id, tipo, descricao, encontrada_por, data_coleta) 
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            evidencias.forEach(evidencia => {
                stmtEvidencias.run(evidencia);
            });
            stmtEvidencias.free();

            console.log('📊 Dados iniciais inseridos com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inserir dados:', error);
            throw error;
        }
    }

    /**
     * Executa uma consulta SQL
     * @param {string} sql - Consulta SQL a ser executada
     * @returns {Array} Resultados da consulta
     */
    executeQuery(sql) {
        if (!this.isInitialized) {
            throw new Error('Banco de dados não foi inicializado');
        }

        try {
            // Se temos o banco SQL.js funcionando
            if (this.db) {
                const results = this.db.exec(sql);
                return results;
            }
            
            // Fallback: simular consultas básicas
            return this.simulateQuery(sql);
            
        } catch (error) {
            console.error('❌ Erro na consulta SQL:', error);
            throw error;
        }
    }

    /**
     * Simula consultas SQL quando o banco real não está disponível
     * @param {string} sql - Consulta SQL a ser simulada
     * @returns {Array} Resultados simulados
     */
    simulateQuery(sql) {
        const sqlLower = sql.toLowerCase().trim();
        
        // Simulação para SELECT * FROM cidadaos
        if (sqlLower.includes('select') && sqlLower.includes('cidadaos')) {
            const columns = ['id', 'nome', 'tipo', 'cor', 'cidade', 'idade', 'profissao', 'status'];
            let values = this.fallbackData.cidadaos.map(row => [
                row.id, row.nome, row.tipo, row.cor, row.cidade, row.idade, row.profissao, row.status
            ]);
            
            // Aplicar filtros WHERE
            if (sqlLower.includes('where')) {
                if (sqlLower.includes("status = 'desaparecido'") || sqlLower.includes('status="desaparecido"')) {
                    values = values.filter(row => row[7] === 'desaparecido');
                }
                if (sqlLower.includes("cidade = 'neon-city'") || sqlLower.includes('cidade="neon-city"')) {
                    values = values.filter(row => row[4] === 'Neon-City');
                }
                if (sqlLower.includes("tipo = 'androide'") || sqlLower.includes('tipo="androide"')) {
                    values = values.filter(row => row[2] === 'androide');
                }
                if (sqlLower.includes("idade >")) {
                    const match = sqlLower.match(/idade\s*>\s*(\d+)/);
                    if (match) {
                        const idade = parseInt(match[1]);
                        values = values.filter(row => row[5] > idade);
                    }
                }
            }
            
            // Selecionar colunas específicas
            if (!sqlLower.includes('select *')) {
                const selectedColumns = [];
                const selectedIndexes = [];
                
                if (sqlLower.includes('nome')) {
                    selectedColumns.push('nome');
                    selectedIndexes.push(1);
                }
                if (sqlLower.includes('tipo')) {
                    selectedColumns.push('tipo');
                    selectedIndexes.push(2);
                }
                if (sqlLower.includes('cidade')) {
                    selectedColumns.push('cidade');
                    selectedIndexes.push(4);
                }
                if (sqlLower.includes('idade')) {
                    selectedColumns.push('idade');
                    selectedIndexes.push(5);
                }
                if (sqlLower.includes('profissao')) {
                    selectedColumns.push('profissao');
                    selectedIndexes.push(6);
                }
                
                if (selectedColumns.length > 0) {
                    return [{
                        columns: selectedColumns,
                        values: values.map(row => selectedIndexes.map(i => row[i]))
                    }];
                }
            }
            
            return [{ columns, values }];
        }
        
        // Simulação para outras tabelas
        if (sqlLower.includes('veiculos')) {
            const columns = ['id', 'modelo', 'cor', 'proprietario_id', 'ano', 'tipo'];
            const values = this.fallbackData.veiculos.map(row => [
                row.id, row.modelo, row.cor, row.proprietario_id, row.ano, row.tipo
            ]);
            return [{ columns, values }];
        }
        
        if (sqlLower.includes('crimes')) {
            const columns = ['id', 'tipo', 'local', 'data_ocorrencia', 'suspeito_id', 'resolvido', 'descricao'];
            const values = this.fallbackData.crimes.map(row => [
                row.id, row.tipo, row.local, row.data_ocorrencia, row.suspeito_id, row.resolvido, row.descricao
            ]);
            return [{ columns, values }];
        }
        
        return [];
    }

    /**
     * Valida se uma consulta está correta para um caso específico
     * @param {string} sql - Consulta SQL a ser validada
     * @param {number} caseId - ID do caso
     * @returns {Object} Resultado da validação
     */
    validateQuery(sql, caseId) {
        try {
            const actualResults = this.executeQuery(sql);
            
            if (actualResults.length === 0) {
                return { isValid: false, message: 'A consulta não retornou resultados.' };
            }

            const result = actualResults[0];
            
            // Validação específica por caso
            switch (caseId) {
                case 1: // Caso 1: SELECT * FROM cidadaos
                    if (result.columns.length >= 7 && result.values.length >= 10) {
                        return { isValid: true, message: 'Excelente! Você encontrou todos os cidadãos registrados!' };
                    }
                    break;
                    
                case 2: // Caso 2: SELECT nome, tipo FROM cidadaos
                    if (result.columns.includes('nome') && result.columns.includes('tipo')) {
                        return { isValid: true, message: 'Perfeito! Agora você sabe como selecionar colunas específicas!' };
                    }
                    break;
                    
                case 3: // Caso 3: SELECT * FROM cidadaos WHERE status = 'desaparecido'
                    if (result.values.some(row => row.includes('desaparecido'))) {
                        return { isValid: true, message: 'Fantástico! Você encontrou o androide desaparecido!' };
                    }
                    break;
                    
                case 4: // Caso 4: SELECT * FROM cidadaos WHERE cidade = 'Neon-City'
                    if (result.values.every(row => row.includes('Neon-City'))) {
                        return { isValid: true, message: 'Excelente trabalho! Você filtrou os cidadãos de Neon-City!' };
                    }
                    break;
                    
                case 5: // Caso 5: SELECT * FROM cidadaos WHERE tipo = 'androide'
                    if (result.values.every(row => row.includes('androide'))) {
                        return { isValid: true, message: 'Perfeito! Você identificou todos os androides!' };
                    }
                    break;
                    
                case 6: // Caso 6: SELECT * FROM cidadaos WHERE idade > 30
                    if (result.values.every(row => row[5] > 30)) {
                        return { isValid: true, message: 'Excelente! Você filtrou por idade corretamente!' };
                    }
                    break;
            }

            return { isValid: false, message: 'A consulta não atende aos critérios do caso. Verifique o objetivo e tente novamente.' };
        } catch (error) {
            return { isValid: false, message: `Erro na consulta: ${error.message}` };
        }
    }

    /**
     * Obtém dicas baseadas no caso
     * @param {string} sql - Consulta SQL atual
     * @param {number} caseId - ID do caso
     * @returns {string} Dica para o caso
     */
    getHint(sql, caseId) {
        const hints = {
            1: "Lembre-se: para ver TODOS os dados de uma tabela, use SELECT * FROM nome_da_tabela",
            2: "Para selecionar colunas específicas, liste os nomes separados por vírgula: SELECT coluna1, coluna2 FROM tabela",
            3: "Use WHERE para filtrar resultados: SELECT * FROM tabela WHERE coluna = 'valor'",
            4: "Para filtrar por cidade, use: WHERE cidade = 'nome_da_cidade'",
            5: "Para filtrar por tipo, use: WHERE tipo = 'valor_do_tipo'",
            6: "Para comparações numéricas, use operadores como >, <, >=, <=: WHERE idade > 30",
            7: "Para JOIN entre tabelas: SELECT * FROM tabela1 JOIN tabela2 ON tabela1.id = tabela2.foreign_key",
            8: "Para contar registros: SELECT COUNT(*) FROM tabela",
            9: "Para agrupar dados: SELECT coluna, COUNT(*) FROM tabela GROUP BY coluna",
            10: "Para ordenar resultados: SELECT * FROM tabela ORDER BY coluna ASC/DESC",
            11: "Para subconsultas: SELECT * FROM tabela WHERE coluna IN (SELECT coluna FROM outra_tabela)",
            12: "Para casos complexos, combine WHERE, JOIN e outras cláusulas conforme necessário"
        };

        return hints[caseId] || "Verifique a sintaxe da sua consulta SQL e o objetivo do caso.";
    }

    /**
     * Obtém informações sobre as tabelas disponíveis
     * @returns {Object} Informações sobre as tabelas
     */
    getTableInfo() {
        return {
            cidadaos: {
                columns: ['id', 'nome', 'tipo', 'cor', 'cidade', 'idade', 'profissao', 'status'],
                description: 'Informações sobre todos os cidadãos da cidade cyberpunk'
            },
            veiculos: {
                columns: ['id', 'modelo', 'cor', 'proprietario_id', 'ano', 'tipo'],
                description: 'Veículos registrados e seus proprietários'
            },
            crimes: {
                columns: ['id', 'tipo', 'local', 'data_ocorrencia', 'suspeito_id', 'resolvido', 'descricao'],
                description: 'Crimes registrados no sistema'
            },
            evidencias: {
                columns: ['id', 'crime_id', 'tipo', 'descricao', 'encontrada_por', 'data_coleta'],
                description: 'Evidências coletadas para cada crime'
            }
        };
    }
}

// Instância global do banco de dados
window.gameDB = new GameDatabase();

// Função para inicializar o banco quando a página carregar
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.gameDB.initialize();
        console.log('🎮 Banco de dados do jogo pronto!');
    } catch (error) {
        console.error('❌ Falha ao inicializar banco:', error);
    }
});

