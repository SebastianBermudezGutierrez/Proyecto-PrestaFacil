import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import {
  createClient,
  type User,
} from "@supabase/supabase-js";

@Injectable()
export class SupabaseAuthService {
  private readonly supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Faltan las variables de configuración de Supabase",
      );
    }

    this.supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  async verifyAccessToken(token: string): Promise<User> {
    const { data, error } =
      await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException(
        "Token inválido o sesión expirada",
      );
    }

    return data.user;
  }
}
