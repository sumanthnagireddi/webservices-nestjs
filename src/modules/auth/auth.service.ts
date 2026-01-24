import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDataDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken } from './schemas/refresh-token-schema';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService,
        @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>
    ) { }

    async login(loginData: LoginDataDto) {
        const { email, password } = loginData;
        //verification
        const user = await this.userService.findOne(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        //password matching
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw new UnauthorizedException('Invalid credentials');
        }


        return this.generateToken(user._id);
    }

    async generateToken(userId: any) {
        const user: any = await this.userService.findByID(userId);
        const payload = { userId: user._id, email: user.email, };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = uuidv4();
        await this.storeRefreshToken(user._id, refreshToken);
        return {
            accessToken,
            refreshToken: refreshToken,
        }
    }

    async refreshAccessToken(refreshToken: string) {
        const token = await this.refreshTokenModel.findOne({ refreshToken: refreshToken, expiresAt: { $gt: new Date() } });
        if (!token) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        return this.generateToken(token.userId);
    }

    async storeRefreshToken(userId: string, refreshToken: string) {
        const refreshTokenDoc = {
            userId,
            refreshToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry   
        };
        await this.refreshTokenModel.findOneAndUpdate(
            { userId },
            refreshTokenDoc,
            { upsert: true, new: true }
        );
    }

    logout(userId: string) {
        return this.refreshTokenModel.findOneAndDelete({ userId });
    }
}
