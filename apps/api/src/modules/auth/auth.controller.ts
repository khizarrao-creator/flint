import { Controller, Post, Body, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Login endpoint for internal users (admin, managers, viewers)
     * Public endpoint - no authentication required
     */
    @Public()
    @Post('login')
    @HttpCode(200)
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    /**
     * Login endpoint for customer portal users
     * Public endpoint - no authentication required
     */
    @Public()
    @Post('portal/login')
    @HttpCode(200)
    async portalLogin(@Body() body: { subdomain: string, email: string, pass: string }) {
        const customer = await this.authService.validateCustomer(body.subdomain, body.email, body.pass);
        if (!customer) {
            throw new UnauthorizedException('Invalid credentials or access denied');
        }
        return this.authService.loginCustomer(customer);
    }
}
