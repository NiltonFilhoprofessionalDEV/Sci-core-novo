
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** Sci-core-novo
- **Date:** 2025-11-15
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** Autenticação com credenciais válidas
- **Test Code:** [TC001_Autenticao_com_credenciais_vlidas.py](./TC001_Autenticao_com_credenciais_vlidas.py)
- **Test Error:** The system failed to authenticate the user with valid Gestor POP credentials, showing an 'Email ou senha incorretos' error. The issue has been reported, and the task is now complete. Further testing of session persistence and profile assignment is blocked until the issue is resolved.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/67c3e4aa-1a18-4a9c-9ffc-a42ca81330e9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** Falha na autenticação com credenciais inválidas
- **Test Code:** [TC002_Falha_na_autenticao_com_credenciais_invlidas.py](./TC002_Falha_na_autenticao_com_credenciais_invlidas.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/6c9dd566-bf38-4901-beda-4613711c43eb
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** Isolamento de dados via Row Level Security para perfil BA-CE
- **Test Code:** [TC003_Isolamento_de_dados_via_Row_Level_Security_para_perfil_BA_CE.py](./TC003_Isolamento_de_dados_via_Row_Level_Security_para_perfil_BA_CE.py)
- **Test Error:** The task to verify that users with BA-CE profile only see and access indicators related to their section and team according to Row Level Security rules could not be completed. The login attempt with provided credentials failed due to incorrect email or password, preventing access to the dashboard and further verification steps. Valid credentials are required to proceed with this test.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/a5c35659-bcc8-4979-adcf-0dca30359956
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** Preenchimento e salvamento de indicador com validação e cálculo automático
- **Test Code:** [TC004_Preenchimento_e_salvamento_de_indicador_com_validao_e_clculo_automtico.py](./TC004_Preenchimento_e_salvamento_de_indicador_com_validao_e_clculo_automtico.py)
- **Test Error:** Testing stopped due to critical runtime error on password recovery page preventing user authentication. Login attempts failed and password recovery is broken. Please fix the issue to continue testing the indicator filling workflow.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
[WARNING] [Fast Refresh] performing full reload

Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.
You might have a file which exports a React component but also exports a value that is imported by a non-React component file.
Consider migrating the non-React component export to a separate file and importing it into both files.

It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.
Fast Refresh requires at least one parent function component in your React tree. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/dev/hot-reloader/app/hot-reloader-app.js:111:24)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/forgot-password:0:0)
[WARNING] The resource http://localhost:3000/_next/static/css/app/layout.css?v=1763250189122 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally. (at http://localhost:3000/forgot-password:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/c4e7c13d-e6dd-4794-874c-85f1a0f6c745
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Validação de formulário rejeita dados inválidos
- **Test Code:** [TC005_Validao_de_formulrio_rejeita_dados_invlidos.py](./TC005_Validao_de_formulrio_rejeita_dados_invlidos.py)
- **Test Error:** Login failed due to incorrect credentials. Cannot proceed with testing the indicator form validation. Please provide valid login credentials to continue testing.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/9468891d-b333-4705-811e-6f1e0c93888f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Visualização de dashboard com 14 tipos de gráficos interativos
- **Test Code:** [TC006_Visualizao_de_dashboard_com_14_tipos_de_grficos_interativos.py](./TC006_Visualizao_de_dashboard_com_14_tipos_de_grficos_interativos.py)
- **Test Error:** The task to verify the dashboard with 14 types of indicators and interactive charts could not be completed because the user could not authenticate due to incorrect login credentials. The issue has been reported. Please provide valid credentials or fix the authentication issue to proceed with the dashboard verification.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/0867fb51-cd2b-43b1-985d-5d9d55377c60
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Consulta histórica: aplicação de filtros avançados com paginação e cache
- **Test Code:** [TC007_Consulta_histrica_aplicao_de_filtros_avanados_com_paginao_e_cache.py](./TC007_Consulta_histrica_aplicao_de_filtros_avanados_com_paginao_e_cache.py)
- **Test Error:** Login failed due to incorrect credentials. Cannot proceed with testing the historical query module without valid login. Please provide valid credentials or access method.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/d9bb27f4-f79f-4a00-af70-82cce41acd3e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Sistema de cache com stale time e debounce para otimização de performance
- **Test Code:** [TC008_Sistema_de_cache_com_stale_time_e_debounce_para_otimizao_de_performance.py](./TC008_Sistema_de_cache_com_stale_time_e_debounce_para_otimizao_de_performance.py)
- **Test Error:** Login attempt failed due to incorrect credentials. Please provide valid login credentials to proceed with testing the cache system as per the task instructions.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/ef34be20-e012-4fac-ae38-4436da1e3093
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Tratamento de erros com mensagens amigáveis e retry automático
- **Test Code:** [TC009_Tratamento_de_erros_com_mensagens_amigveis_e_retry_automtico.py](./TC009_Tratamento_de_erros_com_mensagens_amigveis_e_retry_automtico.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/6523fe00-04ca-43b0-a408-eeb9b929ad20
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Interface responsiva do layout principal em vários dispositivos
- **Test Code:** [TC010_Interface_responsiva_do_layout_principal_em_vrios_dispositivos.py](./TC010_Interface_responsiva_do_layout_principal_em_vrios_dispositivos.py)
- **Test Error:** The login failure issue was reported due to incorrect credentials, preventing access to the dashboard and layout testing. Further testing cannot proceed without valid login. Task is now complete.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/4d30894c-975c-493a-bf57-f119bdcdd819
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** Cálculo correto de métricas operacionais e KPIs no dashboard
- **Test Code:** [TC011_Clculo_correto_de_mtricas_operacionais_e_KPIs_no_dashboard.py](./TC011_Clculo_correto_de_mtricas_operacionais_e_KPIs_no_dashboard.py)
- **Test Error:** The task to verify if the calculations and displays of metrics and KPIs are accurate based on the filled and updated data cannot proceed because access to the system is blocked by repeated failed login attempts. Multiple sets of credentials were tried without success, and the system consistently shows the error 'Email ou senha incorretos'. To continue, valid login credentials are required. Please provide valid credentials or instructions to proceed with login. Task stopped at login stage.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/8c7c864a-70a5-4484-a675-cfefe204f189
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Navegação entre abas e filtros aplicados atualizam dashboard com alta performance
- **Test Code:** [TC012_Navegao_entre_abas_e_filtros_aplicados_atualizam_dashboard_com_alta_performance.py](./TC012_Navegao_entre_abas_e_filtros_aplicados_atualizam_dashboard_com_alta_performance.py)
- **Test Error:** Login failed due to incorrect credentials. Cannot proceed with dashboard navigation and filter update tests. Task stopped.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/d0cbe23d-f24a-40b7-9de4-8111a7d845eb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** Acesso restrito: tentar acessar funcionalidade sem permissão
- **Test Code:** [TC013_Acesso_restrito_tentar_acessar_funcionalidade_sem_permisso.py](./TC013_Acesso_restrito_tentar_acessar_funcionalidade_sem_permisso.py)
- **Test Error:** Authentication failed for Gerente de Seção user despite multiple attempts. Unable to proceed with testing access restrictions. Reporting the issue and stopping further actions.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/d5793c19-b294-4523-809c-db31a71f21cd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** Componente UI reutilizável: consistência visual e funcionalidade do botão
- **Test Code:** [TC014_Componente_UI_reutilizvel_consistncia_visual_e_funcionalidade_do_boto.py](./TC014_Componente_UI_reutilizvel_consistncia_visual_e_funcionalidade_do_boto.py)
- **Test Error:** Testing of reusable button hover state cannot proceed due to lack of hover simulation support. Click interaction and disabled state testing remain incomplete. Stopping further testing as per instructions.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/5e9843b9-c377-4cd3-93b5-34b406633e4d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** Logout e encerramento de sessão
- **Test Code:** [TC015_Logout_e_encerramento_de_sesso.py](./TC015_Logout_e_encerramento_de_sesso.py)
- **Test Error:** Login failed due to invalid credentials. Cannot proceed with logout test without successful authentication. Please provide valid login credentials to continue.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://ekhuhyervzndsatdngyl.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] ❌ useAuth - Erro no login: AuthApiError: Invalid login credentials
    at handleError (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:71:11)
    at async _handleRequest (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:114:9)
    at async _request (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/lib/fetch.js:96:18)
    at async SupabaseAuthClient.signInWithPassword (webpack-internal:///(app-pages-browser)/./node_modules/@supabase/auth-js/dist/module/GoTrueClient.js:397:23)
    at async signIn (webpack-internal:///(app-pages-browser)/./src/hooks/useAuth.ts:240:37)
    at async onSubmit (webpack-internal:///(app-pages-browser)/./src/app/login/page.tsx:47:31)
    at async eval (webpack-internal:///(app-pages-browser)/./node_modules/react-hook-form/dist/index.esm.mjs:2104:17) (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/userspace/app/errors/intercept-console-error.js:56:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/c33bf0d8-4b22-423f-94c5-ae3be34aeebf/7ed4439e-948e-4d63-b526-4739f38712b0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **13.33** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---