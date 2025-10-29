import { supabase } from './supabase';

export interface SecurityViolation {
  userId: string;
  action: string;
  targetSecaoId: string;
  userSecaoId: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * Valida se o usuário tem acesso à base/seção especificada
 * @param userId ID do usuário
 * @param targetSecaoId ID da seção/base que o usuário quer acessar
 * @returns Promise<boolean> true se o usuário tem acesso, false caso contrário
 */
export async function validateUserBaseAccess(
  userId: string, 
  targetSecaoId: string
): Promise<boolean> {
  try {
    // Buscar o perfil do usuário para obter sua secao_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('secao_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Erro ao buscar perfil do usuário:', profileError);
      return false;
    }

    // Verificar se a seção do usuário corresponde à seção alvo
    return profile.secao_id === targetSecaoId;
  } catch (error) {
    console.error('Erro na validação de acesso à base:', error);
    return false;
  }
}

/**
 * Registra uma violação de segurança no sistema de logs
 * @param violation Dados da violação de segurança
 */
export async function logSecurityViolation(violation: SecurityViolation): Promise<void> {
  try {
    const { error } = await supabase
      .from('security_logs')
      .insert({
        user_id: violation.userId,
        action: violation.action,
        target_secao_id: violation.targetSecaoId,
        user_secao_id: violation.userSecaoId,
        ip_address: violation.ipAddress,
        user_agent: violation.userAgent,
        details: violation.details,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao registrar log de segurança:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar violação de segurança:', error);
  }
}

/**
 * Obtém o IP do cliente (funciona apenas no lado do cliente)
 */
export function getClientIP(): string | undefined {
  // No ambiente do navegador, não é possível obter o IP real do cliente
  // Esta função pode ser expandida para usar serviços externos se necessário
  return undefined;
}

/**
 * Obtém o User Agent do navegador
 */
export function getUserAgent(): string {
  if (typeof window !== 'undefined') {
    return window.navigator.userAgent;
  }
  return 'Unknown';
}

/**
 * Função utilitária para validar acesso e registrar violações
 * @param userId ID do usuário
 * @param targetSecaoId ID da seção/base alvo
 * @param action Ação que está sendo tentada
 * @param additionalDetails Detalhes adicionais para o log
 * @returns Promise<boolean> true se o acesso é permitido, false caso contrário
 */
export async function validateAndLogAccess(
  userId: string,
  targetSecaoId: string,
  action: string,
  additionalDetails?: Record<string, any>
): Promise<boolean> {
  const hasAccess = await validateUserBaseAccess(userId, targetSecaoId);
  
  if (!hasAccess) {
    // Buscar a secao_id real do usuário para o log
    const { data: profile } = await supabase
      .from('profiles')
      .select('secao_id')
      .eq('id', userId)
      .single();

    await logSecurityViolation({
      userId,
      action,
      targetSecaoId,
      userSecaoId: profile?.secao_id || 'unknown',
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
      details: {
        ...additionalDetails,
        timestamp: new Date().toISOString(),
        violation_type: 'unauthorized_base_access'
      }
    });
  }
  
  return hasAccess;
}

/**
 * Mensagem de erro padrão para violações de segurança
 */
export const SECURITY_ERROR_MESSAGE = 'Operação negada: você só pode cadastrar dados para sua base de origem.';

/**
 * Classe de erro personalizada para violações de segurança
 */
export class SecurityViolationError extends Error {
  constructor(message: string = SECURITY_ERROR_MESSAGE) {
    super(message);
    this.name = 'SecurityViolationError';
  }
}