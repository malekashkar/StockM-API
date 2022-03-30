import { getModelForClass, index, prop } from "@typegoose/typegoose";

@index({ email: 1 })
export class DbUser {
    @prop({ unique: true })
    email: string;

    // Encrypt this
    @prop()
    password: string;

    @prop()
    createdAt: number;

    constructor(email: string, password: string, createdAt: number) {
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
    }
}

export const UserModel = getModelForClass(DbUser);