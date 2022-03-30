export interface AccessTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
  }
  
  export interface MemberResponse {
    user: Pick<
      UserResponse,
      "id" | "username" | "avatar" | "discriminator" | "public_flags"
    >;
    roles: string[];
    nick?: string;
    premium_since?: string;
    joined_at?: string;
    is_pending: boolean;
    mute: boolean;
    deaf: boolean;
  }
  
  export interface UserResponse {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    email: string;
    verified: boolean;
    locale: string;
    mfa_enabled: boolean;
    premium_type: 0 | 1 | 2;
  }
  
  export const Oauth2Scopes = [
    "identify",
    "email",
    "connections",
    "guilds",
    "guilds.join",
    "gdm.join",
    "rpc",
    "rpc.notifications.read",
    "bot",
    "webhook.incoming",
    "messages.read",
    "applications.builds.upload",
    "applications.builds.read",
    "applications.store.update",
    "applications.entitlements",
    "activities.read",
    "activities.write",
    "relationships.read",
  ] as const;
  
  export type Oauth2Scope = typeof Oauth2Scopes[number];