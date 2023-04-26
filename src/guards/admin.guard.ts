import { Injectable } from '@matchmakerjs/di';
import { RouteGuard, RouteObjection } from '@matchmakerjs/matchmaker';
import { RequestMetadata } from '@matchmakerjs/matchmaker-security';
import { IncomingMessage } from 'http';

@Injectable()
export class AdminGuard implements RouteGuard<IncomingMessage> {
    constructor(private requestMetadata: RequestMetadata) {}

    async findObjection(request: IncomingMessage): Promise<RouteObjection> {
        if (this.requestMetadata.userId === '1') {
            return;
        }
        return {
            statusCode: 403,
        };
    }
}
