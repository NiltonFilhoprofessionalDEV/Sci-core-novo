// =====================================================
// TIPOS PARA SISTEMA DE AUTENTICAÇÃO E PERFIS
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

export type PerfilUsuario = 'gestor_pop' | 'gerente_secao' | 'ba_ce' | 'ba_op'

export interface Secao {
  id: string
  nome: string
  codigo: string
  cidade: string
  estado: string
  // Alguns selects/UI do frontend usam um campo "localizacao" já formatado (ex.: "Cidade/UF").
  // Mantemos como opcional para compatibilidade.
  localizacao?: string
  ativa: boolean
  created_at: string
  updated_at: string
}

export interface Equipe {
  id: string
  secao_id: string
  nome: string
  codigo: string
  ativa: boolean
  created_at: string
  updated_at: string
  secao?: Secao
}

export interface UserProfile {
  id: string
  email: string
  nome_completo: string
  perfil: PerfilUsuario
  secao_id?: string
  equipe_id?: string
  ativo: boolean
  last_login?: string
  created_at: string
  updated_at: string
  secao?: Secao
  equipe?: Equipe
}

export interface AuthUser {
  id: string
  email: string
  profile?: UserProfile
}

export interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  session: any
  loading: boolean
  error: string | null
  rememberMe: boolean
  signIn: (email: string, password: string, remember?: boolean) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

// Tipos para permissões
export interface PermissaoUsuario {
  podeVerTodasSecoes: boolean
  podeVerSuaSecao: boolean
  podePreencherIndicadores: boolean
  podeGerenciarIndicadores: boolean
  secoesVisiveis: string[]
  equipesVisiveis: string[]
}

// Tipos para indicadores
export type FrequenciaIndicador = 'evento' | 'diario' | 'mensal'
export type TipoDados = 'tempo' | 'data' | 'texto' | 'numero' | 'boolean'

export interface Indicador {
  id: string
  nome: string
  descricao?: string
  categoria: string
  frequencia: FrequenciaIndicador
  tipo_dados: TipoDados
  unidade_medida?: string
  obrigatorio: boolean
  ativo: boolean
  ordem_exibicao: number
  created_at: string
  updated_at: string
}

export interface Preenchimento {
  id: string
  indicador_id: string
  usuario_id: string
  secao_id: string
  equipe_id?: string
  valor_texto?: string
  valor_numero?: number
  valor_data?: string
  valor_tempo?: string
  valor_boolean?: boolean
  data_referencia: string
  observacoes?: string
  created_at: string
  updated_at: string
  indicador?: Indicador
  usuario?: UserProfile
  secao?: Secao
  equipe?: Equipe
}

// Utilitários para verificação de permissões
export const isGestorPOP = (profile: UserProfile | null): boolean => {
  return profile?.perfil === 'gestor_pop' && profile?.ativo === true
}

export const isGerenteSecao = (profile: UserProfile | null): boolean => {
  return profile?.perfil === 'gerente_secao' && profile?.ativo === true
}

export const isBACE = (profile: UserProfile | null): boolean => {
  return profile?.perfil === 'ba_ce' && profile?.ativo === true
}

export const getPermissoes = (profile: UserProfile | null): PermissaoUsuario => {
  if (!profile || !profile.ativo) {
    return {
      podeVerTodasSecoes: false,
      podeVerSuaSecao: false,
      podePreencherIndicadores: false,
      podeGerenciarIndicadores: false,
      secoesVisiveis: [],
      equipesVisiveis: []
    }
  }

  switch (profile.perfil) {
    case 'gestor_pop':
      return {
        podeVerTodasSecoes: true,
        podeVerSuaSecao: true,
        podePreencherIndicadores: false,
        podeGerenciarIndicadores: true,
        secoesVisiveis: [], // Será preenchido dinamicamente
        equipesVisiveis: []
      }
    
    case 'gerente_secao':
      return {
        podeVerTodasSecoes: false,
        podeVerSuaSecao: true,
        podePreencherIndicadores: false,
        podeGerenciarIndicadores: false,
        secoesVisiveis: profile.secao_id ? [profile.secao_id] : [],
        equipesVisiveis: []
      }
    
    case 'ba_ce':
      return {
        podeVerTodasSecoes: false,
        podeVerSuaSecao: true,
        podePreencherIndicadores: true,
        podeGerenciarIndicadores: false,
        secoesVisiveis: profile.secao_id ? [profile.secao_id] : [],
        equipesVisiveis: profile.equipe_id ? [profile.equipe_id] : []
      }
    case 'ba_op':
      return {
        podeVerTodasSecoes: false,
        podeVerSuaSecao: true,
        podePreencherIndicadores: true,
        podeGerenciarIndicadores: false,
        secoesVisiveis: profile.secao_id ? [profile.secao_id] : [],
        equipesVisiveis: profile.equipe_id ? [profile.equipe_id] : []
      }
    
    default:
      return {
        podeVerTodasSecoes: false,
        podeVerSuaSecao: false,
        podePreencherIndicadores: false,
        podeGerenciarIndicadores: false,
        secoesVisiveis: [],
        equipesVisiveis: []
      }
  }
}

export const getPerfilDisplayName = (perfil: PerfilUsuario): string => {
  switch (perfil) {
    case 'gestor_pop':
      return 'Gestor POP'
    case 'gerente_secao':
      return 'Gerente de Seção'
    case 'ba_ce':
      return 'Bombeiro de Aeródromo - Chefe de Equipe'
    case 'ba_op':
      return 'Bombeiro de Aeródromo - Operador'
    default:
      return 'Usuário'
  }
}