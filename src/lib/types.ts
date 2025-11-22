export interface Perfil {
  id: string;
  username: string;
  email: string;
  nombre?: string;
  edad?: number;
  ubicacion?: string;
  avatar_url?: string;
  bio?: string;
  preferencias_notificacion?: any;
  intereses?: any;
  interes_otro?: string;
  verificado: boolean;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PerfilComplementario {
  id: string;
  id_perfil: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  ocupacion?: string;
  empresa?: string;
  sitio_web?: string;
  redes_sociales?: any;
  idiomas?: any;
  nivel_educacion?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends Perfil {
  perfil_complementario?: PerfilComplementario;
}

export interface CreatePerfilData {
  username: string;
  email: string;
  verificado?: boolean;
  completed?: boolean;
}

export interface UpdatePerfilData {
  nombre?: string;
  edad?: number;
  ubicacion?: string;
  bio?: string;
  preferencias_notificacion?: any;
  intereses?: any;
  interes_otro?: string;
  avatar_url?: string;
}

export interface CreatePerfilComplementarioData {
  id_perfil: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  ocupacion?: string;
  empresa?: string;
  sitio_web?: string;
  redes_sociales?: any;
  idiomas?: any;
  nivel_educacion?: string;
}

export interface UpdatePerfilComplementarioData {
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  ocupacion?: string;
  empresa?: string;
  sitio_web?: string;
  redes_sociales?: any;
  idiomas?: any;
  nivel_educacion?: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: any;
  session: any;
}

// User Search and Follow Types
export interface UserSearchResult {
  id: string;
  username: string;
  nombre: string;
  email: string;
  avatar_url?: string;
  edad?: number;
  ubicacion?: string;
  is_following?: boolean;
}
