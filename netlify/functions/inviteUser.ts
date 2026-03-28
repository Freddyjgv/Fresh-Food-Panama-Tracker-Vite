import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { optionsResponse, getUserAndProfile, isPrivilegedRole } from './_util';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    // SEGURIDAD: Validamos que el que invita sea un Admin autorizado
    const { user: adminUser, profile: adminProfile } = await getUserAndProfile(event);
    if (!adminUser || !adminProfile || !isPrivilegedRole(adminProfile.role)) {
      return { statusCode: 403, body: JSON.stringify({ message: "No autorizado para autorizar usuarios" }) };
    }

    const { email, full_name, role, client_id } = JSON.parse(event.body || '{}');

    if (!email || !full_name) {
      return { statusCode: 400, body: JSON.stringify({ message: "Email y Nombre son requeridos" }) };
    }

    // Determinar la URL de redirección basada en tu nuevo dominio
    const siteUrl = "https://fresh-connect-v.netlify.app";
    const redirectTo = `${siteUrl}/auth/reset`;

    // 1. Invitación oficial de Supabase Auth
    // Aquí es donde el Admin "Autoriza" al usuario al disparar este proceso
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: { 
          full_name: full_name,
          role: role || 'client'
        },
        redirectTo: redirectTo // ACTIVADO para tu nuevo dominio
      }
    );

    if (inviteError) throw inviteError;

    // 2. Vincular con la tabla de Clientes
    if (role === 'client' && client_id) {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          has_platform_access: true, // Ahora el cliente tiene permiso de entrar
          auth_user_id: inviteData.user.id,
          status: 'active'
        })
        .eq('id', client_id);

      if (updateError) throw updateError;
    }

    // 3. Si es STAFF (Admin/Superadmin), crear su perfil de acceso
    if (role === 'admin' || role === 'superadmin') {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: inviteData.user.id,
          full_name,
          role,
          email
        }, { onConflict: 'user_id' });
        
      if (profileError) throw profileError;
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: `Usuario autorizado e invitación enviada a ${email}`,
        user_id: inviteData.user.id 
      }),
    };

  } catch (error: any) {
    console.error("Error en inviteUser:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};