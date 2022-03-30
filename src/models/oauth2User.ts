import {
    DocumentType,
    getModelForClass,
    index,
    prop,
    ReturnModelType,
  } from "@typegoose/typegoose";
  
  import {
    AccessTokenResponse,
    Oauth2Scope,
    Oauth2Scopes,
    UserResponse,
  } from "../types";
  
  @index({ accessToken: 1 })
  export class Oauth2TokenDetails {
    @prop({ required: true })
    accessToken: string;
    @prop({ required: true })
    expiresAt: Date;
    @prop({ required: true })
    refreshToken: string;
    @prop({ type: String, enum: Oauth2Scopes, required: true })
    scopes: Oauth2Scope[];
    @prop({ required: true })
    tokenType: string;
  
    constructor(
      accessToken: string,
      expiresAt: Date,
      refreshToken: string,
      scopes: Oauth2Scope[],
      tokenType: string
    ) {
      this.accessToken = accessToken;
      this.expiresAt = expiresAt;
      this.refreshToken = refreshToken;
      this.scopes = scopes;
      this.tokenType = tokenType;
    }
  
    static fromAccessTokenResponse(accessTokenResponse: AccessTokenResponse) {
      return new Oauth2TokenDetails(
        accessTokenResponse.access_token,
        new Date(Date.now() + accessTokenResponse.expires_in * 1000),
        accessTokenResponse.refresh_token,
        accessTokenResponse.scope.split(" ") as Oauth2Scope[],
        accessTokenResponse.token_type
      );
    }
  }
  
  export default class Oauth2User {
    @prop({ required: true, unique: true })
    id: string;
  
    @prop({ index: true })
    username?: string;
  
    @prop({ index: true })
    discriminator?: string;
  
    @prop()
    email?: string;
  
    @prop()
    verified?: boolean;
  
    @prop({ type: Oauth2TokenDetails })
    tokenDetails?: Oauth2TokenDetails;
  
    @prop({ default: false })
    isMember: boolean;
  
    constructor(id: string) {
      this.id = id;
    }
  
    static async getOrCreate(
      this: ReturnModelType<typeof Oauth2User>,
      id: string
    ) {
      const user = await this.findOne({ id });
      if (!user) return await this.create(new Oauth2User(id));
      return user;
    }
  
    serializeUserResponse(
      this: DocumentType<Oauth2User>,
      userResponse: UserResponse
    ) {
      this.email = userResponse.email;
      this.discriminator = userResponse.discriminator;
      this.username = userResponse.username;
      this.verified = userResponse.verified;
    }
  
    serializeAccessTokenResponse(
      this: DocumentType<Oauth2User>,
      accessTokenResponse: AccessTokenResponse
    ) {
      this.tokenDetails = Oauth2TokenDetails.fromAccessTokenResponse(
        accessTokenResponse
      );
    }
  }
  
  export const Oauth2UserModel = getModelForClass(Oauth2User);