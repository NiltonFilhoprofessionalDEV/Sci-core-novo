// =====================================================
// HOOK PARA GERENCIAMENTO DE PERMISSÕES
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

import { useMemo } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { 
  UserProfile, 
  PermissaoUsuario, 
  getPermissoes,
  isGestorPOP,
  isGerenteSecao,
  isBACE 
} from '@/types/auth'

export function usePermissions() {
  const { profile } = useAuthContext()

  const permissions = useMemo(() => {
    return getPermissoes(profile)
  }, [profile])

  const canViewAllSections = useMemo(() => {
    return isGestorPOP(profile)
  }, [profile])

  const canViewOwnSection = useMemo(() => {
    return profile?.ativo && (isGestorPOP(profile) || isGerenteSecao(profile) || isBACE(profile))
  }, [profile])

  const canFillIndicators = useMemo(() => {
    return isBACE(profile)
  }, [profile])

  const canManageIndicators = useMemo(() => {
    return isGestorPOP(profile)
  }, [profile])

  const canViewSection = (sectionId: string): boolean => {
    if (!profile?.ativo) return false
    
    if (isGestorPOP(profile)) return true
    
    if (isGerenteSecao(profile) || isBACE(profile)) {
      return profile.secao_id === sectionId
    }
    
    return false
  }

  const canViewTeam = (teamId: string): boolean => {
    if (!profile?.ativo) return false
    
    if (isGestorPOP(profile)) return true
    
    if (isGerenteSecao(profile)) {
      // Gerente pode ver todas as equipes da sua seção
      return true // Será validado pela seção no backend
    }
    
    if (isBACE(profile)) {
      return profile.equipe_id === teamId
    }
    
    return false
  }

  const getVisibleSections = (): string[] => {
    if (!profile?.ativo) return []
    
    if (isGestorPOP(profile)) {
      return [] // Retorna vazio para indicar "todas as seções"
    }
    
    if (profile.secao_id) {
      return [profile.secao_id]
    }
    
    return []
  }

  const getVisibleTeams = (): string[] => {
    if (!profile?.ativo) return []
    
    if (isGestorPOP(profile)) {
      return [] // Retorna vazio para indicar "todas as equipes"
    }
    
    if (isGerenteSecao(profile)) {
      return [] // Retorna vazio para indicar "todas as equipes da seção"
    }
    
    if (isBACE(profile) && profile.equipe_id) {
      return [profile.equipe_id]
    }
    
    return []
  }

  const getUserDisplayInfo = () => {
    if (!profile) return null

    let displayText = profile.nome_completo
    let roleText = ''
    let contextText = ''

    switch (profile.perfil) {
      case 'gestor_pop':
        roleText = 'Gestor POP'
        contextText = 'Todas as Seções'
        break
      case 'gerente_secao':
        roleText = 'Gerente de Seção'
        contextText = profile.secao?.nome || 'Seção não definida'
        break
      case 'ba_ce':
        roleText = 'BA-CE'
        contextText = `${profile.equipe?.nome || 'Equipe'} - ${profile.secao?.nome || 'Seção'}`
        break
    }

    return {
      nome: displayText,
      perfil: roleText,
      contexto: contextText,
      email: profile.email
    }
  }

  return {
    profile,
    permissions,
    canViewAllSections,
    canViewOwnSection,
    canFillIndicators,
    canManageIndicators,
    canViewSection,
    canViewTeam,
    getVisibleSections,
    getVisibleTeams,
    getUserDisplayInfo,
    isGestorPOP: isGestorPOP(profile),
    isGerenteSecao: isGerenteSecao(profile),
    isBACE: isBACE(profile)
  }
}