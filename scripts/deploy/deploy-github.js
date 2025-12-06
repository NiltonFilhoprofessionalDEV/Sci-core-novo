#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class GitHubDeployer {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  error(message) {
    this.log(`❌ ERRO: ${message}`, 'red');
  }

  success(message) {
    this.log(`✅ SUCESSO: ${message}`, 'green');
  }

  warning(message) {
    this.log(`⚠️  AVISO: ${message}`, 'yellow');
  }

  info(message) {
    this.log(`ℹ️  INFO: ${message}`, 'blue');
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve);
    });
  }

  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const result = execSync(command, { 
          encoding: 'utf8', 
          stdio: options.silent ? 'pipe' : 'inherit',
          ...options 
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async checkGitStatus() {
    try {
      await this.executeCommand('git --version', { silent: true });
      this.success('Git está instalado');
      return true;
    } catch (error) {
      this.error('Git não está instalado. Por favor, instale o Git primeiro.');
      return false;
    }
  }

  async checkIfGitRepo() {
    try {
      await this.executeCommand('git rev-parse --git-dir', { silent: true });
      return true;
    } catch (error) {
      return false;
    }
  }

  async initializeGitRepo() {
    try {
      this.info('Inicializando repositório Git...');
      await this.executeCommand('git init');
      this.success('Repositório Git inicializado');
      return true;
    } catch (error) {
      this.error(`Falha ao inicializar repositório Git: ${error.message}`);
      return false;
    }
  }

  async checkRemoteOrigin() {
    try {
      const result = await this.executeCommand('git remote get-url origin', { silent: true });
      return result.trim();
    } catch (error) {
      return null;
    }
  }

  async configureGitUser() {
    try {
      const userName = await this.executeCommand('git config user.name', { silent: true });
      const userEmail = await this.executeCommand('git config user.email', { silent: true });
      
      if (!userName.trim() || !userEmail.trim()) {
        this.warning('Configuração do Git incompleta');
        
        const name = await this.question('Digite seu nome para o Git: ');
        const email = await this.question('Digite seu email para o Git: ');
        
        await this.executeCommand(`git config user.name "${name}"`);
        await this.executeCommand(`git config user.email "${email}"`);
        
        this.success('Configuração do Git atualizada');
      } else {
        this.success(`Git configurado para: ${userName.trim()} (${userEmail.trim()})`);
      }
      return true;
    } catch (error) {
      this.error(`Erro ao configurar usuário Git: ${error.message}`);
      return false;
    }
  }

  async addAndCommitFiles() {
    try {
      this.info('Adicionando arquivos ao staging...');
      await this.executeCommand('git add .');
      
      const commitMessage = await this.question('Digite a mensagem do commit (ou pressione Enter para usar mensagem padrão): ');
      const message = commitMessage.trim() || `Deploy automático - ${new Date().toLocaleString('pt-BR')}`;
      
      this.info('Fazendo commit dos arquivos...');
      await this.executeCommand(`git commit -m "${message}"`);
      
      this.success('Arquivos commitados com sucesso');
      return true;
    } catch (error) {
      if (error.message.includes('nothing to commit')) {
        this.warning('Nenhuma alteração para commitar');
        return true;
      }
      this.error(`Erro ao fazer commit: ${error.message}`);
      return false;
    }
  }

  async setRemoteOrigin(repoUrl) {
    try {
      const existingRemote = await this.checkRemoteOrigin();
      
      if (existingRemote) {
        if (existingRemote === repoUrl) {
          this.info('Remote origin já configurado corretamente');
          return true;
        } else {
          this.info('Atualizando remote origin...');
          await this.executeCommand(`git remote set-url origin ${repoUrl}`);
        }
      } else {
        this.info('Adicionando remote origin...');
        await this.executeCommand(`git remote add origin ${repoUrl}`);
      }
      
      this.success('Remote origin configurado');
      return true;
    } catch (error) {
      this.error(`Erro ao configurar remote origin: ${error.message}`);
      return false;
    }
  }

  async pushToGitHub() {
    try {
      this.info('Enviando código para o GitHub...');
      
      // Primeiro, tentar fazer fetch para verificar se o repositório existe
      try {
        await this.executeCommand('git fetch origin', { silent: true });
      } catch (fetchError) {
        // Se o fetch falhar, pode ser que o repositório esteja vazio
        this.warning('Repositório remoto pode estar vazio ou inacessível');
      }

      // Tentar push
      await this.executeCommand('git push -u origin main');
      this.success('Código enviado para o GitHub com sucesso!');
      return true;
    } catch (error) {
      // Tentar com master se main falhar
      if (error.message.includes('main')) {
        try {
          this.warning('Branch main não existe, tentando com master...');
          await this.executeCommand('git push -u origin master');
          this.success('Código enviado para o GitHub com sucesso!');
          return true;
        } catch (masterError) {
          this.error(`Erro ao fazer push: ${masterError.message}`);
          return false;
        }
      }
      
      // Verificar se é erro de autenticação
      if (error.message.includes('Authentication failed') || 
          error.message.includes('Permission denied') ||
          error.message.includes('403')) {
        this.error('Falha de autenticação. Verifique suas credenciais do GitHub.');
        this.info('Consulte o arquivo GITHUB_SETUP.md para instruções de configuração.');
        return false;
      }
      
      // Verificar se há conflitos
      if (error.message.includes('rejected') || error.message.includes('non-fast-forward')) {
        this.error('Conflito detectado. O repositório remoto tem alterações que não estão no seu repositório local.');
        
        const forceChoice = await this.question('Deseja forçar o push? (CUIDADO: isso pode sobrescrever alterações remotas) [y/N]: ');
        if (forceChoice.toLowerCase() === 'y') {
          try {
            await this.executeCommand('git push -u origin main --force');
            this.success('Push forçado realizado com sucesso!');
            return true;
          } catch (forceError) {
            this.error(`Erro no push forçado: ${forceError.message}`);
            return false;
          }
        } else {
          this.info('Push cancelado. Execute "git pull origin main" para sincronizar antes de tentar novamente.');
          return false;
        }
      }
      
      this.error(`Erro ao fazer push: ${error.message}`);
      return false;
    }
  }

  async verifyDeployment(repoUrl) {
    this.info('Verificando deployment...');
    
    try {
      await this.executeCommand('git log --oneline -1', { silent: true });
      this.success('Último commit verificado localmente');
      
      this.info(`Verifique manualmente no GitHub: ${repoUrl}`);
      this.info('Confirme se todos os arquivos estão presentes no repositório remoto.');
      
      return true;
    } catch (error) {
      this.error(`Erro na verificação: ${error.message}`);
      return false;
    }
  }

  async run() {
    this.log('🚀 DEPLOY AUTOMÁTICO PARA GITHUB', 'bright');
    this.log('=====================================', 'bright');

    try {
      // 1. Verificar se Git está instalado
      if (!(await this.checkGitStatus())) {
        return;
      }

      // 2. Verificar se é um repositório Git
      if (!(await this.checkIfGitRepo())) {
        const initChoice = await this.question('Este não é um repositório Git. Deseja inicializar? [Y/n]: ');
        if (initChoice.toLowerCase() !== 'n') {
          if (!(await this.initializeGitRepo())) {
            return;
          }
        } else {
          this.error('Processo cancelado');
          return;
        }
      }

      // 3. Configurar usuário Git
      if (!(await this.configureGitUser())) {
        return;
      }

      // 4. Obter URL do repositório
      let repoUrl = await this.checkRemoteOrigin();
      
      if (!repoUrl) {
        repoUrl = await this.question('Digite a URL do repositório GitHub (ex: https://github.com/usuario/repo.git): ');
        if (!repoUrl.trim()) {
          this.error('URL do repositório é obrigatória');
          return;
        }
      } else {
        this.info(`Usando repositório existente: ${repoUrl}`);
        const changeRepo = await this.question('Deseja usar um repositório diferente? [y/N]: ');
        if (changeRepo.toLowerCase() === 'y') {
          repoUrl = await this.question('Digite a nova URL do repositório: ');
        }
      }

      // 5. Configurar remote origin
      if (!(await this.setRemoteOrigin(repoUrl))) {
        return;
      }

      // 6. Adicionar e commitar arquivos
      if (!(await this.addAndCommitFiles())) {
        return;
      }

      // 7. Fazer push para GitHub
      if (!(await this.pushToGitHub())) {
        return;
      }

      // 8. Verificar deployment
      await this.verifyDeployment(repoUrl);

      this.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!', 'green');
      this.log('=====================================', 'green');

    } catch (error) {
      this.error(`Erro inesperado: ${error.message}`);
    } finally {
      this.rl.close();
    }
  }
}

// Executar o deployer
if (require.main === module) {
  const deployer = new GitHubDeployer();
  deployer.run().catch(console.error);
}

module.exports = GitHubDeployer;